import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Orders — only for sites with has_ecommerce = true (for-labs.com, atagotr.com).
 * Cart items are stored as a JSON string (array of {product_id, title, qty, unit_price}).
 * NEVER store credit card data — Iyzico Hosted Checkout handles that.
 */
export const orders = sqliteTable("orders", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    site_id: integer("site_id")
        .notNull()
        .references(() => sites.id),
    order_number: text("order_number").notNull().unique(),
    // ─── Customer info ───
    customer_name: text("customer_name").notNull(),
    customer_email: text("customer_email").notNull(),
    customer_phone: text("customer_phone"),
    shipping_address: text("shipping_address"),
    // ─── Line items as JSON ───
    items: text("items").notNull(), // JSON array
    // ─── Totals (calculated on backend, NEVER trust frontend) ───
    subtotal: real("subtotal").notNull(),
    tax: real("tax").notNull().default(0),
    total: real("total").notNull(),
    currency: text("currency").notNull().default("TRY"),
    // ─── Payment (Iyzico) ───
    payment_status: text("payment_status", {
        enum: ["pending", "paid", "failed", "refunded"],
    })
        .notNull()
        .default("pending"),
    iyzico_token: text("iyzico_token"),
    iyzico_payment_id: text("iyzico_payment_id"),
    // ─── Fulfillment ───
    status: text("status", {
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    })
        .notNull()
        .default("pending"),
    notes: text("notes"),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
