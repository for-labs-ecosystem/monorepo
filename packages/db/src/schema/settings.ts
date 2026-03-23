import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Global Settings — Singleton table (only id=1 row).
 * Stores system-wide configuration as JSON columns.
 */
export const settings = sqliteTable("settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // Company & billing info (official name, tax number, tax office, HQ address, contact phone)
    company_info: text("company_info").default("{}"),
    // Iyzico payment gateway config (api_key, secret_key, base_url, is_sandbox)
    iyzico_config: text("iyzico_config").default("{}"),
    // SMTP email config (host, port, user, password, sender_email, sender_name)
    smtp_config: text("smtp_config").default("{}"),
    // E-commerce defaults (default_currency, default_vat_rate)
    ecommerce_config: text("ecommerce_config").default("{}"),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
