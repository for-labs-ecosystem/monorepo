import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Members — End-user/customer accounts for public-facing sites.
 *
 * SECURITY ISOLATION: Members are intentionally separated from the `users`
 * table which holds CMS Admin accounts. Never mix these two domains.
 *
 * Supports both password-based and Google OAuth authentication.
 * JSON fields store flexible user data (addresses, cart, favorites).
 */
export const members = sqliteTable("members", {
    id: text("id").primaryKey(), // cuid or uuid generated at creation
    site_id: integer("site_id")
        .notNull()
        .references(() => sites.id),
    full_name: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash"), // nullable — Google OAuth users won't have this
    google_id: text("google_id"), // nullable — password-based users won't have this
    phone: text("phone"),
    company_name: text("company_name"), // nullable — for corporate members
    is_active: integer("is_active").notNull().default(1), // 1 = active, 0 = disabled

    // ─── JSON Fields (flexible user data) ───
    addresses: text("addresses"), // JSON array — individual/corporate addresses (tax_no, city, district, etc.)
    cart_data: text("cart_data"), // JSON — last abandoned cart state
    favorite_products: text("favorite_products"), // JSON array — saved product IDs
    favorite_articles: text("favorite_articles"), // JSON array — saved article IDs

    // ─── Timestamps ───
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
