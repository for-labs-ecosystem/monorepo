import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { pages, sitePageOverrides, sites, navigations } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const pagesRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/pages
 */
pagesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const allSites = await db.select().from(sites);

    const result = await db
        .select({
            id: pages.id,
            slug: pages.slug,
            title: sql<string>`COALESCE(${sitePageOverrides.title}, ${pages.title})`,
            title_en: sql<string>`COALESCE(${sitePageOverrides.title_en}, ${pages.title_en})`,
            page_type: pages.page_type,
            is_active: sql<boolean>`COALESCE(${sitePageOverrides.is_visible}, 1)`,
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
            c.req.query("admin") === "true"
                ? undefined
                : sql`COALESCE(${sitePageOverrides.is_visible}, 1) = 1`
        )
        .orderBy(sql`COALESCE(${sitePageOverrides.sort_order}, ${pages.sort_order}, 0)`);

    const allOverrides = await db.select().from(sitePageOverrides);
    const allNavs = await db.select().from(navigations);

    const overrideMap = new Map<string, boolean>();
    for (const o of allOverrides) {
        overrideMap.set(`${o.page_id}_${o.site_id}`, !!o.is_visible);
    }

    const siteNameMap = new Map<number, string>();
    for (const s of allSites) {
        siteNameMap.set(s.id, s.name);
    }

    const navNameMap = new Map<number, string>();
    for (const n of allNavs) {
        navNameMap.set(n.id, n.name);
    }

    const enriched = result.map(p => ({
        ...p,
        sites: allSites.filter(s => {
            return overrideMap.get(`${p.id}_${s.id}`) ?? true; // Pages default to visible if global
        }),
        navigations: allNavs
            .filter(n => n.page_id === p.id)
            .map(n => ({
                id: n.id,
                site_id: n.site_id,
                site_name: siteNameMap.get(n.site_id) || "",
                location: n.location,
                parent_id: n.parent_id,
                parent_name: n.parent_id ? navNameMap.get(n.parent_id) || null : null,
            })),
    }));

    return c.json({ data: enriched, count: enriched.length });
});

/**
 * GET /api/pages/:idOrSlug
 * Accepts numeric ID or slug string
 */
pagesRoute.get("/:idOrSlug", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("idOrSlug");
    const db = createDb(c.env.DB);

    const isNumeric = /^\d+$/.test(param);
    const whereClause = isNumeric ? eq(pages.id, Number(param)) : eq(pages.slug, param);

    const result = await db
        .select({
            id: pages.id,
            slug: pages.slug,
            title: sql<string>`COALESCE(${sitePageOverrides.title}, ${pages.title})`,
            title_en: sql<string>`COALESCE(${sitePageOverrides.title_en}, ${pages.title_en})`,
            content: sql<string>`COALESCE(${sitePageOverrides.content}, ${pages.content})`,
            content_en: sql<string>`COALESCE(${sitePageOverrides.content_en}, ${pages.content_en})`,
            cover_image_url: sql<string>`COALESCE(${sitePageOverrides.cover_image_url}, ${pages.cover_image_url})`,
            meta_title: sql<string>`COALESCE(${sitePageOverrides.meta_title}, ${pages.meta_title})`,
            meta_description: sql<string>`COALESCE(${sitePageOverrides.meta_description}, ${pages.meta_description})`,
            canonical_url: sql<string>`COALESCE(${sitePageOverrides.canonical_url}, ${pages.canonical_url})`,
            keywords: sql<string>`COALESCE(${sitePageOverrides.keywords}, ${pages.keywords})`,
            page_type: pages.page_type,
            sort_order: sql<number>`COALESCE(${sitePageOverrides.sort_order}, ${pages.sort_order})`,
            is_active: pages.is_active,
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
        .where(whereClause)
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

    if (!body.title || !body.slug) {
        return c.json({ error: "Başlık ve slug zorunludur" }, 400);
    }

    try {
        const inserted = await db
            .insert(pages)
            .values({
                slug: body.slug,
                title: body.title,
                title_en: body.title_en || null,
                content: body.content || null,
                content_en: body.content_en || null,
                cover_image_url: body.cover_image_url || null,
                meta_title: body.meta_title || null,
                meta_description: body.meta_description || null,
                canonical_url: body.canonical_url || null,
                keywords: body.keywords || null,
                page_type: body.page_type || "corporate",
                sort_order: body.sort_order ?? 0,
            })
            .returning()
            .get();

        return c.json({ data: inserted }, 201);
    } catch (err: any) {
        if (err.message?.includes("UNIQUE")) {
            return c.json({ error: `Bu slug zaten kullanılıyor: ${body.slug}` }, 409);
        }
        console.error("Page create error:", err);
        return c.json({ error: err.message || "Sayfa oluşturulamadı" }, 500);
    }
});

/**
 * PUT /api/pages/:id
 */
pagesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    try {
        const updated = await db
            .update(pages)
            .set({ ...body, updated_at: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(pages.id, id))
            .returning()
            .get();

        if (!updated) return c.json({ error: "Sayfa bulunamadı" }, 404);
        return c.json({ data: updated });
    } catch (err: any) {
        if (err.message?.includes("UNIQUE")) {
            return c.json({ error: `Bu slug zaten kullanılıyor: ${body.slug}` }, 409);
        }
        console.error("Page update error:", err);
        return c.json({ error: err.message || "Sayfa güncellenemedi" }, 500);
    }
});

