import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { services, siteServiceOverrides, sites, categories } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const servicesRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/services
 */
servicesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const allSites = await db.select().from(sites);

    const result = await db
        .select({
            id: services.id,
            slug: services.slug,
            title: sql<string>`COALESCE(${siteServiceOverrides.title}, ${services.title})`,
            title_en: sql<string>`COALESCE(${siteServiceOverrides.title_en}, ${services.title_en})`,
            description: sql<string>`COALESCE(${siteServiceOverrides.description}, ${services.description})`,
            description_en: sql<string>`COALESCE(${siteServiceOverrides.description_en}, ${services.description_en})`,
            image_url: sql<string>`COALESCE(${siteServiceOverrides.image_url}, ${services.image_url})`,
            service_type: services.service_type,
            category_id: services.category_id,
            category_name: categories.name,
            is_active: services.is_active,
            is_featured: sql<boolean>`COALESCE(${siteServiceOverrides.is_featured}, 0)`,
            sort_order: sql<number>`COALESCE(${siteServiceOverrides.sort_order}, 0)`,
            created_at: services.created_at,
        })
        .from(services)
        .leftJoin(
            siteServiceOverrides,
            and(
                eq(siteServiceOverrides.service_id, services.id),
                eq(siteServiceOverrides.site_id, siteId)
            )
        )
        .leftJoin(categories, eq(categories.id, services.category_id))
        .where(
            c.req.query("admin") === "true"
                ? undefined
                : eq(siteServiceOverrides.is_visible, true)
        )
        .orderBy(sql`COALESCE(${siteServiceOverrides.sort_order}, 0)`);

    const allOverrides = await db.select().from(siteServiceOverrides);

    const overrideMap = new Map<string, boolean>();
    for (const o of allOverrides) {
        overrideMap.set(`${o.service_id}_${o.site_id}`, !!o.is_visible);
    }

    const enriched = result.map(srv => ({
        ...srv,
        sites: allSites.filter(s => {
            return overrideMap.get(`${srv.id}_${s.id}`) ?? false;
        })
    }));

    return c.json({ data: enriched, count: enriched.length });
});

/**
 * GET /api/services/:slug
 */
servicesRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("slug");
    const isNumeric = /^\d+$/.test(param);
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: services.id,
            slug: services.slug,
            title: sql<string>`COALESCE(${siteServiceOverrides.title}, ${services.title})`,
            title_en: sql<string>`COALESCE(${siteServiceOverrides.title_en}, ${services.title_en})`,
            description: sql<string>`COALESCE(${siteServiceOverrides.description}, ${services.description})`,
            description_en: sql<string>`COALESCE(${siteServiceOverrides.description_en}, ${services.description_en})`,
            content: sql<string>`COALESCE(${siteServiceOverrides.content}, ${services.content})`,
            content_en: sql<string>`COALESCE(${siteServiceOverrides.content_en}, ${services.content_en})`,
            specs: sql<string>`COALESCE(${siteServiceOverrides.specs}, ${services.specs})`,
            price: sql<number>`COALESCE(${siteServiceOverrides.price}, ${services.price})`,
            currency: sql<string>`COALESCE(${siteServiceOverrides.currency}, ${services.currency})`,
            service_type: services.service_type,
            image_url: sql<string>`COALESCE(${siteServiceOverrides.image_url}, ${services.image_url})`,
            gallery: sql<string>`COALESCE(${siteServiceOverrides.gallery}, ${services.gallery})`,
            category_id: services.category_id,
            is_active: services.is_active,
            is_featured: sql<boolean>`COALESCE(${siteServiceOverrides.is_featured}, 0)`,
            tags: sql<string[]>`COALESCE(${siteServiceOverrides.tags}, ${services.tags})`,
            meta_title: sql<string>`COALESCE(${siteServiceOverrides.meta_title}, ${services.meta_title})`,
            meta_description: sql<string>`COALESCE(${siteServiceOverrides.meta_description}, ${services.meta_description})`,
            canonical_url: sql<string>`COALESCE(${siteServiceOverrides.canonical_url}, ${services.canonical_url})`,
            created_at: services.created_at,
            updated_at: services.updated_at,
        })
        .from(services)
        .leftJoin(
            siteServiceOverrides,
            and(
                eq(siteServiceOverrides.service_id, services.id),
                eq(siteServiceOverrides.site_id, siteId)
            )
        )
        .where(isNumeric ? eq(services.id, Number(param)) : eq(services.slug, param))
        .get();

    if (!result) {
        return c.json({ error: "Service not found" }, 404);
    }

    return c.json({ data: result });
});

