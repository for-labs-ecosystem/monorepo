import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { projects, siteProjectOverrides, sites, categories, projectRelatedProducts, products } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const projectsRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * GET /api/projects
 */
projectsRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const allSites = await db.select().from(sites);

    const result = await db
        .select({
            id: projects.id,
            slug: projects.slug,
            title: sql<string>`COALESCE(${siteProjectOverrides.title}, ${projects.title})`,
            title_en: sql<string>`COALESCE(${siteProjectOverrides.title_en}, ${projects.title_en})`,
            category_id: projects.category_id,
            category_name: categories.name,
            client_name: projects.client_name,
            location: projects.location,
            completion_date: projects.completion_date,
            cover_image_url: sql<string>`COALESCE(${siteProjectOverrides.cover_image_url}, ${projects.cover_image_url})`,
            header_image_url: projects.header_image_url,
            status: projects.status,
            is_featured: sql<boolean>`COALESCE(${siteProjectOverrides.is_featured}, ${projects.is_featured})`,
            is_active: projects.is_active,
            sort_order: sql<number>`COALESCE(${siteProjectOverrides.sort_order}, ${projects.sort_order})`,
            created_at: projects.created_at,
        })
        .from(projects)
        .leftJoin(
            siteProjectOverrides,
            and(
                eq(siteProjectOverrides.project_id, projects.id),
                eq(siteProjectOverrides.site_id, siteId)
            )
        )
        .leftJoin(categories, eq(categories.id, projects.category_id))
        .where(
            c.req.query("admin") === "true"
                ? undefined
                : sql`COALESCE(${siteProjectOverrides.is_visible}, 0) = 1`
        )
        .orderBy(sql`COALESCE(${siteProjectOverrides.sort_order}, 0)`);

    const allOverrides = await db.select().from(siteProjectOverrides);

    const overrideMap = new Map<string, boolean>();
    for (const o of allOverrides) {
        overrideMap.set(`${o.project_id}_${o.site_id}`, !!o.is_visible);
    }

    const enriched = result.map(prj => ({
        ...prj,
        sites: allSites.filter(s => {
            return overrideMap.get(`${prj.id}_${s.id}`) ?? false;
        })
    }));

    return c.json({ data: enriched, count: enriched.length });
});

/**
 * GET /api/projects/:slug
 */
projectsRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const param = c.req.param("slug");
    const isNumeric = /^\d+$/.test(param);
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: projects.id,
            slug: projects.slug,
            title: sql<string>`COALESCE(${siteProjectOverrides.title}, ${projects.title})`,
            title_en: sql<string>`COALESCE(${siteProjectOverrides.title_en}, ${projects.title_en})`,
            description: sql<string>`COALESCE(${siteProjectOverrides.description}, ${projects.description})`,
            description_en: sql<string>`COALESCE(${siteProjectOverrides.description_en}, ${projects.description_en})`,
            content: sql<string>`COALESCE(${siteProjectOverrides.content}, ${projects.content})`,
            content_en: sql<string>`COALESCE(${siteProjectOverrides.content_en}, ${projects.content_en})`,
            client_name: projects.client_name,
            location: projects.location,
            completion_date: projects.completion_date,
            category_id: projects.category_id,
            cover_image_url: sql<string>`COALESCE(${siteProjectOverrides.cover_image_url}, ${projects.cover_image_url})`,
            header_image_url: projects.header_image_url,
            gallery: sql<string>`COALESCE(${siteProjectOverrides.gallery}, ${projects.gallery})`,
            metrics: projects.metrics,
            tags: projects.tags,
            video_url: projects.video_url,
            testimonial: projects.testimonial,
            testimonial_author: projects.testimonial_author,
            testimonial_author_title: projects.testimonial_author_title,
            status: projects.status,
            start_date: projects.start_date,
            is_active: projects.is_active,
            is_featured: sql<boolean>`COALESCE(${siteProjectOverrides.is_featured}, ${projects.is_featured})`,
            sort_order: sql<number>`COALESCE(${siteProjectOverrides.sort_order}, ${projects.sort_order})`,
            created_at: projects.created_at,
            updated_at: projects.updated_at,
        })
        .from(projects)
        .leftJoin(
            siteProjectOverrides,
            and(
                eq(siteProjectOverrides.project_id, projects.id),
                eq(siteProjectOverrides.site_id, siteId)
            )
        )
        .where(isNumeric ? eq(projects.id, Number(param)) : eq(projects.slug, param))
        .get();

    if (!result) return c.json({ error: "Project not found" }, 404);

    // Fetch related products (id + title only)
    const relatedRows = await db
        .select({ id: products.id, title: products.title })
        .from(projectRelatedProducts)
        .innerJoin(products, eq(products.id, projectRelatedProducts.product_id))
        .where(eq(projectRelatedProducts.project_id, result.id));

    return c.json({ data: { ...result, relatedProducts: relatedRows } });
});

/**
 * POST /api/projects
 */
projectsRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(projects)
        .values({
            slug: body.slug,
            title: body.title,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            client_name: body.client_name || null,
            location: body.location || null,
            completion_date: body.completion_date || null,
            start_date: body.start_date || null,
            category_id: body.category_id || null,
            cover_image_url: body.cover_image_url || null,
            header_image_url: body.header_image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
            metrics: body.metrics ? JSON.stringify(body.metrics) : null,
            tags: body.tags ? JSON.stringify(body.tags) : null,
            video_url: body.video_url || null,
            testimonial: body.testimonial || null,
            testimonial_author: body.testimonial_author || null,
            testimonial_author_title: body.testimonial_author_title || null,
            status: body.status || 'completed',
            is_active: body.is_active !== undefined ? (!!body.is_active) : true,
            is_featured: body.is_featured !== undefined ? (!!body.is_featured) : false,
            sort_order: body.sort_order ?? 0,
        })
        .returning()
        .get();

    // Sync related products
    const relatedProductIds: number[] = Array.isArray(body.relatedProductIds) ? body.relatedProductIds : [];
    if (relatedProductIds.length > 0) {
        await db.insert(projectRelatedProducts).values(
            relatedProductIds.map((pid) => ({ project_id: inserted.id, product_id: pid }))
        );
    }

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/projects/:id
 */
projectsRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updateData: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    // Basic fields
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.title_en !== undefined) updateData.title_en = body.title_en || null;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.description_en !== undefined) updateData.description_en = body.description_en || null;
    if (body.content !== undefined) updateData.content = body.content || null;
    if (body.content_en !== undefined) updateData.content_en = body.content_en || null;
    
    // Client & location
    if (body.client_name !== undefined) updateData.client_name = body.client_name || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.completion_date !== undefined) updateData.completion_date = body.completion_date || null;
    if (body.start_date !== undefined) updateData.start_date = body.start_date || null;
    
    // Category
    if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
    
    // Images
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url || null;
    if (body.header_image_url !== undefined) updateData.header_image_url = body.header_image_url || null;
    if (body.video_url !== undefined) updateData.video_url = body.video_url || null;
    
    // JSON fields
    if (body.gallery !== undefined) updateData.gallery = body.gallery ? JSON.stringify(body.gallery) : null;
    if (body.metrics !== undefined) updateData.metrics = body.metrics ? JSON.stringify(body.metrics) : null;
    if (body.tags !== undefined) updateData.tags = body.tags ? JSON.stringify(body.tags) : null;
    
    // Testimonial
    if (body.testimonial !== undefined) updateData.testimonial = body.testimonial || null;
    if (body.testimonial_author !== undefined) updateData.testimonial_author = body.testimonial_author || null;
    if (body.testimonial_author_title !== undefined) updateData.testimonial_author_title = body.testimonial_author_title || null;
    
    // Status & flags
    if (body.status !== undefined) updateData.status = body.status || 'completed';
    if (body.is_active !== undefined) updateData.is_active = !!body.is_active;
    if (body.is_featured !== undefined) updateData.is_featured = !!body.is_featured;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order ?? 0;

    const updated = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Project not found" }, 404);

    // Sync related products (delete-then-insert pattern)
    if (Array.isArray(body.relatedProductIds)) {
        await db.delete(projectRelatedProducts).where(eq(projectRelatedProducts.project_id, id));
        const relatedProductIds: number[] = body.relatedProductIds;
        if (relatedProductIds.length > 0) {
            await db.insert(projectRelatedProducts).values(
                relatedProductIds.map((pid) => ({ project_id: id, product_id: pid }))
            );
        }
    }

    return c.json({ data: updated });
});

/**
 * POST /api/projects/:id/override
 */
projectsRoute.post("/:id/override", async (c) => {
    const projectId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const result = await db
        .insert(siteProjectOverrides)
        .values({
            site_id: siteId,
            project_id: projectId,
            title: body.title || null,
            title_en: body.title_en || null,
            description: body.description || null,
            description_en: body.description_en || null,
            content: body.content || null,
            content_en: body.content_en || null,
            cover_image_url: body.cover_image_url || null,
            gallery: body.gallery || null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteProjectOverrides.site_id, siteProjectOverrides.project_id],
            set: {
                title: body.title || null,
                title_en: body.title_en || null,
                description: body.description || null,
                description_en: body.description_en || null,
                content: body.content || null,
                content_en: body.content_en || null,
                cover_image_url: body.cover_image_url || null,
                gallery: body.gallery || null,
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
 * GET /api/projects/:id/overrides
 */
projectsRoute.get("/:id/overrides", async (c) => {
    const projectId = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(siteProjectOverrides)
        .where(eq(siteProjectOverrides.project_id, projectId));

    return c.json({ data: result });
});

/**
 * DELETE /api/projects/:id/override
 */
projectsRoute.delete("/:id/override", async (c) => {
    const projectId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteProjectOverrides)
        .where(
            and(
                eq(siteProjectOverrides.site_id, siteId),
                eq(siteProjectOverrides.project_id, projectId)
            )
        );

    return c.json({ message: "Override removed" });
});

export default projectsRoute;
