import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { pages, sitePageOverrides } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const pagesRoute = new Hono();

/**
 * GET /api/pages
 * Lists CMS pages with Inheritance/Override.
 */
pagesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: pages.id,
            slug: pages.slug,
            title: sql<string>`COALESCE(${sitePageOverrides.title}, ${pages.title})`,
            content: sql<string>`COALESCE(${sitePageOverrides.content}, ${pages.content})`,
            meta_title: sql<string>`COALESCE(${sitePageOverrides.meta_title}, ${pages.meta_title})`,
            meta_description: sql<string>`COALESCE(${sitePageOverrides.meta_description}, ${pages.meta_description})`,
            page_type: pages.page_type,
            sort_order: sql<number>`COALESCE(${sitePageOverrides.sort_order}, ${pages.sort_order})`,
            created_at: pages.created_at,
        })
        .from(pages)
        .leftJoin(
            sitePageOverrides,
            and(
                eq(sitePageOverrides.page_id, pages.id),
                eq(sitePageOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(pages.is_active, true),
                sql`COALESCE(${sitePageOverrides.is_visible}, 1) = 1`
            )
        )
        .orderBy(sql`COALESCE(${sitePageOverrides.sort_order}, ${pages.sort_order})`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/pages/:slug
 */
pagesRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: pages.id,
            slug: pages.slug,
            title: sql<string>`COALESCE(${sitePageOverrides.title}, ${pages.title})`,
            content: sql<string>`COALESCE(${sitePageOverrides.content}, ${pages.content})`,
            meta_title: sql<string>`COALESCE(${sitePageOverrides.meta_title}, ${pages.meta_title})`,
            meta_description: sql<string>`COALESCE(${sitePageOverrides.meta_description}, ${pages.meta_description})`,
            page_type: pages.page_type,
            created_at: pages.created_at,
            updated_at: pages.updated_at,
        })
        .from(pages)
        .leftJoin(
            sitePageOverrides,
            and(
                eq(sitePageOverrides.page_id, pages.id),
                eq(sitePageOverrides.site_id, siteId)
            )
        )
        .where(eq(pages.slug, slug))
        .get();

    if (!result) return c.json({ error: "Page not found" }, 404);
    return c.json({ data: result });
});

/**
 * POST /api/pages
 */
pagesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(pages)
        .values({
            slug: body.slug,
            title: body.title,
            content: body.content || null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            page_type: body.page_type || "corporate",
            sort_order: body.sort_order ?? 0,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/pages/:id
 */
pagesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(pages)
        .set({ ...body, updated_at: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(pages.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Page not found" }, 404);
    return c.json({ data: updated });
});

/**
 * POST /api/pages/:id/override
 */
pagesRoute.post("/:id/override", async (c) => {
    const pageId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const result = await db
        .insert(sitePageOverrides)
        .values({
            site_id: siteId,
            page_id: pageId,
            title: body.title || null,
            content: body.content || null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            is_visible: body.is_visible ?? true,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [sitePageOverrides.site_id, sitePageOverrides.page_id],
            set: {
                title: body.title || null,
                content: body.content || null,
                meta_title: body.meta_title || null,
                meta_description: body.meta_description || null,
                is_visible: body.is_visible ?? true,
                sort_order: body.sort_order ?? 0,
                updated_at: sql`(CURRENT_TIMESTAMP)`,
            },
        })
        .returning()
        .get();

    return c.json({ data: result });
});

/**
 * DELETE /api/pages/:id/override
 */
pagesRoute.delete("/:id/override", async (c) => {
    const pageId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(sitePageOverrides)
        .where(
            and(
                eq(sitePageOverrides.site_id, siteId),
                eq(sitePageOverrides.page_id, pageId)
            )
        );

    return c.json({ message: "Override removed" });
});

export default pagesRoute;