/**
 * POST /api/services
 */
servicesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(services)
        .values({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            specs: body.specs || null,
            price: body.price || null,
            currency: body.currency || "TRY",
            service_type: body.service_type || null,
            category_id: body.category_id || null,
            image_url: body.image_url || null,
            gallery: body.gallery || null,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : true,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/services/:id
 */
servicesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(services)
        .set({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            specs: body.specs !== undefined ? (body.specs || null) : undefined,
            price: body.price !== undefined ? (body.price || null) : undefined,
            currency: body.currency || "TRY",
            service_type: body.service_type || null,
            category_id: body.category_id || null,
            image_url: body.image_url || null,
            gallery: body.gallery !== undefined ? (body.gallery || null) : undefined,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
            is_active: body.is_active !== undefined ? (!!body.is_active) : undefined,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(services.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Service not found" }, 404);
    return c.json({ data: updated });
});

/**
 * POST /api/services/:id/override
 */
servicesRoute.post("/:id/override", async (c) => {
    const serviceId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const result = await db
        .insert(siteServiceOverrides)
        .values({
            site_id: siteId,
            service_id: serviceId,
            title: body.title || null,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            specs: body.specs || null,
            price: body.price || null,
            currency: body.currency || null,
            image_url: body.image_url || null,
            gallery: body.gallery || null,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            meta_title: body.meta_title || null,
            meta_description: body.meta_description || null,
            canonical_url: body.canonical_url || null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteServiceOverrides.site_id, siteServiceOverrides.service_id],
            set: {
                title: body.title || null,
                title_en: body.title_en || null,
                description: body.description || null,
                description_en: body.description_en || null,
                content: body.content || null,
                content_en: body.content_en || null,
                specs: body.specs || null,
                price: body.price || null,
                currency: body.currency || null,
                image_url: body.image_url || null,
                gallery: body.gallery || null,
                tags: body.tags ? JSON.stringify(body.tags) : null,
                meta_title: body.meta_title || null,
                meta_description: body.meta_description || null,
                canonical_url: body.canonical_url || null,
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
 * DELETE /api/services/:id
 */
servicesRoute.delete("/:id", async (c) => {
    const param = c.req.param("id");

    // Skip if this is the override route (handled by the next handler)
    if (param === "override" || param.includes("/")) {
        return c.json({ error: "Not found" }, 404);
    }

    const id = Number(param);
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    const db = createDb(c.env.DB);

    // First delete all site overrides for this service
    await db
        .delete(siteServiceOverrides)
        .where(eq(siteServiceOverrides.service_id, id));

    // Then delete the service itself
    const deleted = await db
        .delete(services)
        .where(eq(services.id, id))
        .returning()
        .get();

    if (!deleted) return c.json({ error: "Service not found" }, 404);

    return c.json({ message: "Service deleted", data: deleted });
});

/**
 * DELETE /api/services/:id/override
 */
servicesRoute.delete("/:id/override", async (c) => {
    const serviceId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteServiceOverrides)
        .where(
            and(
                eq(siteServiceOverrides.site_id, siteId),
                eq(siteServiceOverrides.service_id, serviceId)
            )
        );

    return c.json({ message: "Override removed" });
});

/**
 * GET /api/services/:id/overrides
 */
servicesRoute.get("/:id/overrides", async (c) => {
    const serviceId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);
    const overrides = await db
        .select()
        .from(siteServiceOverrides)
        .where(eq(siteServiceOverrides.service_id, serviceId));
    return c.json({ data: overrides });
});

export default servicesRoute;
