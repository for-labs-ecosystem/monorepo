// @forlabs/shared — Zod validators
// Synced with packages/db/src/schema as of 2026-02-27
import { z } from "zod";

// ─── Site ───
export const createSiteSchema = z.object({
    name: z.string().min(1, "Site adı zorunludur"),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
    domain: z.string().min(1, "Domain zorunludur"),
    description: z.string().nullable().optional(),
    has_ecommerce: z.boolean().default(false),
    is_active: z.boolean().default(true),
    enabled_modules: z.array(z.string()).nullable().optional(),
    ecommerce_config: z.record(z.unknown()).nullable().optional(),
});

export const updateSiteSchema = createSiteSchema.partial();

// ─── Category ───
export const createCategorySchema = z.object({
    name: z.string().min(1, "Kategori adı zorunludur"),
    name_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    description: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    parent_id: z.number().int().positive().nullable().optional(),
    type: z.enum(["product", "article", "service", "project"]).default("product"),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Product ───
export const createProductSchema = z.object({
    title: z.string().min(1, "Ürün başlığı zorunludur"),
    title_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    description: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    content_en: z.string().nullable().optional(),
    specs: z.string().nullable().optional(),
    price: z.number().nonnegative().nullable().optional(),
    compare_price: z.number().nonnegative().nullable().optional(),
    currency: z.string().default("TRY"),
    unit: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    model_number: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    warranty_period: z.string().nullable().optional(),
    campaign_label: z.string().nullable().optional(),
    features: z.string().nullable().optional(),
    application_areas: z.string().nullable().optional(),
    tags: z.string().nullable().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    image_url: z.string().nullable().optional(),
    gallery: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ─── Article ───
export const createArticleSchema = z.object({
    title: z.string().min(1, "Makale başlığı zorunludur"),
    title_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    excerpt: z.string().nullable().optional(),
    excerpt_en: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    content_en: z.string().nullable().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    cover_image_url: z.string().nullable().optional(),
    author: z.string().nullable().optional(),
    // Tags & Keywords
    tags: z.union([z.array(z.string()), z.string()]).nullable().optional(),
    keywords: z.string().nullable().optional(),
    // SEO
    meta_title: z.string().nullable().optional(),
    meta_title_en: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    meta_description_en: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
    // Publishing
    published_at: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    // Related Products (Content-Driven Commerce)
    relatedProductIds: z.array(z.number().int().positive()).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

// ─── Service ───
export const createServiceSchema = z.object({
    title: z.string().min(1, "Hizmet başlığı zorunludur"),
    title_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    description: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    content_en: z.string().nullable().optional(),
    specs: z.string().nullable().optional(),
    price: z.number().nonnegative().nullable().optional(),
    currency: z.string().default("TRY"),
    tags: z.array(z.string()).nullable().optional(),
    service_type: z.string().nullable().optional(),
    category_id: z.number().int().positive().nullable().optional(),
    image_url: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ─── Inquiry ───
export const createInquirySchema = z.object({
    name: z.string().min(1, "İsim zorunludur"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    phone: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    message: z.string().min(1, "Mesaj zorunludur"),
    source_type: z.string().nullable().optional(),
    source_id: z.number().int().positive().nullable().optional(),
});

// ─── Page ───
export const createPageSchema = z.object({
    title: z.string().min(1, "Sayfa başlığı zorunludur"),
    title_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    content: z.string().nullable().optional(),
    content_en: z.string().nullable().optional(),
    page_type: z.string().default("corporate"),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
});

export const updatePageSchema = createPageSchema.partial();

// ─── Navigation ───
export const createNavigationSchema = z.object({
    site_id: z.number().int().positive(),
    page_id: z.number().int().positive().nullable().optional(),
    name: z.string().min(1, "Navigasyon adı zorunludur"),
    url: z.string().min(1),
    parent_id: z.number().int().positive().nullable().optional(),
    location: z.enum(["header", "footer", "hidden"]).default("header"),
    sort_order: z.number().int().default(0),
});

export const updateNavigationSchema = createNavigationSchema.partial();

export const syncPageNavigationsSchema = z.object({
    page_id: z.number().int().positive(),
    slug: z.string().min(1),
    title: z.string().min(1),
    placements: z.array(z.object({
        site_id: z.number().int().positive(),
        location: z.enum(["header", "footer", "hidden"]),
        parent_id: z.number().int().positive().nullable().optional(),
        sort_order: z.number().int().default(0),
    })),
});

// ─── Project ───
export const createProjectSchema = z.object({
    title: z.string().min(1, "Proje adı zorunludur"),
    title_en: z.string().nullable().optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    description: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    content_en: z.string().nullable().optional(),
    cover_image_url: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    sort_order: z.number().int().default(0),
    // Related Products (Content-Driven Commerce)
    relatedProductIds: z.array(z.number().int().positive()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ─── Site Override (generic) ───
export const siteOverrideSchema = z.object({
    is_visible: z.boolean().default(true),
    is_featured: z.boolean().optional(),
    sort_order: z.number().int().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
});
