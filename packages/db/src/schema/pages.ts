import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Global CMS pages.
 * Dynamic content pages: About Us, KVKK, Contact, Terms, etc.
 * Every site inherits these; overrides allow per-site customization.
 */
export const pages = sqliteTable("pages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    title_en: text("title_en"),
    // Full HTML content
    content: text("content"),
    content_en: text("content_en"),
    // Cover image (hero)
    cover_image_url: text("cover_image_url"),
    // SEO
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    canonical_url: text("canonical_url"),
    keywords: text("keywords"),
    // "corporate" | "legal" | "info" | "landing"
    page_type: text("page_type").notNull().default("corporate"),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Per-site page overrides.
 * e.g. atagotr.com shows a different "About Us" content than for-labs.com
 */
export const sitePageOverrides = sqliteTable(
    "site_page_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        page_id: integer("page_id")
            .notNull()
            .references(() => pages.id),
        // ─── Overridable fields ───
        title: text("title"),
        title_en: text("title_en"),
        content: text("content"),
        content_en: text("content_en"),
        cover_image_url: text("cover_image_url"),
        meta_title: text("meta_title"),
        meta_description: text("meta_description"),
        canonical_url: text("canonical_url"),
        keywords: text("keywords"),
        // ─── Site-specific controls ───
        is_visible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
        sort_order: integer("sort_order").notNull().default(0),
        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        uniqueIndex("uq_site_page").on(table.site_id, table.page_id),
    ]
);
