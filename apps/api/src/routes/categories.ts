import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { categories } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const categoriesRoute = new Hono();

/**
 * GET /api/categories
 * List all active categories.
 */
categoriesRoute.get("/", async (c) => {
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.is_active, true))
        .orderBy(categories.sort_order);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/categories/:slug
 */
categoriesRoute.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
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
            description: body.description || null,
            parent_id: body.parent_id || null,
            sort_order: body.sort_order ?? 0,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
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

export default categoriesRoute;
