import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    name_en: text("name_en"),
    description: text("description"),
    description_en: text("description_en"),
    parent_id: integer("parent_id").references((): any => categories.id),
    type: text("type").default("product"),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    // SEO
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    canonical_url: text("canonical_url"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Per-site category overrides.
 * Allows sites to have different parent_id, sort_order, visibility and SEO for global categories.
 */
export const siteCategoryOverrides = sqliteTable(
    "site_category_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        category_id: integer("category_id")
            .notNull()
            .references(() => categories.id),

        // Overridable fields
        name: text("name"),
        name_en: text("name_en"),
        description: text("description"),
        description_en: text("description_en"),
        parent_id: integer("parent_id").references((): any => categories.id),
        sort_order: integer("sort_order"),

        // SEO (Overridable)
        meta_title: text("meta_title"),
        meta_description: text("meta_description"),
        canonical_url: text("canonical_url"),

        // Site-specific controls
        is_visible: integer("is_visible", { mode: "boolean" }).notNull().default(true),

        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        uniqueIndex("uq_site_category").on(table.site_id, table.category_id),
    ]
);
