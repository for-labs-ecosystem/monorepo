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
    description: text("description"),
    // Detailed content (HTML)
    content: text("content"),
    // Service specs/scope as JSON
    specs: text("specs"),
    price: real("price"),
    currency: text("currency").notNull().default("TRY"),
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
        description: text("description"),
        content: text("content"),
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
        uniqueIndex("uq_site_service").on(table.site_id, table.service_id),
    ]
);
