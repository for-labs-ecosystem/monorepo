import { Hono } from "hono";
import { eq, and, sql, inArray } from "drizzle-orm";
import { categories, siteCategoryOverrides, sites, products, siteProductOverrides } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const categoriesRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/categories
 * Lists categories with Inheritance/Override logic.
 */
categoriesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);
    const isAdmin = c.req.query("admin") === "true";
    const typeFilter = c.req.query("type");

    // ── Admin mode: return all categories with COALESCE inheritance ──
    if (isAdmin) {
        const result = await db
            .select({
                id: categories.id,
                slug: categories.slug,
                name: sql<string>`COALESCE(${siteCategoryOverrides.name}, ${categories.name})`,
                name_en: sql<string>`COALESCE(${siteCategoryOverrides.name_en}, ${categories.name_en})`,
                description: sql<string>`COALESCE(${siteCategoryOverrides.description}, ${categories.description})`,
                description_en: sql<string>`COALESCE(${siteCategoryOverrides.description_en}, ${categories.description_en})`,
                parent_id: sql<number>`COALESCE(${siteCategoryOverrides.parent_id}, ${categories.parent_id})`,
                sort_order: sql<number>`COALESCE(${siteCategoryOverrides.sort_order}, ${categories.sort_order})`,
                meta_title: sql<string>`COALESCE(${siteCategoryOverrides.meta_title}, ${categories.meta_title})`,
                meta_description: sql<string>`COALESCE(${siteCategoryOverrides.meta_description}, ${categories.meta_description})`,
                canonical_url: sql<string>`COALESCE(${siteCategoryOverrides.canonical_url}, ${categories.canonical_url})`,
                type: categories.type,
                is_active: categories.is_active,
                created_at: categories.created_at,
            })
            .from(categories)
            .leftJoin(
                siteCategoryOverrides,
                and(
                    eq(siteCategoryOverrides.category_id, categories.id),
                    eq(siteCategoryOverrides.site_id, siteId)
                )
            )
            .where(typeFilter ? eq(categories.type, typeFilter) : undefined)
            .orderBy(sql`COALESCE(${siteCategoryOverrides.sort_order}, ${categories.sort_order}, 0)`);

        // Enrich: which active sites is each category visible on?
        const allSites = await db
            .select({ id: sites.id, name: sites.name, domain: sites.domain, slug: sites.slug })
            .from(sites)
            .where(eq(sites.is_active, true));

        const allOverrides = await db
            .select({ category_id: siteCategoryOverrides.category_id, site_id: siteCategoryOverrides.site_id, is_visible: siteCategoryOverrides.is_visible })
            .from(siteCategoryOverrides);

        const overrideMap = new Map<string, boolean>();
        for (const o of allOverrides) {
            overrideMap.set(`${o.category_id}_${o.site_id}`, !!o.is_visible);
        }

        const enriched = result.map((cat) => ({
            ...cat,
            sites: allSites.filter((site) => {
                const key = `${cat.id}_${site.id}`;
                return overrideMap.has(key) ? overrideMap.get(key) : false;
            }),
        }));

        return c.json({ data: enriched, count: enriched.length });
    }

    // ── Public mode: derive categories from published products ──
    // Step 1: Find all category_ids used by products published on this site
    const publishedProducts = await db
        .select({ category_id: products.category_id })
        .from(products)
        .innerJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId),
                eq(siteProductOverrides.is_visible, true)
            )
        )
        .where(eq(products.is_active, true));

    const leafCategoryIds = new Set(
        publishedProducts
            .map((p) => p.category_id)
            .filter((id): id is number => id != null)
    );

    if (leafCategoryIds.size === 0) {
        return c.json({ data: [], count: 0 });
    }

    // Step 2: Walk up parent chain so the frontend can build a full tree
    const allCats = await db
        .select({ id: categories.id, parent_id: categories.parent_id, type: categories.type, is_active: categories.is_active })
        .from(categories)
        .where(eq(categories.is_active, true));

    const catMap = new Map(allCats.map((c) => [c.id, c]));
    const neededIds = new Set<number>(leafCategoryIds);
    for (const leafId of leafCategoryIds) {
        let current = catMap.get(leafId);
        while (current?.parent_id != null) {
            if (neededIds.has(current.parent_id)) break;
            neededIds.add(current.parent_id);
            current = catMap.get(current.parent_id);
        }
    }

    // Step 3: Fetch needed categories with COALESCE overrides
    const result = await db
        .select({
            id: categories.id,
            slug: categories.slug,
            name: sql<string>`COALESCE(${siteCategoryOverrides.name}, ${categories.name})`,
            name_en: sql<string>`COALESCE(${siteCategoryOverrides.name_en}, ${categories.name_en})`,
            description: sql<string>`COALESCE(${siteCategoryOverrides.description}, ${categories.description})`,
            description_en: sql<string>`COALESCE(${siteCategoryOverrides.description_en}, ${categories.description_en})`,
            parent_id: sql<number>`COALESCE(${siteCategoryOverrides.parent_id}, ${categories.parent_id})`,
            sort_order: sql<number>`COALESCE(${siteCategoryOverrides.sort_order}, ${categories.sort_order})`,
            meta_title: sql<string>`COALESCE(${siteCategoryOverrides.meta_title}, ${categories.meta_title})`,
            meta_description: sql<string>`COALESCE(${siteCategoryOverrides.meta_description}, ${categories.meta_description})`,
            canonical_url: sql<string>`COALESCE(${siteCategoryOverrides.canonical_url}, ${categories.canonical_url})`,
            type: categories.type,
            is_active: categories.is_active,
            created_at: categories.created_at,
        })
        .from(categories)
        .leftJoin(
            siteCategoryOverrides,
            and(
                eq(siteCategoryOverrides.category_id, categories.id),
                eq(siteCategoryOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(categories.is_active, true),
                inArray(categories.id, [...neededIds]),
                typeFilter ? eq(categories.type, typeFilter) : undefined
            )
        )
        .orderBy(sql`COALESCE(${siteCategoryOverrides.sort_order}, ${categories.sort_order}, 0)`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/categories/:slug
 */
categoriesRoute.get("/:slugOrId", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("slugOrId");
    const isNumeric = /^\d+$/.test(param);
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: categories.id,
            slug: categories.slug,
            name: sql<string>`COALESCE(${siteCategoryOverrides.name}, ${categories.name})`,
            name_en: sql<string>`COALESCE(${siteCategoryOverrides.name_en}, ${categories.name_en})`,
            description: sql<string>`COALESCE(${siteCategoryOverrides.description}, ${categories.description})`,
            description_en: sql<string>`COALESCE(${siteCategoryOverrides.description_en}, ${categories.description_en})`,
            parent_id: sql<number>`COALESCE(${siteCategoryOverrides.parent_id}, ${categories.parent_id})`,
            sort_order: sql<number>`COALESCE(${siteCategoryOverrides.sort_order}, ${categories.sort_order})`,
            meta_title: sql<string>`COALESCE(${siteCategoryOverrides.meta_title}, ${categories.meta_title})`,
            meta_description: sql<string>`COALESCE(${siteCategoryOverrides.meta_description}, ${categories.meta_description})`,
            canonical_url: sql<string>`COALESCE(${siteCategoryOverrides.canonical_url}, ${categories.canonical_url})`,
            type: categories.type,
            is_active: categories.is_active,
            created_at: categories.created_at,
            updated_at: categories.updated_at,
        })
        .from(categories)
        .leftJoin(
            siteCategoryOverrides,
            and(
                eq(siteCategoryOverrides.category_id, categories.id),
                eq(siteCategoryOverrides.site_id, siteId)
            )
        )
        .where(isNumeric ? eq(categories.id, Number(param)) : eq(categories.slug, param))
        .get();

    if (!result) {
        return c.json({ error: "Category not found" }, 404);
    }

    return c.json({ data: result });
});

