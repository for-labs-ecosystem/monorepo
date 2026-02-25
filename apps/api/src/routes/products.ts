import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import {
    products,
    siteProductOverrides,
    categories,
} from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const productsRoute = new Hono();

/**
 * GET /api/products
 * Lists products with Inheritance/Override logic.
 * Uses COALESCE: if a site override exists, use its value; otherwise fallback to global.
 */
productsRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: products.id,
            slug: products.slug,
            title: sql<string>`COALESCE(${siteProductOverrides.title}, ${products.title})`,
            description: sql<string>`COALESCE(${siteProductOverrides.description}, ${products.description})`,
            specs: sql<string>`COALESCE(${siteProductOverrides.specs}, ${products.specs})`,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
            currency: sql<string>`COALESCE(${siteProductOverrides.currency}, ${products.currency})`,
            image_url: sql<string>`COALESCE(${siteProductOverrides.image_url}, ${products.image_url})`,
            gallery: sql<string>`COALESCE(${siteProductOverrides.gallery}, ${products.gallery})`,
            category_id: products.category_id,
            is_featured: sql<boolean>`COALESCE(${siteProductOverrides.is_featured}, 0)`,
            sort_order: sql<number>`COALESCE(${siteProductOverrides.sort_order}, 0)`,
            created_at: products.created_at,
        })
        .from(products)
        .leftJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId)
            )
        )
        .where(
            and(
                eq(products.is_active, true),
                sql`COALESCE(${siteProductOverrides.is_visible}, 1) = 1`
            )
        )
        .orderBy(sql`COALESCE(${siteProductOverrides.sort_order}, 0)`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/products/:slug
 * Single product with override applied.
 */
productsRoute.get("/:slug", async (c) => {
    const siteId = c.get("siteId") as number;
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);

    const result = await db
        .select({
            id: products.id,
            slug: products.slug,
            title: sql<string>`COALESCE(${siteProductOverrides.title}, ${products.title})`,
            description: sql<string>`COALESCE(${siteProductOverrides.description}, ${products.description})`,
            specs: sql<string>`COALESCE(${siteProductOverrides.specs}, ${products.specs})`,
            price: sql<number>`COALESCE(${siteProductOverrides.price}, ${products.price})`,
            currency: sql<string>`COALESCE(${siteProductOverrides.currency}, ${products.currency})`,
            image_url: sql<string>`COALESCE(${siteProductOverrides.image_url}, ${products.image_url})`,
            gallery: sql<string>`COALESCE(${siteProductOverrides.gallery}, ${products.gallery})`,
            category_id: products.category_id,
            is_featured: sql<boolean>`COALESCE(${siteProductOverrides.is_featured}, 0)`,
            created_at: products.created_at,
            updated_at: products.updated_at,
        })
        .from(products)
        .leftJoin(
            siteProductOverrides,
            and(
                eq(siteProductOverrides.product_id, products.id),
                eq(siteProductOverrides.site_id, siteId)
            )
        )
        .where(eq(products.slug, slug))
        .get();

    if (!result) {
        return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ data: result });
});

/**
 * POST /api/products
 * Create a global product (Admin only — auth checked by middleware).
 */
productsRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(products)
        .values({
            slug: body.slug,
            title: body.title,
            description: body.description || null,
            specs: body.specs || null,
            price: body.price || null,
            currency: body.currency || "TRY",
            category_id: body.category_id || null,
            image_url: body.image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/products/:id
 * Update a global product.
 */
productsRoute.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(products)
        .set({
            ...body,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(products.id, id))
        .returning()
        .get();

    if (!updated) {
        return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ data: updated });
});

/**
 * POST /api/products/:id/override
 * Create or update a site-specific override for a product.
 * Body: { title?, description?, price?, ... }
 */
productsRoute.post("/:id/override", async (c) => {
    const productId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    // Upsert: insert or update on conflict
    const result = await db
        .insert(siteProductOverrides)
        .values({
            site_id: siteId,
            product_id: productId,
            title: body.title || null,
            description: body.description || null,
            specs: body.specs || null,
            price: body.price || null,
            currency: body.currency || null,
            image_url: body.image_url || null,
            gallery: body.gallery ? JSON.stringify(body.gallery) : null,
            is_visible: body.is_visible ?? true,
            is_featured: body.is_featured ?? false,
            sort_order: body.sort_order ?? 0,
        })
        .onConflictDoUpdate({
            target: [siteProductOverrides.site_id, siteProductOverrides.product_id],
            set: {
                title: body.title || null,
                description: body.description || null,
                specs: body.specs || null,
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
 * DELETE /api/products/:id/override
 * Remove a site-specific override (revert to global values).
 */
productsRoute.delete("/:id/override", async (c) => {
    const productId = Number(c.req.param("id"));
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    await db
        .delete(siteProductOverrides)
        .where(
            and(
                eq(siteProductOverrides.site_id, siteId),
                eq(siteProductOverrides.product_id, productId)
            )
        );

    return c.json({ message: "Override removed, reverted to global values" });
});

export default productsRoute;
