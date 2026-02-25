import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Contact / quote request forms submitted by visitors.
 * No override needed — each inquiry belongs to a specific site.
 */
export const inquiries = sqliteTable("inquiries", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    site_id: integer("site_id")
        .notNull()
        .references(() => sites.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    subject: text("subject"),
    message: text("message").notNull(),
    // "new" | "read" | "replied" | "archived"
    status: text("status", {
        enum: ["new", "read", "replied", "archived"],
    })
        .notNull()
        .default("new"),
    // Optional: which page/service the inquiry is about
    source_type: text("source_type"), // e.g. "service", "product", "general"
    source_id: integer("source_id"),  // e.g. service_id or product_id
    admin_notes: text("admin_notes"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
