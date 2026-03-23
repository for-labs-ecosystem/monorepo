import { sqliteTable, text, integer, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";
import { products } from "./products";

/**
 * Global articles / blog posts / knowledge base entries.
 */
export const articles = sqliteTable("articles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    title_en: text("title_en"),
    excerpt: text("excerpt"),
    excerpt_en: text("excerpt_en"),
    content: text("content"),
    content_en: text("content_en"),
    category_id: integer("category_id").references(() => categories.id),
    cover_image_url: text("cover_image_url"),
    author: text("author"),
    
    // ─── Tags & Keywords ───
    tags: text("tags"), // JSON array of strings
    keywords: text("keywords"), // Comma-separated or JSON array

    // ─── SEO ───
    meta_title: text("meta_title"),
    meta_title_en: text("meta_title_en"),
    meta_description: text("meta_description"),
    meta_description_en: text("meta_description_en"),
    canonical_url: text("canonical_url"),
    
    // ─── Publishing ───
    published_at: text("published_at"), // ISO date string for scheduled/backdated publishing
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    is_featured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Many-to-Many junction: article ↔ related products (Content-Driven Commerce).
 */
export const articleRelatedProducts = sqliteTable(
    "article_related_products",
    {
        article_id: integer("article_id")
            .notNull()
            .references(() => articles.id, { onDelete: "cascade" }),
        product_id: integer("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.article_id, table.product_id] }),
    ]
);

export const articlesRelations = relations(articles, ({ many }) => ({
    relatedProducts: many(articleRelatedProducts),
}));

export const articleRelatedProductsRelations = relations(articleRelatedProducts, ({ one }) => ({
    article: one(articles, {
        fields: [articleRelatedProducts.article_id],
        references: [articles.id],
    }),
    product: one(products, {
        fields: [articleRelatedProducts.product_id],
        references: [products.id],
    }),
}));

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
        title_en: text("title_en"),
        excerpt: text("excerpt"),
        excerpt_en: text("excerpt_en"),
        content: text("content"),
        content_en: text("content_en"),
        cover_image_url: text("cover_image_url"),

        // ─── Tags & Keywords (Overridable) ───
        tags: text("tags"),
        keywords: text("keywords"),
        
        // ─── SEO (Overridable) ───
        meta_title: text("meta_title"),
        meta_title_en: text("meta_title_en"),
        meta_description: text("meta_description"),
        meta_description_en: text("meta_description_en"),
        canonical_url: text("canonical_url"),
        
        // ─── Publishing (Overridable) ───
        published_at: text("published_at"),
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