/**
 * POST /api/categories
 */
categoriesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(categories)
        .values({
            slug: body.slug,
            name: body.name,
            name_en: body.name_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            parent_id: body.parent_id || null,
            type: body.type || "product",
            sort_order: body.sort_order ?? 0,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/categories/reorder
 * Bulk update parent_id and sort_order for drag-and-drop tree reordering.
 * Body: { items: Array<{ id: number; parent_id: number | null; sort_order: number }> }
 */
categoriesRoute.put("/reorder", async (c) => {
    const body = await c.req.json<{ items: Array<{ id: number; parent_id: number | null; sort_order: number }> }>();
    const db = createDb(c.env.DB);

    if (!Array.isArray(body.items) || body.items.length === 0) {
        return c.json({ error: "items array is required" }, 400);
    }

    for (const item of body.items) {
        await db
            .update(categories)
            .set({
                parent_id: item.parent_id ?? null,
                sort_order: item.sort_order,
                updated_at: sql`(CURRENT_TIMESTAMP)`,
            })
            .where(eq(categories.id, item.id));
    }

    return c.json({ message: "Reordered successfully", count: body.items.length });
});

/**
 * PUT /api/categories/:id
 */
categoriesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(categories)
        .set({
            ...body,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(categories.id, id))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Category not found" }, 404);
    }

    return c.json({ data: updated });
});

