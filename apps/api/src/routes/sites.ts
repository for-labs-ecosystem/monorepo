import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    site: any;
    siteId: number;
    siteSlug: string;
};

const sitesRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/sites
 * List all registered sites.
 */
sitesRoute.get("/", async (c) => {
    const db = createDb(c.env.DB);

    const result = await db.select().from(sites).orderBy(sites.name);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/sites/current
 * Get the current site info (resolved by tenant middleware).
 */
sitesRoute.get("/current", async (c) => {
    const site = c.get("site");
    return c.json({ data: site });
});

/**
 * GET /api/sites/:idOrSlug
 * Get a single site by ID or Slug.
 */
sitesRoute.get("/:idOrSlug", async (c) => {
    const idOrSlug = c.req.param("idOrSlug");
    const db = createDb(c.env.DB);

    const isId = /^\d+$/.test(idOrSlug);

    const site = await db
        .select()
        .from(sites)
        .where(isId ? eq(sites.id, Number(idOrSlug)) : eq(sites.slug, idOrSlug))
        .get();

    if (!site) {
        return c.json({ error: "Site not found" }, 404);
    }

    return c.json({ data: site });
});

/**
 * POST /api/sites
 * Register a new site/domain.
 */
sitesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(sites)
        .values({
            slug: body.slug,
            domain: body.domain,
            name: body.name,
            name_en: body.name_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            logo_url: body.logo_url || null,
            theme_config: body.theme_config
                ? JSON.stringify(body.theme_config)
                : null,
            enabled_modules: body.enabled_modules
                ? JSON.stringify(body.enabled_modules)
                : null,
            ecommerce_config: body.ecommerce_config
                ? JSON.stringify(body.ecommerce_config)
                : null,
            has_ecommerce: body.has_ecommerce ?? false,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/sites/:idOrSlug
 * Update site settings (name, domain, description, modules, commerce flag).
 */
sitesRoute.put("/:idOrSlug", async (c) => {
    const idOrSlug = c.req.param("idOrSlug");
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const isId = /^\d+$/.test(idOrSlug);

    const updateData: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.name_en !== undefined) updateData.name_en = body.name_en || null;
    if (body.domain !== undefined) updateData.domain = body.domain;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.description_en !== undefined) updateData.description_en = body.description_en || null;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null;
    if (body.has_ecommerce !== undefined) updateData.has_ecommerce = body.has_ecommerce;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.enabled_modules !== undefined) {
        updateData.enabled_modules = body.enabled_modules
            ? JSON.stringify(body.enabled_modules)
            : null;
    }
    if (body.ecommerce_config !== undefined) {
        updateData.ecommerce_config = body.ecommerce_config
            ? JSON.stringify(body.ecommerce_config)
            : null;
    }
    if (body.theme_config !== undefined) {
        updateData.theme_config = body.theme_config
            ? JSON.stringify(body.theme_config)
            : null;
    }

    const updated = await db
        .update(sites)
        .set(updateData)
        .where(isId ? eq(sites.id, Number(idOrSlug)) : eq(sites.slug, idOrSlug))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Site not found" }, 404);
    }

    return c.json({ data: updated });
});

export default sitesRoute;
