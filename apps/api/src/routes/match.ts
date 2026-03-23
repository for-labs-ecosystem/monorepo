import { Hono } from "hono";
import { eq, and, sql, inArray } from "drizzle-orm";
import { products, siteProductOverrides, articles, siteArticleOverrides, articleRelatedProducts } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

interface MatchStepInput {
    field_key: string;
    match_tags: string[];
}

interface MatchRequest {
    // New dynamic format
    steps?: MatchStepInput[];
    // Legacy fixed format (backward compat)
    sectors?: string[];
    analysis_types?: string[];
    automation_level?: string;
    budget_class?: string;
    compliance?: string[];
}

interface ScoredProduct {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    image_url: string | null;
    price: number | null;
    currency: string;
    brand: string | null;
    application_areas: string | null;
    analysis_types: string | null;
    automation_level: string | null;
    compliance_tags: string | null;
    tags: string | null;
    category_id: number | null;
    score: number;
    matched_criteria: string[];
}

interface ScoredArticle {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    tags: string | null;
    score: number;
    matched_via: string;
}

/**
 * Parse a JSON text field safely into a string array.
 */
function parseJsonArray(raw: string | null): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

/**
 * Check if any of the search terms appear (case-insensitive, partial) in the target array.
 * Returns the list of matched terms.
 */
function findMatches(searchTerms: string[], targetArray: string[]): string[] {
    const matched: string[] = [];
    for (const term of searchTerms) {
        const lower = term.toLowerCase();
        for (const target of targetArray) {
            if (target.toLowerCase().includes(lower) || lower.includes(target.toLowerCase())) {
                matched.push(term);
                break;
            }
        }
    }
    return matched;
}

/**
 * Determine budget class from price.
 */
function getBudgetClass(price: number | null): string | null {
    if (price === null || price === undefined) return null;
    if (price < 1000) return "entry";
    if (price < 10000) return "mid";
    return "premium";
}

const matchRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * Normalize incoming request: convert legacy fixed-field format to dynamic steps[].
 */
function normalizeToSteps(body: MatchRequest): MatchStepInput[] {
    if (body.steps && body.steps.length > 0) {
        return body.steps.filter((s) => s.match_tags && s.match_tags.length > 0);
    }
    // Legacy format → convert to steps
    const steps: MatchStepInput[] = [];
    if (body.sectors && body.sectors.length > 0) {
        steps.push({ field_key: "sectors", match_tags: body.sectors });
    }
    if (body.analysis_types && body.analysis_types.length > 0) {
        steps.push({ field_key: "analysis_types", match_tags: body.analysis_types });
    }
    if (body.compliance && body.compliance.length > 0) {
        steps.push({ field_key: "compliance", match_tags: body.compliance });
    }
    if (body.automation_level) {
        steps.push({ field_key: "automation_level", match_tags: [body.automation_level] });
    }
    if (body.budget_class) {
        steps.push({ field_key: "budget_class", match_tags: [body.budget_class] });
    }
    return steps;
}

/**
 * Score a single step against a product. Returns score delta and criteria label.
 */
