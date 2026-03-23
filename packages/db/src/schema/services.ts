import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";

/**
 * Global services catalog.
 * Used by gidatest.com (analysis), labkurulum.com (lab setup),
 * hijyenkontrol.com (audits), and for-labs.com.
 */
export const services = sqliteTable("services", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    title_en: text("title_en"),
    description: text("description"),
    description_en: text("description_en"),
    // Detailed content (HTML)
    content: text("content"),
    content_en: text("content_en"),
    // Service specs/scope as JSON
    specs: text("specs"),
    price: real("price"),
    currency: text("currency").notNull().default("TRY"),
    // ─── Tags & Arrays ───
    tags: text("tags"),

    // ─── SEO ───
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    canonical_url: text("canonical_url"),

    // "analysis" | "setup" | "audit" | "consulting" | "training"
    service_type: text("service_type"),
    category_id: integer("category_id").references(() => categories.id),
    image_url: text("image_url"),
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
 * Per-site service overrides — same COALESCE inheritance pattern.
 */
export const siteServiceOverrides = sqliteTable(
    "site_service_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        service_id: integer("service_id")
            .notNull()
            .references(() => services.id),
        // ─── Overridable fields (all nullable) ───
        title: text("title"),
        title_en: text("title_en"),
        description: text("description"),
        description_en: text("description_en"),
        content: text("content"),
        content_en: text("content_en"),
        specs: text("specs"),
        price: real("price"),
        currency: text("currency"),
        image_url: text("image_url"),
        gallery: text("gallery"),

        // ─── Tags & Arrays (Overridable) ───
        tags: text("tags"),

        // ─── SEO (Overridable) ───
        meta_title: text("meta_title"),
        meta_description: text("meta_description"),
        canonical_url: text("canonical_url"),

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
        uniqueIndex("uq_site_service").on(table.site_id, table.service_id),
    ]
);
