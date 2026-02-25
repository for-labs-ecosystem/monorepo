import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";

/**
 * Global product catalog.
 * Every product is entered ONCE here. Sites inherit these values
 * unless they have a row in `site_product_overrides`.
 */
export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    // Technical specs, ingredients etc. stored as JSON string
    specs: text("specs"),
    price: real("price"),
    currency: text("currency").notNull().default("TRY"),
    category_id: integer("category_id").references(() => categories.id),
    image_url: text("image_url"),
    // Additional images as JSON array string
    gallery: text("gallery"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Per-site product overrides.
 * Every column (except id, site_id, product_id) is NULLABLE.
 * NULL = "inherit from global products table"
 * Non-NULL = "override for this site only"
 *
 * Query pattern:
 *   SELECT COALESCE(o.title, p.title), COALESCE(o.price, p.price) ...
 *   FROM products p
 *   LEFT JOIN site_product_overrides o ON o.product_id = p.id AND o.site_id = ?
 */
export const siteProductOverrides = sqliteTable(
    "site_product_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        product_id: integer("product_id")
            .notNull()
            .references(() => products.id),
        // ─── Overridable fields (all nullable) ───
        title: text("title"),
        description: text("description"),
        specs: text("specs"),
        price: real("price"),
        currency: text("currency"),
        image_url: text("image_url"),
        gallery: text("gallery"),
        // ─── Site-specific controls ───
        is_visible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
        is_featured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
        sort_order: integer("sort_order").notNull().default(0),
        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        uniqueIndex("uq_site_product").on(table.site_id, table.product_id),
    ]
);
