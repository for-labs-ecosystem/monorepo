import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Media metadata — actual files live in R2.
 * site_id = NULL means it's a global/shared asset.
 * Path follows: tenant_slug/{category}/{yyyy}/{mm}/{filename}-{hash}.{ext}
 */
export const media = sqliteTable("media", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    site_id: integer("site_id").references(() => sites.id),
    filename: text("filename").notNull(),
    // Full R2 key path
    path: text("path").notNull().unique(),
    mime_type: text("mime_type").notNull(),
    size: integer("size").notNull(),
    alt_text: text("alt_text"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
