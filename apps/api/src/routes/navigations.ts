import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { navigations, sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const navigationsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * GET /api/navigations
 * List navigation items. Optionally filter by ?site_id=N and ?location=header|footer|hidden
 */
navigationsRoute.get("/", async (c) => {
    const db = createDb(c.env.DB);
    const siteIdParam = c.req.query("site_id");
    const locationParam = c.req.query("location");

    let query = db.select().from(navigations).$dynamic();

    const conditions = [];
    if (siteIdParam) {
        conditions.push(eq(navigations.site_id, Number(siteIdParam)));
    }
    if (locationParam) {
        conditions.push(eq(navigations.location, locationParam));
    }

    const result = conditions.length > 0
        ? await db.select().from(navigations).where(and(...conditions)).orderBy(navigations.sort_order)
        : await db.select().from(navigations).orderBy(navigations.sort_order);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/navigations/by-page/:pageId
 * Get all nav entries linked to a specific page (across all sites)
 */
navigationsRoute.get("/by-page/:pageId", async (c) => {
    const pageId = Number(c.req.param("pageId"));
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(navigations)
        .where(eq(navigations.page_id, pageId))
        .orderBy(navigations.site_id);

    return c.json({ data: result });
});

/**
 * POST /api/navigations
 * Create a new navigation item
 */
navigationsRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(navigations)
        .values({
            site_id: body.site_id,
            page_id: body.page_id || null,
            name: body.name,
            url: body.url,
            parent_id: body.parent_id || null,
            location: body.location || "header",
            sort_order: body.sort_order ?? 0,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/navigations/:id
 * Update an existing navigation item
 */
navigationsRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(navigations)
        .set({
            name: body.name,
            url: body.url,
            parent_id: body.parent_id ?? null,
            location: body.location,
            sort_order: body.sort_order ?? 0,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(navigations.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Navigation item not found" }, 404);
    return c.json({ data: updated });
});

/**
 * DELETE /api/navigations/:id
 */
navigationsRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    await db.delete(navigations).where(eq(navigations.id, id));
    return c.json({ message: "Navigation item deleted" });
});

/**
 * POST /api/navigations/sync-page
 * Bulk sync navigation entries for a page across multiple sites.
 * Expects: { page_id, slug, title, placements: [{ site_id, location, parent_id }] }
 * Deletes old nav entries for this page, inserts new ones.
 */
navigationsRoute.post("/sync-page", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const { page_id, slug, title, placements } = body as {
        page_id: number;
        slug: string;
        title: string;
        placements: Array<{ site_id: number; location: string; parent_id: number | null; sort_order?: number }>;
    };

    // Delete all existing nav entries for this page
    await db.delete(navigations).where(eq(navigations.page_id, page_id));

    // Insert all placements — 'hidden' entries are tracked but not rendered in menus
    for (const p of placements) {
        await db.insert(navigations).values({
            site_id: p.site_id,
            page_id: page_id,
            name: title,
            url: `/${slug}`,
            parent_id: p.parent_id || null,
            location: p.location,
            sort_order: p.sort_order ?? 0,
        });
    }

    // Return freshly inserted items
    const result = await db
        .select()
        .from(navigations)
        .where(eq(navigations.page_id, page_id));

    return c.json({ data: result, count: result.length });
});

export default navigationsRoute;
