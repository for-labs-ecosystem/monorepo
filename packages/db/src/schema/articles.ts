import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";

/**
 * Global articles / blog posts / knowledge base entries.
 */
export const articles = sqliteTable("articles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    category_id: integer("category_id").references(() => categories.id),
    cover_image_url: text("cover_image_url"),
    author: text("author"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Per-site article overrides — same COALESCE pattern as products.
 */
export const siteArticleOverrides = sqliteTable(
    "site_article_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        article_id: integer("article_id")
            .notNull()
            .references(() => articles.id),
        // ─── Overridable fields ───
        title: text("title"),
        excerpt: text("excerpt"),
        content: text("content"),
        cover_image_url: text("cover_image_url"),
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
        uniqueIndex("uq_site_article").on(table.site_id, table.article_id),
    ]
);