function scoreStep(
    step: MatchStepInput,
    product: {
        application_areas: string | null;
        analysis_types: string | null;
        tags: string | null;
        compliance_tags: string | null;
        automation_level: string | null;
        price: number | null;
    }
): { score: number; label: string | null } {
    const tags = step.match_tags;
    if (!tags || tags.length === 0) return { score: 0, label: null };

    switch (step.field_key) {
        case "sectors": {
            const areas = parseJsonArray(product.application_areas);
            const matches = findMatches(tags, areas);
            if (matches.length > 0) {
                return { score: matches.length, label: `Sektör: ${matches.join(", ")}` };
            }
            return { score: 0, label: null };
        }
        case "analysis_types": {
            const types = parseJsonArray(product.analysis_types);
            const tagsFallback = parseJsonArray(product.tags);
            const allTargets = [...types, ...tagsFallback];
            const matches = findMatches(tags, allTargets);
            if (matches.length > 0) {
                return { score: matches.length, label: `Analiz: ${matches.join(", ")}` };
            }
            return { score: 0, label: null };
        }
        case "compliance": {
            const certs = parseJsonArray(product.compliance_tags);
            const matches = findMatches(tags, certs);
            if (matches.length > 0) {
                return { score: matches.length, label: `Uyumluluk: ${matches.join(", ")}` };
            }
            return { score: 0, label: null };
        }
        case "automation_level": {
            if (product.automation_level && tags[0] && product.automation_level === tags[0]) {
                return { score: 2, label: `Otomasyon: ${tags[0]}` };
            }
            return { score: 0, label: null };
        }
        case "budget_class": {
            const productBudget = getBudgetClass(product.price);
            if (productBudget && tags[0] && productBudget === tags[0]) {
                return { score: 1, label: `Bütçe: ${tags[0]}` };
            }
            return { score: 0, label: null };
        }
        default: {
            // Custom field_key → broad search in tags + application_areas
            const productTags = parseJsonArray(product.tags);
            const productAreas = parseJsonArray(product.application_areas);
            const allTargets = [...productTags, ...productAreas];
            const matches = findMatches(tags, allTargets);
            if (matches.length > 0) {
                return { score: matches.length, label: `${step.field_key}: ${matches.join(", ")}` };
            }
            return { score: 0, label: null };
        }
    }
}

/**
 * POST /api/match
 * 
 * Intelligence Platform matching endpoint.
 * Accepts dynamic steps with match_tags and returns scored products + related articles.
 * Also supports legacy format for backward compatibility.
 * 
 * New format:
 * { steps: [{ field_key: "sectors", match_tags: ["Gıda Endüstrisi"] }, ...] }
 * 
 * Legacy format:
 * { sectors?: string[], analysis_types?: string[], automation_level?: string, ... }
 */
