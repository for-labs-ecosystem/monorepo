import { sqliteTable, text, integer, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { categories } from "./categories";
import { sites } from "./sites";
import { products } from "./products";

/**
 * Global project portfolio / reference gallery.
 * Primarily for labkurulum.com (completed lab installations)
 * but any site can show project references.
 */
export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    title_en: text("title_en"),
    description: text("description"),
    description_en: text("description_en"),
    // Full case-study / detail content (HTML)
    content: text("content"),
    content_en: text("content_en"),
    client_name: text("client_name"),
    // Location or city
    location: text("location"),
    // Completion date as text (e.g. "2025-06")
    completion_date: text("completion_date"),
    category_id: integer("category_id").references(() => categories.id),
    cover_image_url: text("cover_image_url"),
    // Header/banner image for project detail page
    header_image_url: text("header_image_url"),
    // JSON array of gallery image URLs
    gallery: text("gallery"),
    // JSON object for project metrics (e.g. {"area": "500m²", "duration": "3 ay", "budget": "₺2.5M"})
    metrics: text("metrics"),
    // JSON array of tags
    tags: text("tags"),
    // Video URL (YouTube/Vimeo embed)
    video_url: text("video_url"),
    // Client testimonial
    testimonial: text("testimonial"),
    testimonial_author: text("testimonial_author"),
    testimonial_author_title: text("testimonial_author_title"),
    // Project status
    status: text("status").default("completed"),
    // Project start date
    start_date: text("start_date"),
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
 * Many-to-Many junction: project ↔ related products (Content-Driven Commerce).
 */
export const projectRelatedProducts = sqliteTable(
    "project_related_products",
    {
        project_id: integer("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        product_id: integer("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.project_id, table.product_id] }),
    ]
);

export const projectsRelations = relations(projects, ({ many }) => ({
    relatedProducts: many(projectRelatedProducts),
}));

export const projectRelatedProductsRelations = relations(projectRelatedProducts, ({ one }) => ({
    project: one(projects, {
        fields: [projectRelatedProducts.project_id],
        references: [projects.id],
    }),
    product: one(products, {
        fields: [projectRelatedProducts.product_id],
        references: [products.id],
    }),
}));

/**
 * Per-site project overrides.
 */
export const siteProjectOverrides = sqliteTable(
    "site_project_overrides",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        project_id: integer("project_id")
            .notNull()
            .references(() => projects.id),
        // ─── Overridable fields ───
        title: text("title"),
        title_en: text("title_en"),
        description: text("description"),
        description_en: text("description_en"),
        content: text("content"),
        content_en: text("content_en"),
        cover_image_url: text("cover_image_url"),
        gallery: text("gallery"),
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
        uniqueIndex("uq_site_project").on(table.site_id, table.project_id),
    ]
);
