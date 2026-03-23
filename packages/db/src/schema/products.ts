import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";

/**
 * Global product catalog.
 * Every product is entered ONCE here. Sites inherit these values
 * unless they have a row in `site_product_overrides`.
 */
export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    title_en: text("title_en"),
    description: text("description"),
    description_en: text("description_en"),
    // Full HTML content / detailed product page
    content: text("content"),
    content_en: text("content_en"),
    // Technical specs, ingredients etc. stored as JSON string
    specs: text("specs"),
    specs_en: text("specs_en"),

    // ─── Pricing ───
    price: real("price"),
    compare_price: real("compare_price"),
    currency: text("currency").notNull().default("TRY"),
    unit: text("unit"),              // Adet, Kg, Lt, Kutu...

    // ─── Catalog details ───
    brand: text("brand"),
    model_number: text("model_number"),
    sku: text("sku"),
    warranty_period: text("warranty_period"),     // "2 Yıl", "6 Ay"...
    campaign_label: text("campaign_label"),       // "Yeni", "%20 İndirim", "Çok Satan"

    // ─── JSON arrays (stored as text) ───
    // Features: [{ key: "Ağırlık", value: "2.5 Kg" }, { key: "Boyut", value: "30x20cm" }]
    features: text("features"),
    features_en: text("features_en"),
    // Application areas: ["Gıda Endüstrisi", "İlaç Sektörü", "Kozmetik"]
    application_areas: text("application_areas"),
    application_areas_en: text("application_areas_en"),
    // Tags: ["laboratuvar", "analiz", "kimya"]
    tags: text("tags"),
    tags_en: text("tags_en"),

    // ─── Intelligence Platform (Matching Wizard) ───
    // Analysis types: ["pH Ölçüm","Brix Ölçüm","Titrasyon","Mikrobiyoloji"]
    analysis_types: text("analysis_types"),
    analysis_types_en: text("analysis_types_en"),
    // Automation level: "manual" | "semi-auto" | "full-auto"
    automation_level: text("automation_level"),
    // Compliance tags: ["ISO 17025","GLP/GMP","CE","FDA"]
    compliance_tags: text("compliance_tags"),

    // ─── SEO ───
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    canonical_url: text("canonical_url"),

    // ─── Relations & media ───
    category_id: integer("category_id").references(() => categories.id),
    image_url: text("image_url"),
    // Additional images as JSON array string
    gallery: text("gallery"),

    // ─── Status ───
    is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
    is_featured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    sort_order: integer("sort_order").notNull().default(0),

    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Per-site product overrides.
 * Every column (except id, site_id, product_id) is NULLABLE.
 * NULL = "inherit from global products table"
 * Non-NULL = "override for this site only"
 */
export const siteProductOverrides = sqliteTable(
    "site_product_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        product_id: integer("product_id")
            .notNull()
            .references(() => products.id),
        // ─── Overridable fields (all nullable) ───
        title: text("title"),
        title_en: text("title_en"),
        description: text("description"),
        description_en: text("description_en"),
        content: text("content"),
        content_en: text("content_en"),
        specs: text("specs"),
        price: real("price"),
        compare_price: real("compare_price"),
        currency: text("currency"),
        image_url: text("image_url"),
        gallery: text("gallery"),
        campaign_label: text("campaign_label"),

        // ─── SEO (Overridable) ───
        meta_title: text("meta_title"),
        meta_description: text("meta_description"),
        canonical_url: text("canonical_url"),
        // ─── Site-specific controls ───
        is_visible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
        is_featured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
        sort_order: integer("sort_order").notNull().default(0),
        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        uniqueIndex("uq_site_product").on(table.site_id, table.product_id),
    ]
);
