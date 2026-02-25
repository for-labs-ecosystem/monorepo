import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { projects, siteProjectOverrides } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const projectsRoute = new Hono();

/**
 * GET /api/projects
 * Lists projects/portfolio with Inheritance/Override.
 */
projectsRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: projects.id,
            slug: projects.slug,
            title: sql<string>`COALESCE(${siteProjectOverrides.title}, ${projects.title})`,
            description: sql<string>`COALESCE(${siteProjectOverrides.description}, ${projects.description})`,
            content: sql<string>`COALESCE(${siteProjectOverrides.content}, ${projects.content})`,
            client_name: projects.client_name,
            location: projects.location,
            completion_date: projects.completion_date,
            category_id: projects.category_id,
            cover_image_url: sql<string>`COALESCE(${siteProjectOverrides.cover_image_url}, ${projects.cover_image_url})`,
            gallery: sql<string>`COALESCE(${siteProjectOverrides.gallery}, ${projects.gallery})`,
            is_featured: sql<boolean>`COALESCE(${siteProjectOverrides.is_featured}, 0)`,
            sort_order: sql<number>`COALESCE(${siteProjectOverrides.sort_order}, 0)`,
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
        .where(
            and(
                eq(projects.is_active, true),
                sql`COALESCE(${siteProjectOverrides.is_visible}, 1) = 1`
            )
        )
        .orderBy(sql`COALESCE(${siteProjectOverrides.sort_order}, 0)`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/projects/:slug
 */
projectsRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: projects.id,
            slug: projects.slug,
            title: sql<string>`COALESCE(${siteProjectOverrides.title}, ${projects.title})`,
            description: sql<string>`COALESCE(${siteProjectOverrides.description}, ${projects.description})`,
            content: sql<string>`COALESCE(${siteProjectOverrides.content}, ${projects.content})`,
            client_name: projects.client_name,
            location: projects.location,
            completion_date: projects.completion_date,
            category_id: projects.category_id,
            cover_image_url: sql<string>`COALESCE(${siteProjectOverrides.cover_image_url}, ${projects.cover_image_url})`,
            gallery: sql<string>`COALESCE(${siteProjectOverrides.gallery}, ${projects.gallery})`,
            is_featured: sql<boolean>`COALESCE(${siteProjectOverrides.is_featured}, 0)`,
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
        .where(eq(projects.slug, slug))
        .get();

    if (!result) return c.json({ error: "Project not found" }, 404);
    return c.json({ data: result });
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
            description: body.description || null,
            content: body.content || null,
            client_name: body.client_name || null,
            location: body.location || null,
            completion_date: body.completion_date || null,
            category_id: body.category_id || null,
            cover_image_url: body.cover_image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/projects/:id
 */
projectsRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(projects)
        .set({ ...body, updated_at: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(projects.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Project not found" }, 404);
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
            description: body.description || null,
            content: body.content || null,
            cover_image_url: body.cover_image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteProjectOverrides.site_id, siteProjectOverrides.project_id],
            set: {
                title: body.title || null,
                description: body.description || null,
                content: body.content || null,
                cover_image_url: body.cover_image_url || null,
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
