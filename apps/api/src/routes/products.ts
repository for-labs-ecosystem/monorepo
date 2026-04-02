import { Hono } from "hono";
import { eq, and, sql, like, or } from "drizzle-orm";
import {
    products,
    siteProductOverrides,
    categories,
    sites,
} from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const productsRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/products
 * Lists products with Inheritance/Override logic.
 */
productsRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: products.id,
            slug: products.slug,
            title: sql<string>`COALESCE(${siteProductOverrides.title}, ${products.title})`,
            title_en: sql<string>`COALESCE(${siteProductOverrides.title_en}, ${products.title_en})`,
            description: sql<string>`COALESCE(${siteProductOverrides.description}, ${products.description})`,
            description_en: sql<string>`COALESCE(${siteProductOverrides.description_en}, ${products.description_en})`,
            content: sql<string>`COALESCE(${siteProductOverrides.content}, ${products.content})`,
            content_en: sql<string>`COALESCE(${siteProductOverrides.content_en}, ${products.content_en})`,
            specs: sql<string>`COALESCE(${siteProductOverrides.specs}, ${products.specs})`,
            specs_en: products.specs_en,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
            compare_price: sql<number>`COALESCE(${siteProductOverrides.compare_price}, ${products.compare_price})`,
            currency: sql<string>`COALESCE(${siteProductOverrides.currency}, ${products.currency})`,
            image_url: sql<string>`COALESCE(${siteProductOverrides.image_url}, ${products.image_url})`,
            gallery: sql<string>`COALESCE(${siteProductOverrides.gallery}, ${products.gallery})`,
            campaign_label: sql<string>`COALESCE(${siteProductOverrides.campaign_label}, ${products.campaign_label})`,
            meta_title: sql<string>`COALESCE(${siteProductOverrides.meta_title}, ${products.meta_title})`,
            meta_description: sql<string>`COALESCE(${siteProductOverrides.meta_description}, ${products.meta_description})`,
            canonical_url: sql<string>`COALESCE(${siteProductOverrides.canonical_url}, ${products.canonical_url})`,
            brand: products.brand,
            model_number: products.model_number,
            sku: products.sku,
            unit: products.unit,
            warranty_period: products.warranty_period,
            features: products.features,
            features_en: products.features_en,
            application_areas: products.application_areas,
            application_areas_en: products.application_areas_en,
            tags: products.tags,
            tags_en: products.tags_en,
            analysis_types: products.analysis_types,
            analysis_types_en: products.analysis_types_en,
            automation_level: products.automation_level,
            compliance_tags: products.compliance_tags,
            category_id: products.category_id,
            is_active: products.is_active,
            is_featured: sql<boolean>`COALESCE(${siteProductOverrides.is_featured}, ${products.is_featured})`,
            sort_order: sql<number>`COALESCE(${siteProductOverrides.sort_order}, ${products.sort_order})`,
            created_at: products.created_at,
            updated_at: products.updated_at,
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
            c.req.query("admin") === "true"
                ? undefined
                : and(
                    eq(products.is_active, true),
                    sql`COALESCE(${siteProductOverrides.is_visible}, 0) = 1`
                )
        )
        .orderBy(sql`COALESCE(${siteProductOverrides.sort_order}, ${products.sort_order}, 0)`);

    const q = c.req.query("q")?.trim().toLowerCase();
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const isFeatured = c.req.query("is_featured");
    const categoryIdParam = c.req.query("category_id");

    let filtered = result;
    if (q) {
        filtered = filtered.filter((p) =>
            p.title?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.model_number?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    }
    if (categoryIdParam) {
        const catIds = categoryIdParam.split(',').map(Number).filter((n) => !isNaN(n));
        // Build descendant set so clicking a parent category also shows child products
        const allCats = await db
            .select({ id: categories.id, parent_id: categories.parent_id })
            .from(categories);
        const childrenMap = new Map<number, number[]>();
        for (const cat of allCats) {
            if (cat.parent_id != null) {
                if (!childrenMap.has(cat.parent_id)) childrenMap.set(cat.parent_id, []);
                childrenMap.get(cat.parent_id)!.push(cat.id);
            }
        }
        const matchIds = new Set<number>(catIds);
        const queue = [...catIds];
        while (queue.length > 0) {
            const current = queue.pop()!;
            for (const child of (childrenMap.get(current) ?? [])) {
                if (!matchIds.has(child)) {
                    matchIds.add(child);
                    queue.push(child);
                }
            }
        }
        filtered = filtered.filter((p) => p.category_id != null && matchIds.has(p.category_id));
    }
    if (isFeatured !== undefined) {
        filtered = filtered.filter((p) => Boolean(p.is_featured) === (isFeatured === "1" || isFeatured === "true"));
    }
    if (limit) {
        filtered = filtered.slice(0, limit);
    }

    // Enrich: which active sites is each product visible on?
    const allSites = await db
        .select({ id: sites.id, name: sites.name, domain: sites.domain, slug: sites.slug })
        .from(sites)
        .where(eq(sites.is_active, true));

    const allOverrides = await db
        .select({ product_id: siteProductOverrides.product_id, site_id: siteProductOverrides.site_id, is_visible: siteProductOverrides.is_visible })
        .from(siteProductOverrides);

    const overrideMap = new Map<string, boolean>();
    for (const o of allOverrides) {
        overrideMap.set(`${o.product_id}_${o.site_id}`, !!o.is_visible);
    }

    const enriched = filtered.map((product) => ({
        ...product,
        sites: allSites.filter((site) => {
            const key = `${product.id}_${site.id}`;
            // Case-insensitive check for boolean-like values from database
            const val = overrideMap.get(key);
            return val === true;
        }),
    }));

    return c.json({ data: enriched, count: enriched.length });
});

