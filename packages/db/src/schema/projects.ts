import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";

/**
 * Global project portfolio / reference gallery.
 * Primarily for labkurulum.com (completed lab installations)
 * but any site can show project references.
 */
export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    // Full case-study / detail content (HTML)
    content: text("content"),
    client_name: text("client_name"),
    // Location or city
    location: text("location"),
    // Completion date as text (e.g. "2025-06")
    completion_date: text("completion_date"),
    category_id: integer("category_id").references(() => categories.id),
    cover_image_url: text("cover_image_url"),
    // JSON array of gallery image URLs
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
 * Per-site project overrides.
 */
export const siteProjectOverrides = sqliteTable(
    "site_project_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        project_id: integer("project_id")
            .notNull()
            .references(() => projects.id),
        // ─── Overridable fields ───
        title: text("title"),
        description: text("description"),
        content: text("content"),
        cover_image_url: text("cover_image_url"),
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
        uniqueIndex("uq_site_project").on(table.site_id, table.project_id),
    ]
);
