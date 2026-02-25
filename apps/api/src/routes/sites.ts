import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const sitesRoute = new Hono();

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
            description: body.description || null,
            logo_url: body.logo_url || null,
            theme_config: body.theme_config
                ? JSON.stringify(body.theme_config)
                : null,
            has_ecommerce: body.has_ecommerce ?? false,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

export default sitesRoute;