matchRoute.post("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);
    const body = await c.req.json<MatchRequest>();

    const steps = normalizeToSteps(body);

    // 1. Fetch all active + visible products for this site (with COALESCE inheritance)
    const allProducts = await db
        .select({
            id: products.id,
            slug: products.slug,
            title: sql<string>`COALESCE(${siteProductOverrides.title}, ${products.title})`,
            description: sql<string>`COALESCE(${siteProductOverrides.description}, ${products.description})`,
            image_url: sql<string>`COALESCE(${siteProductOverrides.image_url}, ${products.image_url})`,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
            currency: sql<string>`COALESCE(${siteProductOverrides.currency}, ${products.currency})`,
            brand: products.brand,
            application_areas: products.application_areas,
            analysis_types: products.analysis_types,
            automation_level: products.automation_level,
            compliance_tags: products.compliance_tags,
            tags: products.tags,
            category_id: products.category_id,
        })
        .from(products)
        .leftJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(products.is_active, true),
                sql`COALESCE(${siteProductOverrides.is_visible}, 1) = 1`
            )
        );

    // 2. Score each product using dynamic steps
    const scoredProducts: ScoredProduct[] = [];

    for (const product of allProducts) {
        let score = 0;
        const matched_criteria: string[] = [];

        for (const step of steps) {
            const result = scoreStep(step, product);
            if (result.score > 0) {
                score += result.score;
                if (result.label) matched_criteria.push(result.label);
            }
        }

        // Only include products with at least 1 match
        if (score > 0) {
            scoredProducts.push({
                ...product,
                score,
                matched_criteria,
            });
        }
    }

    // Sort by score descending
    scoredProducts.sort((a, b) => b.score - a.score);

    // 3. Get related articles for matched products
    const matchedProductIds = scoredProducts.map((p) => p.id);
    let scoredArticles: ScoredArticle[] = [];

    if (matchedProductIds.length > 0) {
        // Fetch junction rows using Drizzle inArray
        const junctionRows = await db
            .select({
                article_id: articleRelatedProducts.article_id,
                product_id: articleRelatedProducts.product_id,
            })
            .from(articleRelatedProducts)
            .where(inArray(articleRelatedProducts.product_id, matchedProductIds));

        // Collect unique article IDs and map article → products
        const articleIdSet = new Set<number>();
        const articleProductMap = new Map<number, number[]>();

        for (const row of junctionRows) {
            articleIdSet.add(row.article_id);
            const existing = articleProductMap.get(row.article_id) || [];
            existing.push(row.product_id);
            articleProductMap.set(row.article_id, existing);
        }

        if (articleIdSet.size > 0) {
            const articleIds = Array.from(articleIdSet);

            // Fetch articles with COALESCE override
            const articleRows = await db
                .select({
                    id: articles.id,
                    slug: articles.slug,
                    title: sql<string>`COALESCE(${siteArticleOverrides.title}, ${articles.title})`,
                    excerpt: sql<string>`COALESCE(${siteArticleOverrides.excerpt}, ${articles.excerpt})`,
                    cover_image_url: sql<string>`COALESCE(${siteArticleOverrides.cover_image_url}, ${articles.cover_image_url})`,
                    tags: articles.tags,
                })
                .from(articles)
                .leftJoin(
                    siteArticleOverrides,
                    and(
                        eq(siteArticleOverrides.article_id, articles.id),
                        eq(siteArticleOverrides.site_id, siteId)
                    )
                )
                .where(
                    and(
                        inArray(articles.id, articleIds),
                        eq(articles.is_active, true),
                        sql`COALESCE(${siteArticleOverrides.is_visible}, 1) = 1`
                    )
                );

            scoredArticles = articleRows.map((art) => {
                const linkedProducts = articleProductMap.get(art.id) || [];
                const productTitles = linkedProducts
                    .map((pid) => scoredProducts.find((p) => p.id === pid)?.title)
                    .filter(Boolean);

                return {
                    ...art,
                    score: linkedProducts.length,
                    matched_via: productTitles.join(", "),
                };
            });

            scoredArticles.sort((a, b) => b.score - a.score);
        }
    }

    return c.json({
        data: {
            products: scoredProducts,
            articles: scoredArticles,
            total_products: scoredProducts.length,
            total_articles: scoredArticles.length,
            criteria: {
                steps,
            },
        },
    });
});

/**
 * GET /api/match/options
 * 
 * Returns all unique values for wizard dropdowns/selectors.
 * Aggregates from all active products for the current site.
 */
matchRoute.get("/options", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const allProducts = await db
        .select({
            application_areas: products.application_areas,
            analysis_types: products.analysis_types,
            automation_level: products.automation_level,
            compliance_tags: products.compliance_tags,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
        })
        .from(products)
        .leftJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(products.is_active, true),
                sql`COALESCE(${siteProductOverrides.is_visible}, 1) = 1`
            )
        );

    const sectorsSet = new Set<string>();
    const analysisTypesSet = new Set<string>();
    const automationLevels = new Set<string>();
    const complianceSet = new Set<string>();
    const budgetClasses = new Set<string>();

    for (const p of allProducts) {
        for (const v of parseJsonArray(p.application_areas)) sectorsSet.add(v);
        for (const v of parseJsonArray(p.analysis_types)) analysisTypesSet.add(v);
        if (p.automation_level) automationLevels.add(p.automation_level);
        for (const v of parseJsonArray(p.compliance_tags)) complianceSet.add(v);
        const bc = getBudgetClass(p.price);
        if (bc) budgetClasses.add(bc);
    }

    return c.json({
        data: {
            sectors: Array.from(sectorsSet).sort(),
            analysis_types: Array.from(analysisTypesSet).sort(),
            automation_levels: Array.from(automationLevels).sort(),
            compliance: Array.from(complianceSet).sort(),
            budget_classes: Array.from(budgetClasses).sort(),
        },
    });
});

export default matchRoute;