/**
 * DELETE /api/pages/:id
 * Deletes a page and all related overrides and navigation entries
 */
pagesRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    try {
        // Delete related navigation entries
        await db.delete(navigations).where(eq(navigations.page_id, id));
        // Delete related overrides
        await db.delete(sitePageOverrides).where(eq(sitePageOverrides.page_id, id));
        // Delete the page itself
        const deleted = await db.delete(pages).where(eq(pages.id, id)).returning().get();

        if (!deleted) return c.json({ error: "Sayfa bulunamadı" }, 404);
        return c.json({ message: "Sayfa silindi", data: deleted });
    } catch (err: any) {
        console.error("Page delete error:", err);
        return c.json({ error: err.message || "Sayfa silinemedi" }, 500);
    }
});

/**
 * POST /api/pages/:id/override
 */
pagesRoute.post("/:id/override", async (c) => {
    const pageId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    try {
        const result = await db
            .insert(sitePageOverrides)
            .values({
                site_id: siteId,
                page_id: pageId,
                title: body.title || null,
                title_en: body.title_en || null,
                content: body.content || null,
                content_en: body.content_en || null,
                cover_image_url: body.cover_image_url || null,
                meta_title: body.meta_title || null,
                meta_description: body.meta_description || null,
                canonical_url: body.canonical_url || null,
                keywords: body.keywords || null,
                is_visible: body.is_visible ?? true,
                sort_order: body.sort_order ?? 0,
            })
            .onConflictDoUpdate({
                target: [sitePageOverrides.site_id, sitePageOverrides.page_id],
                set: {
                    title: body.title || null,
                    title_en: body.title_en || null,
                    content: body.content || null,
                    content_en: body.content_en || null,
                    cover_image_url: body.cover_image_url || null,
                    meta_title: body.meta_title || null,
                    meta_description: body.meta_description || null,
                    canonical_url: body.canonical_url || null,
                    keywords: body.keywords || null,
                    is_visible: body.is_visible ?? true,
                    sort_order: body.sort_order ?? 0,
                    updated_at: sql`(CURRENT_TIMESTAMP)`,
                },
            })
            .returning()
            .get();

        return c.json({ data: result });
    } catch (err: any) {
        console.error("Page override error:", err);
        return c.json({ error: err.message || "Override kaydedilemedi" }, 500);
    }
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

/**
 * GET /api/pages/:id/overrides
 */
pagesRoute.get("/:id/overrides", async (c) => {
    const pageId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);
    const overrides = await db
        .select()
        .from(sitePageOverrides)
        .where(eq(sitePageOverrides.page_id, pageId));
    return c.json({ data: overrides });
});

export default pagesRoute;