/**
 * GET /api/products/:slug
 * Single product with override applied.
 */
productsRoute.get("/:slugOrId", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("slugOrId");
    const isNumeric = /^\d+$/.test(param);
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: products.id,
            slug: products.slug,
            title: sql<string>`COALESCE(${siteProductOverrides.title}, ${products.title})`,
            title_en: sql<string>`COALESCE(${siteProductOverrides.title_en}, ${products.title_en})`,
            description: sql<string>`COALESCE(${siteProductOverrides.description}, ${products.description})`,
            description_en: sql<string>`COALESCE(${siteProductOverrides.description_en}, ${products.description_en})`,
            content: sql<string>`COALESCE(${siteProductOverrides.content}, ${products.content})`,
            content_en: sql<string>`COALESCE(${siteProductOverrides.content_en}, ${products.content_en})`,
            specs: sql<string>`COALESCE(${siteProductOverrides.specs}, ${products.specs})`,
            specs_en: products.specs_en,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
            compare_price: sql<number>`COALESCE(${siteProductOverrides.compare_price}, ${products.compare_price})`,
            currency: sql<string>`COALESCE(${siteProductOverrides.currency}, ${products.currency})`,
            image_url: sql<string>`COALESCE(${siteProductOverrides.image_url}, ${products.image_url})`,
            gallery: sql<string>`COALESCE(${siteProductOverrides.gallery}, ${products.gallery})`,
            campaign_label: sql<string>`COALESCE(${siteProductOverrides.campaign_label}, ${products.campaign_label})`,
            meta_title: sql<string>`COALESCE(${siteProductOverrides.meta_title}, ${products.meta_title})`,
            meta_description: sql<string>`COALESCE(${siteProductOverrides.meta_description}, ${products.meta_description})`,
            canonical_url: sql<string>`COALESCE(${siteProductOverrides.canonical_url}, ${products.canonical_url})`,
            brand: products.brand,
            model_number: products.model_number,
            sku: products.sku,
            unit: products.unit,
            warranty_period: products.warranty_period,
            features: products.features,
            features_en: products.features_en,
            application_areas: products.application_areas,
            application_areas_en: products.application_areas_en,
            tags: products.tags,
            tags_en: products.tags_en,
            analysis_types: products.analysis_types,
            analysis_types_en: products.analysis_types_en,
            automation_level: products.automation_level,
            compliance_tags: products.compliance_tags,
            category_id: products.category_id,
            is_active: products.is_active,
            is_featured: c.req.query("admin") === "true"
                ? products.is_featured
                : sql<boolean>`COALESCE(${siteProductOverrides.is_featured}, ${products.is_featured})`,
            sort_order: sql<number>`COALESCE(${siteProductOverrides.sort_order}, ${products.sort_order})`,
            created_at: products.created_at,
            updated_at: products.updated_at,
        })
        .from(products)
        .leftJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId)
            )
        )
        .where(isNumeric ? eq(products.id, Number(param)) : eq(products.slug, param))
        .get();

    if (!result) {
        return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ data: result });
});

/**
 * POST /api/products
 * Create a global product.
 */
productsRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(products)
        .values({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            specs: body.specs || null,
            specs_en: body.specs_en || null,
            price: body.price ?? null,
            compare_price: body.compare_price ?? null,
            currency: body.currency || "TRY",
            unit: body.unit || null,
            sku: body.sku || null,
            brand: body.brand || null,
            model_number: body.model_number || null,
            warranty_period: body.warranty_period || null,
            campaign_label: body.campaign_label || null,
            features: body.features || null,
            features_en: body.features_en || null,
            application_areas: body.application_areas || null,
            application_areas_en: body.application_areas_en || null,
            tags: body.tags || null,
            tags_en: body.tags_en || null,
            analysis_types: body.analysis_types || null,
            analysis_types_en: body.analysis_types_en || null,
            automation_level: body.automation_level || null,
            compliance_tags: body.compliance_tags || null,
            category_id: body.category_id || null,
            image_url: body.image_url || null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : true,
            is_featured: body.is_featured !== undefined ? (!!body.is_featured) : false,
            sort_order: body.sort_order ?? 0,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/products/:id
 * Update a global product.
 */
productsRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Helper: stringify arrays/objects for text columns, pass null through
    const jsonCol = (val: unknown): string | null => {
        if (val === null || val === undefined) return null;
        if (typeof val === "string") return val;
        return JSON.stringify(val);
    };

    const updated = await db
        .update(products)
        .set({
            title: body.title,
            title_en: body.title_en ?? null,
            slug: body.slug,
            description: body.description ?? null,
            description_en: body.description_en ?? null,
            content: body.content ?? null,
            content_en: body.content_en ?? null,
            specs: body.specs ?? null,
            specs_en: body.specs_en ?? null,
            price: body.price ?? null,
            compare_price: body.compare_price ?? null,
            currency: body.currency || "TRY",
            unit: body.unit ?? null,
            stock_quantity: body.stock_quantity ?? 0,
            sku: body.sku ?? null,
            brand: body.brand ?? null,
            model_number: body.model_number ?? null,
            warranty_period: body.warranty_period ?? null,
            campaign_label: body.campaign_label ?? null,
            features: jsonCol(body.features),
            features_en: jsonCol(body.features_en),
            application_areas: jsonCol(body.application_areas),
            application_areas_en: jsonCol(body.application_areas_en),
            tags: jsonCol(body.tags),
            tags_en: jsonCol(body.tags_en),
            analysis_types: jsonCol(body.analysis_types),
            analysis_types_en: jsonCol(body.analysis_types_en),
            automation_level: body.automation_level ?? null,
            compliance_tags: jsonCol(body.compliance_tags),
            category_id: body.category_id ?? null,
            image_url: body.image_url ?? null,
            gallery: jsonCol(body.gallery),
            meta_title: body.meta_title ?? null,
            meta_description: body.meta_description ?? null,
            canonical_url: body.canonical_url ?? null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : undefined,
            is_featured: body.is_featured !== undefined ? (!!body.is_featured) : undefined,
            sort_order: body.sort_order ?? 0,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(products.id, id))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ data: updated });
});

/**
 * DELETE /api/products/:id
 */
productsRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    await db.delete(siteProductOverrides).where(eq(siteProductOverrides.product_id, id));
    await db.delete(products).where(eq(products.id, id));

    return c.json({ message: "Product deleted" });
});

/**
 * POST /api/products/:id/override
 * Create or update a site-specific override for a product.
 */
productsRoute.post("/:id/override", async (c) => {
    const productId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const overrideValues = {
        site_id: siteId,
        product_id: productId,
        title: body.title || null,
        title_en: body.title_en || null,
        description: body.description || null,
        description_en: body.description_en || null,
        content: body.content || null,
        content_en: body.content_en || null,
        specs: body.specs || null,
        price: body.price ?? null,
        compare_price: body.compare_price ?? null,
        currency: body.currency || null,
        stock_quantity: body.stock_quantity ?? null,
        image_url: body.image_url || null,
        gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        campaign_label: body.campaign_label || null,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        canonical_url: body.canonical_url || null,
        is_visible: body.is_visible ?? true,
        is_featured: body.is_featured ?? false,
        sort_order: body.sort_order ?? 0,
    };

    const result = await db
        .insert(siteProductOverrides)
        .values(overrideValues)
        .onConflictDoUpdate({
            target: [siteProductOverrides.site_id, siteProductOverrides.product_id],
            set: {
                title: overrideValues.title,
                title_en: overrideValues.title_en,
                description: overrideValues.description,
                description_en: overrideValues.description_en,
                content: overrideValues.content,
                content_en: overrideValues.content_en,
                specs: overrideValues.specs,
                price: overrideValues.price,
                compare_price: overrideValues.compare_price,
                currency: overrideValues.currency,
                stock_quantity: overrideValues.stock_quantity,
                image_url: overrideValues.image_url,
                gallery: overrideValues.gallery,
                campaign_label: overrideValues.campaign_label,
                meta_title: overrideValues.meta_title,
                meta_description: overrideValues.meta_description,
                canonical_url: overrideValues.canonical_url,
                is_visible: overrideValues.is_visible,
                is_featured: overrideValues.is_featured,
                sort_order: overrideValues.sort_order,
                updated_at: sql`(CURRENT_TIMESTAMP)`,
            },
        })
        .returning()
        .get();

    return c.json({ data: result });
});

/**
 * GET /api/products/:id/overrides
 * Fetch all overrides for a product across all sites.
 */
productsRoute.get("/:id/overrides", async (c) => {
    const productId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(siteProductOverrides)
        .where(eq(siteProductOverrides.product_id, productId));

    return c.json({ data: result });
});

/**
 * DELETE /api/products/:id/override
 * Remove a site-specific override.
 */
productsRoute.delete("/:id/override", async (c) => {
    const productId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteProductOverrides)
        .where(
            and(
                eq(siteProductOverrides.site_id, siteId),
                eq(siteProductOverrides.product_id, productId)
            )
        );

    return c.json({ message: "Override removed, reverted to global values" });
});

export default productsRoute;