/**
 * POST /api/categories/:id/override
 */
categoriesRoute.post("/:id/override", async (c) => {
    const categoryId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const result = await db
        .insert(siteCategoryOverrides)
        .values({
            site_id: siteId,
            category_id: categoryId,
            name: body.name || null,
            name_en: body.name_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            parent_id: body.parent_id || null,
            sort_order: body.sort_order ?? null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
            is_visible: body.is_visible ?? true,
        })
        .onConflictDoUpdate({
            target: [siteCategoryOverrides.site_id, siteCategoryOverrides.category_id],
            set: {
                name: body.name || null,
                name_en: body.name_en || null,
                description: body.description || null,
                description_en: body.description_en || null,
                parent_id: body.parent_id || null,
                sort_order: body.sort_order ?? null,
                meta_title: body.meta_title || null,
                meta_description: body.meta_description || null,
                canonical_url: body.canonical_url || null,
                is_visible: body.is_visible ?? true,
                updated_at: sql`(CURRENT_TIMESTAMP)`,
            },
        })
        .returning()
        .get();

    return c.json({ data: result });
});

/**
 * GET /api/categories/:id/overrides
 */
categoriesRoute.get("/:id/overrides", async (c) => {
    const categoryId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(siteCategoryOverrides)
        .where(eq(siteCategoryOverrides.category_id, categoryId));

    return c.json({ data: result });
});

/**
 * DELETE /api/categories/:id
 * Deletes a category. Clears site overrides first, then nullifies children's parent_id.
 */
categoriesRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, id))
        .get();

    if (!existing) {
        return c.json({ error: "Category not found" }, 404);
    }

    // 1. Remove all site overrides for this category
    await db
        .delete(siteCategoryOverrides)
        .where(eq(siteCategoryOverrides.category_id, id));

    // 2. Detach children (set parent_id to null so they become root categories)
    await db
        .update(categories)
        .set({ parent_id: null, updated_at: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(categories.parent_id, id));

    // 3. Delete the category
    await db.delete(categories).where(eq(categories.id, id));

    return c.json({ message: "Category deleted", id });
});

/**
 * DELETE /api/categories/:id/override
 */
categoriesRoute.delete("/:id/override", async (c) => {
    const categoryId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteCategoryOverrides)
        .where(
            and(
                eq(siteCategoryOverrides.site_id, siteId),
                eq(siteCategoryOverrides.category_id, categoryId)
            )
        );

    return c.json({ message: "Override removed" });
});

export default categoriesRoute;
