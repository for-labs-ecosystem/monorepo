import { Hono } from "hono";
import { eq, and, sql, inArray } from "drizzle-orm";
import { articles, siteArticleOverrides, sites, categories, articleRelatedProducts, products } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const articlesRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/articles
 */
articlesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const allSites = await db.select().from(sites);

    // List for admin view (ignoring current site filter if requested)
    const result = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: sql<string>`COALESCE(${siteArticleOverrides.title}, ${articles.title})`,
            title_en: sql<string>`COALESCE(${siteArticleOverrides.title_en}, ${articles.title_en})`,
            cover_image_url: sql<string>`COALESCE(${siteArticleOverrides.cover_image_url}, ${articles.cover_image_url})`,
            category_id: articles.category_id,
            category_name: categories.name,
            author: articles.author,
            is_featured: sql<boolean>`COALESCE(${siteArticleOverrides.is_featured}, ${articles.is_featured})`,
            is_active: articles.is_active,
            created_at: articles.created_at,
        })
        .from(articles)
        .leftJoin(
            siteArticleOverrides,
            and(
                eq(siteArticleOverrides.article_id, articles.id),
                eq(siteArticleOverrides.site_id, siteId)
            )
        )
        .leftJoin(categories, eq(categories.id, articles.category_id))
        .where(
            c.req.query("admin") === "true"
                ? undefined
                : sql`COALESCE(${siteArticleOverrides.is_visible}, 1) = 1`
        );

    // Get all overrides to determine which sites have this article
    const allOverrides = await db.select().from(siteArticleOverrides);

    const overrideMap = new Map<string, boolean>();
    for (const o of allOverrides) {
        overrideMap.set(`${o.article_id}_${o.site_id}`, !!o.is_visible);
    }

    const enriched = result.map(art => ({
        ...art,
        sites: allSites.filter(s => {
            // If override exists, check is_visible. If not, default to false (not published to that site yet)
            return overrideMap.get(`${art.id}_${s.id}`) ?? false;
        })
    }));

    return c.json({ data: enriched, count: enriched.length });
});

/**
 * GET /api/articles/:slug
 */
articlesRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("slug");
    const isNumeric = /^\d+$/.test(param);
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: sql<string>`COALESCE(${siteArticleOverrides.title}, ${articles.title})`,
            title_en: sql<string>`COALESCE(${siteArticleOverrides.title_en}, ${articles.title_en})`,
            excerpt: sql<string>`COALESCE(${siteArticleOverrides.excerpt}, ${articles.excerpt})`,
            excerpt_en: sql<string>`COALESCE(${siteArticleOverrides.excerpt_en}, ${articles.excerpt_en})`,
            content: sql<string>`COALESCE(${siteArticleOverrides.content}, ${articles.content})`,
            content_en: sql<string>`COALESCE(${siteArticleOverrides.content_en}, ${articles.content_en})`,
            cover_image_url: sql<string>`COALESCE(${siteArticleOverrides.cover_image_url}, ${articles.cover_image_url})`,
            meta_title: sql<string>`COALESCE(${siteArticleOverrides.meta_title}, ${articles.meta_title})`,
            meta_title_en: sql<string>`COALESCE(${siteArticleOverrides.meta_title_en}, ${articles.meta_title_en})`,
            meta_description: sql<string>`COALESCE(${siteArticleOverrides.meta_description}, ${articles.meta_description})`,
            meta_description_en: sql<string>`COALESCE(${siteArticleOverrides.meta_description_en}, ${articles.meta_description_en})`,
            canonical_url: sql<string>`COALESCE(${siteArticleOverrides.canonical_url}, ${articles.canonical_url})`,
            tags: sql<string>`COALESCE(${siteArticleOverrides.tags}, ${articles.tags})`,
            keywords: sql<string>`COALESCE(${siteArticleOverrides.keywords}, ${articles.keywords})`,
            published_at: sql<string>`COALESCE(${siteArticleOverrides.published_at}, ${articles.published_at})`,
            category_id: articles.category_id,
            author: articles.author,
            is_active: articles.is_active,
            is_featured: sql<boolean>`COALESCE(${siteArticleOverrides.is_featured}, ${articles.is_featured})`,
            created_at: articles.created_at,
            updated_at: articles.updated_at,
        })
        .from(articles)
        .leftJoin(
            siteArticleOverrides,
            and(
                eq(siteArticleOverrides.article_id, articles.id),
                eq(siteArticleOverrides.site_id, siteId)
            )
        )
        .where(isNumeric ? eq(articles.id, Number(param)) : eq(articles.slug, param))
        .get();

    if (!result) {
        return c.json({ error: "Article not found" }, 404);
    }

    // Fetch related products (with details for sidebar display)
    const relatedRows = await db
        .select({
            id: products.id,
            title: products.title,
            slug: products.slug,
            image_url: products.image_url,
            brand: products.brand,
            price: products.price,
            currency: products.currency,
        })
        .from(articleRelatedProducts)
        .innerJoin(products, eq(products.id, articleRelatedProducts.product_id))
        .where(eq(articleRelatedProducts.article_id, result.id));

    return c.json({ data: { ...result, relatedProducts: relatedRows } });
});

/**
 * POST /api/articles
 */
articlesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Handle tags - can be array or string
    const tagsValue = body.tags
        ? (Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags)
        : null;

    const inserted = await db
        .insert(articles)
        .values({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            excerpt: body.excerpt || null,
            excerpt_en: body.excerpt_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            category_id: body.category_id || null,
            cover_image_url: body.cover_image_url || null,
            author: body.author || null,
            // Tags & Keywords
            tags: tagsValue,
            keywords: body.keywords || null,
            // SEO
            meta_title: body.meta_title || null,
            meta_title_en: body.meta_title_en || null,
            meta_description: body.meta_description || null,
            meta_description_en: body.meta_description_en || null,
            canonical_url: body.canonical_url || null,
            // Publishing
            published_at: body.published_at || null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : true,
            is_featured: body.is_featured !== undefined ? (!!body.is_featured) : false,
        })
        .returning()
        .get();

    // Sync related products
    const relatedProductIds: number[] = Array.isArray(body.relatedProductIds) ? body.relatedProductIds : [];
    if (relatedProductIds.length > 0) {
        await db.insert(articleRelatedProducts).values(
            relatedProductIds.map((pid) => ({ article_id: inserted.id, product_id: pid }))
        );
    }

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/articles/:id
 */
articlesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Handle tags - can be array or string
    const tagsValue = body.tags
        ? (Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags)
        : null;

    const updated = await db
        .update(articles)
        .set({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            excerpt: body.excerpt || null,
            excerpt_en: body.excerpt_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            category_id: body.category_id || null,
            cover_image_url: body.cover_image_url || null,
            author: body.author || null,
            // Tags & Keywords
            tags: tagsValue,
            keywords: body.keywords || null,
            // SEO
            meta_title: body.meta_title || null,
            meta_title_en: body.meta_title_en || null,
            meta_description: body.meta_description || null,
            meta_description_en: body.meta_description_en || null,
            canonical_url: body.canonical_url || null,
            // Publishing
            published_at: body.published_at || null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : undefined,
            is_featured: body.is_featured !== undefined ? (!!body.is_featured) : undefined,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(articles.id, id))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Article not found" }, 404);
    }

    // Sync related products (delete-then-insert pattern)
    if (Array.isArray(body.relatedProductIds)) {
        await db.delete(articleRelatedProducts).where(eq(articleRelatedProducts.article_id, id));
        const relatedProductIds: number[] = body.relatedProductIds;
        if (relatedProductIds.length > 0) {
            await db.insert(articleRelatedProducts).values(
                relatedProductIds.map((pid) => ({ article_id: id, product_id: pid }))
            );
        }
    }

    return c.json({ data: updated });
});

/**
 * POST /api/articles/:id/override
 */
articlesRoute.delete("/:id", async (c) => {
    const param = c.req.param("id");

    if (param === "override" || param.includes("/")) {
        return c.json({ error: "Not found" }, 404);
    }

    const id = Number(param);
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    const db = createDb(c.env.DB);

    await db.delete(siteArticleOverrides).where(eq(siteArticleOverrides.article_id, id));
    await db.delete(articleRelatedProducts).where(eq(articleRelatedProducts.article_id, id));

    const deleted = await db
        .delete(articles)
        .where(eq(articles.id, id))
        .returning()
        .get();

    if (!deleted) {
        return c.json({ error: "Article not found" }, 404);
    }

    return c.json({ message: "Article deleted", data: deleted });
});

/**
 * POST /api/articles/:id/override
 */
articlesRoute.post("/:id/override", async (c) => {
    const articleId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Handle tags - can be array or string
    const tagsValue = body.tags
        ? (Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags)
        : null;

    const result = await db
        .insert(siteArticleOverrides)
        .values({
            site_id: siteId,
            article_id: articleId,
            title: body.title || null,
            title_en: body.title_en || null,
            excerpt: body.excerpt || null,
            excerpt_en: body.excerpt_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            cover_image_url: body.cover_image_url || null,
            // Tags & Keywords
            tags: tagsValue,
            keywords: body.keywords || null,
            // SEO
            meta_title: body.meta_title || null,
            meta_title_en: body.meta_title_en || null,
            meta_description: body.meta_description || null,
            meta_description_en: body.meta_description_en || null,
            canonical_url: body.canonical_url || null,
            // Publishing
            published_at: body.published_at || null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteArticleOverrides.site_id, siteArticleOverrides.article_id],
            set: {
                title: body.title || null,
                title_en: body.title_en || null,
                excerpt: body.excerpt || null,
                excerpt_en: body.excerpt_en || null,
                content: body.content || null,
                content_en: body.content_en || null,
                cover_image_url: body.cover_image_url || null,
                // Tags & Keywords
                tags: tagsValue,
                keywords: body.keywords || null,
                // SEO
                meta_title: body.meta_title || null,
                meta_title_en: body.meta_title_en || null,
                meta_description: body.meta_description || null,
                meta_description_en: body.meta_description_en || null,
                canonical_url: body.canonical_url || null,
                // Publishing
                published_at: body.published_at || null,
                is_visible: body.is_visible ?? true,
                is_featured: body.is_featured ?? false,
                sort_order: body.sort_order ?? 0,
                updated_at: sql`(CURRENT_TIMESTAMP)`,
            },
        })
        .returning()
        .get();

    return c.json({ data: result });
});

/**
 * DELETE /api/articles/:id/override
 */
articlesRoute.delete("/:id/override", async (c) => {
    const articleId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteArticleOverrides)
        .where(
            and(
                eq(siteArticleOverrides.site_id, siteId),
                eq(siteArticleOverrides.article_id, articleId)
            )
        );

    return c.json({ message: "Override removed" });
});

/**
 * GET /api/articles/:id/overrides
 */
articlesRoute.get("/:id/overrides", async (c) => {
    const articleId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);
    const overrides = await db
        .select()
        .from(siteArticleOverrides)
        .where(eq(siteArticleOverrides.article_id, articleId));
    return c.json({ data: overrides });
});

export default articlesRoute;
