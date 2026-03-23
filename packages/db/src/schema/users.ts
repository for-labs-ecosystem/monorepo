import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Admin users for the CMS panel.
 * Authentication is Google OAuth only — NO passwords stored.
 * Users must be pre-authorized (email added to table) before they can log in.
 */
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatar_url: text("avatar_url"),
    role: text("role", {
        enum: ["super_admin", "admin", "editor"],
    })
        .notNull()
        .default("editor"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    last_login: text("last_login"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
