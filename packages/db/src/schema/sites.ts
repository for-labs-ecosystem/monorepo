import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sites = sqliteTable("sites", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    domain: text("domain").notNull().unique(),
    name: text("name").notNull(),
    name_en: text("name_en"),
    description: text("description"),
    description_en: text("description_en"),
    logo_url: text("logo_url"),
    // JSON string for theme config (primary color, font, etc.)
    theme_config: text("theme_config"),
    // JSON array of enabled content module keys
    // e.g. '["products","articles","services","pages","projects"]'
    // null or missing = all modules enabled
    enabled_modules: text("enabled_modules"),
    has_ecommerce: integer("has_ecommerce", { mode: "boolean" })
        .notNull()
        .default(false),
    // JSON string for ecommerce specific settings (payment keys, currency, tax, etc.)
    ecommerce_config: text("ecommerce_config"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
