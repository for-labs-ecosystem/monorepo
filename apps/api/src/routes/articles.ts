import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { articles, siteArticleOverrides } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const articlesRoute = new Hono();

/**
 * GET /api/articles
 * Lists articles with Inheritance/Override logic.
 */
articlesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: sql<string>`COALESCE(${siteArticleOverrides.title}, ${articles.title})`,
            excerpt: sql<string>`COALESCE(${siteArticleOverrides.excerpt}, ${articles.excerpt})`,
            content: sql<string>`COALESCE(${siteArticleOverrides.content}, ${articles.content})`,
            cover_image_url: sql<string>`COALESCE(${siteArticleOverrides.cover_image_url}, ${articles.cover_image_url})`,
            category_id: articles.category_id,
            author: articles.author,
            is_featured: sql<boolean>`COALESCE(${siteArticleOverrides.is_featured}, 0)`,
            sort_order: sql<number>`COALESCE(${siteArticleOverrides.sort_order}, 0)`,
            created_at: articles.created_at,
        })
        .from(articles)
        .leftJoin(
            siteArticleOverrides,
            and(
                eq(siteArticleOverrides.article_id, articles.id),
                eq(siteArticleOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(articles.is_active, true),
                sql`COALESCE(${siteArticleOverrides.is_visible}, 1) = 1`
            )
        )
        .orderBy(sql`COALESCE(${siteArticleOverrides.sort_order}, 0)`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/articles/:slug
 */
articlesRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: sql<string>`COALESCE(${siteArticleOverrides.title}, ${articles.title})`,
            excerpt: sql<string>`COALESCE(${siteArticleOverrides.excerpt}, ${articles.excerpt})`,
            content: sql<string>`COALESCE(${siteArticleOverrides.content}, ${articles.content})`,
            cover_image_url: sql<string>`COALESCE(${siteArticleOverrides.cover_image_url}, ${articles.cover_image_url})`,
            category_id: articles.category_id,
            author: articles.author,
            created_at: articles.created_at,
            updated_at: articles.updated_at,
        })
        .from(articles)
        .leftJoin(
            siteArticleOverrides,
            and(
                eq(siteArticleOverrides.article_id, articles.id),
                eq(siteArticleOverrides.site_id, siteId)
            )
        )
        .where(eq(articles.slug, slug))
        .get();

    if (!result) {
        return c.json({ error: "Article not found" }, 404);
    }

    return c.json({ data: result });
});

/**
 * POST /api/articles
 */
articlesRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(articles)
        .values({
            slug: body.slug,
            title: body.title,
            excerpt: body.excerpt || null,
            content: body.content || null,
            category_id: body.category_id || null,
            cover_image_url: body.cover_image_url || null,
            author: body.author || null,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/articles/:id
 */
articlesRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(articles)
        .set({
            ...body,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(articles.id, id))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Article not found" }, 404);
    }

    return c.json({ data: updated });
});

/**
 * POST /api/articles/:id/override
 */
articlesRoute.post("/:id/override", async (c) => {
    const articleId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const result = await db
        .insert(siteArticleOverrides)
        .values({
            site_id: siteId,
            article_id: articleId,
            title: body.title || null,
            excerpt: body.excerpt || null,
            content: body.content || null,
            cover_image_url: body.cover_image_url || null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteArticleOverrides.site_id, siteArticleOverrides.article_id],
            set: {
                title: body.title || null,
                excerpt: body.excerpt || null,
                content: body.content || null,
                cover_image_url: body.cover_image_url || null,
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
 * DELETE /api/articles/:id/override
 */
articlesRoute.delete("/:id/override", async (c) => {
    const articleId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteArticleOverrides)
        .where(
            and(
                eq(siteArticleOverrides.site_id, siteId),
                eq(siteArticleOverrides.article_id, articleId)
            )
        );

    return c.json({ message: "Override removed" });
});

export default articlesRoute;
