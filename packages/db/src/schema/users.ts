import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Admin users for the CMS panel.
 * Passwords are hashed (bcrypt or argon2 via Web Crypto API).
 */
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role", {
        enum: ["super_admin", "admin", "editor"],
    })
        .notNull()
        .default("editor"),
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
