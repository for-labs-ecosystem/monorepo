import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { services, siteServiceOverrides } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const servicesRoute = new Hono();

/**
 * GET /api/services
 * Lists services with Inheritance/Override logic.
 */
servicesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: services.id,
            slug: services.slug,
            title: sql<string>`COALESCE(${siteServiceOverrides.title}, ${services.title})`,
            description: sql<string>`COALESCE(${siteServiceOverrides.description}, ${services.description})`,
            content: sql<string>`COALESCE(${siteServiceOverrides.content}, ${services.content})`,
            specs: sql<string>`COALESCE(${siteServiceOverrides.specs}, ${services.specs})`,
            price: sql<number>`COALESCE(${siteServiceOverrides.price}, ${services.price})`,
            currency: sql<string>`COALESCE(${siteServiceOverrides.currency}, ${services.currency})`,
            service_type: services.service_type,
            image_url: sql<string>`COALESCE(${siteServiceOverrides.image_url}, ${services.image_url})`,
            gallery: sql<string>`COALESCE(${siteServiceOverrides.gallery}, ${services.gallery})`,
            category_id: services.category_id,
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
        .where(
            and(
                eq(services.is_active, true),
                sql`COALESCE(${siteServiceOverrides.is_visible}, 1) = 1`
            )
        )
        .orderBy(sql`COALESCE(${siteServiceOverrides.sort_order}, 0)`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/services/:slug
 */
servicesRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: services.id,
            slug: services.slug,
            title: sql<string>`COALESCE(${siteServiceOverrides.title}, ${services.title})`,
            description: sql<string>`COALESCE(${siteServiceOverrides.description}, ${services.description})`,
            content: sql<string>`COALESCE(${siteServiceOverrides.content}, ${services.content})`,
            specs: sql<string>`COALESCE(${siteServiceOverrides.specs}, ${services.specs})`,
            price: sql<number>`COALESCE(${siteServiceOverrides.price}, ${services.price})`,
            currency: sql<string>`COALESCE(${siteServiceOverrides.currency}, ${services.currency})`,
            service_type: services.service_type,
            image_url: sql<string>`COALESCE(${siteServiceOverrides.image_url}, ${services.image_url})`,
            gallery: sql<string>`COALESCE(${siteServiceOverrides.gallery}, ${services.gallery})`,
            category_id: services.category_id,
            is_featured: sql<boolean>`COALESCE(${siteServiceOverrides.is_featured}, 0)`,
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
        .where(eq(services.slug, slug))
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
            description: body.description || null,
            content: body.content || null,
            specs: body.specs ? JSON.stringify(body.specs) : null,
            price: body.price || null,
            currency: body.currency || "TRY",
            service_type: body.service_type || null,
            category_id: body.category_id || null,
            image_url: body.image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
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
        .set({ ...body, updated_at: sql`(CURRENT_TIMESTAMP)` })
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
            description: body.description || null,
            content: body.content || null,
            specs: body.specs ? JSON.stringify(body.specs) : null,
            price: body.price || null,
            currency: body.currency || null,
            image_url: body.image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteServiceOverrides.site_id, siteServiceOverrides.service_id],
            set: {
                title: body.title || null,
                description: body.description || null,
                content: body.content || null,
                specs: body.specs ? JSON.stringify(body.specs) : null,
                price: body.price || null,
                currency: body.currency || null,
                image_url: body.image_url || null,
                gallery: body.gallery ? JSON.stringify(body.gallery) : null,
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

export default servicesRoute;
