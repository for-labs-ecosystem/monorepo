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
    customer_type: text("customer_type").default("individual"), // 'individual' or 'corporate'
    company_name: text("company_name"),
    tax_office: text("tax_office"),
    tax_number: text("tax_number"),
    shipping_address: text("shipping_address"),
    billing_address: text("billing_address"),
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
    payment_method: text("payment_method").default("iyzico"), // 'iyzico', 'bank_transfer', 'cash' etc.
    iyzico_token: text("iyzico_token"),
    iyzico_payment_id: text("iyzico_payment_id"),
    // ─── Fulfillment ───
    status: text("status", {
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    })
        .notNull()
        .default("pending"),
    notes: text("notes"),
    admin_notes: text("admin_notes"),
    seen_at: text("seen_at"), // null = unseen, timestamp = seen by admin
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Order Items — normalized line items for order detail views.
 * Also stored as JSON in orders.items for backward compatibility.
 */
export const orderItems = sqliteTable("order_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    order_id: integer("order_id")
        .notNull()
        .references(() => orders.id),
    product_id: integer("product_id"),
    product_name: text("product_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unit_price: real("unit_price").notNull(),
    total_price: real("total_price").notNull(),
});
