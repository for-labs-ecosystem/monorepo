import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";
import { members } from "./members";

/**
 * Contact / quote request forms submitted by visitors or members.
 * Uses a dynamic JSON payload to support any form structure.
 */
export const inquiries = sqliteTable("inquiries", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    site_id: integer("site_id")
        .notNull()
        .references(() => sites.id),
    member_id: text("member_id").references(() => members.id),
    sender_name: text("sender_name").notNull(),
    sender_email: text("sender_email").notNull(),
    // All dynamic form fields stored as JSON key-value pairs
    payload: text("payload", { mode: "json" }).$type<Record<string, string>>(),
    // "new" | "read" | "replied" | "archived"
    status: text("status", {
        enum: ["new", "read", "replied", "archived"],
    })
        .notNull()
        .default("new"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Messages within an inquiry thread (from admin to user, or user to admin).
 */
export const inquiryMessages = sqliteTable("inquiry_messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    inquiry_id: integer("inquiry_id")
        .notNull()
        .references(() => inquiries.id, { onDelete: "cascade" }),
    sender: text("sender", { enum: ["user", "admin"] }).notNull(),
    message: text("message").notNull(),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
