import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sites = sqliteTable("sites", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    domain: text("domain").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    logo_url: text("logo_url"),
    // JSON string for theme config (primary color, font, etc.)
    theme_config: text("theme_config"),
    has_ecommerce: integer("has_ecommerce", { mode: "boolean" })
        .notNull()
        .default(false),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
