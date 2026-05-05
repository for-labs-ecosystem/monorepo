// @forlabs/shared — Type definitions
// Synced with packages/db/src/schema as of 2026-02-27

// ─── Sites ───
export interface Site {
    id: number;
    slug: string;
    domain: string;
    name: string;
    name_en: string | null;
    description: string | null;
    description_en: string | null;
    logo_url: string | null;
    theme_config: string | null;
    enabled_modules: string | null;
    ecommerce_config: string | null;
    has_ecommerce: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Categories ───
export interface Category {
    id: number;
    slug: string;
    name: string;
    name_en: string | null;
    description: string | null;
    description_en: string | null;
    parent_id: number | null;
    type: string | null;
    sort_order: number;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Products ───
export interface Product {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    content: string | null;
    content_en: string | null;
    specs: string | null;
    specs_en: string | null;
    price: number | null;
    compare_price: number | null;
    currency: string;
    unit: string | null;
    stock_quantity: number | null;
    brand: string | null;
    model_number: string | null;
    sku: string | null;
    warranty_period: string | null;
    campaign_label: string | null;
    features: string | null;
    features_en: string | null;
    application_areas: string | null;
    application_areas_en: string | null;
    tags: string | null;
    tags_en: string | null;
    // Intelligence Platform (Matching Wizard)
    analysis_types: string | null;
    analysis_types_en: string | null;
    automation_level: string | null;
    compliance_tags: string | null;
    category_id: number | null;
    image_url: string | null;
    gallery: string | null;
    is_active: boolean;
    is_featured: boolean;
    hide_price: boolean;
    sort_order: number;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Articles ───
export interface Article {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    excerpt: string | null;
    excerpt_en: string | null;
    content: string | null;
    content_en: string | null;
    category_id: number | null;
    cover_image_url: string | null;
    author: string | null;
    tags: string | null;
    keywords: string | null;
    meta_title: string | null;
    meta_title_en: string | null;
    meta_description: string | null;
    meta_description_en: string | null;
    canonical_url: string | null;
    published_at: string | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order?: number;
    created_at: string;
    updated_at: string;
    relatedProducts?: Array<{
        id: number;
        title: string;
        slug: string;
        image_url: string | null;
        brand: string | null;
        price: number | null;
        currency: string;
    }>;
}

// ─── Services ───
export interface Service {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    content: string | null;
    content_en: string | null;
    specs: string | null;
    price: number | null;
    currency: string;
    tags: string | null;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    service_type: string | null;
    category_id: number | null;
    image_url: string | null;
    gallery: string | null;
    is_active: boolean;
    is_featured?: boolean;
    sort_order?: number;
    created_at: string;
    updated_at: string;
}

// ─── Pages ───
export interface Page {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    content: string | null;
    content_en: string | null;
    cover_image_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    keywords: string | null;
    page_type: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Navigations ───
export interface Navigation {
    id: number;
    site_id: number;
    page_id: number | null;
    name: string;
    url: string;
    parent_id: number | null;
    location: "header" | "footer" | "hidden";
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface NavigationPlacement {
    id: number;
    site_id: number;
    site_name: string;
    location: string;
    parent_id: number | null;
    parent_name: string | null;
}

// ─── Projects ───
export interface Project {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    content: string | null;
    content_en: string | null;
    client_name: string | null;
    location: string | null;
    start_date: string | null;
    completion_date: string | null;
    status: string | null;
    category_id: number | null;
    cover_image_url: string | null;
    header_image_url: string | null;
    gallery: string | null;
    metrics: string | null;
    tags: string | null;
    video_url: string | null;
    testimonial: string | null;
    testimonial_author: string | null;
    testimonial_author_title: string | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    relatedProducts?: Array<{ id: number; title: string }>;
}

// ─── Inquiries ───
export interface Inquiry {
    id: number;
    site_id: number;
    sender_name: string;
    sender_email: string;
    payload: Record<string, string> | null;
    status: "new" | "read" | "replied" | "archived";
    created_at: string;
    updated_at: string;
}

// ─── Orders ───
export interface Order {
    id: number;
    site_id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    customer_type: string;
    company_name: string | null;
    tax_office: string | null;
    tax_number: string | null;
    shipping_address: string | null;
    billing_address: string | null;
    items: string;
    parsed_items?: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    payment_status: string;
    payment_method: string;
    iyzico_token: string | null;
    iyzico_payment_id: string | null;
    status: string;
    notes: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

// ─── Media ───
export interface Media {
    id: number;
    site_id: number | null;
    site_ids: string | null;
    filename: string;
    key: string;
    url: string;
    mime_type: string;
    size: number;
    title: string | null;
    alt_text: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Users ───
export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/** User info returned by /auth/me (no password_hash) */
export interface AdminUser {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
    role: string;
    is_active: boolean;
}

// ─── Settings (Global Singleton) ───
export interface CompanyInfo {
    company_name?: string;
    tax_number?: string;
    tax_office?: string;
    address?: string;
    phone?: string;
    mersis_no?: string;
    billing_email?: string;
    kep_address?: string;
}

export interface IyzicoConfig {
    mode?: "sandbox" | "production";
    api_key?: string;
    secret_key?: string;
    base_url?: string;
    iyzico_api_key?: string;
    iyzico_secret_key?: string;
    iyzico_base_url?: string;
    require_3d_secure?: boolean;
    max_installments?: number;
}

export interface SmtpConfig {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    sender_email?: string;
    sender_name?: string;
}

export interface EcommerceConfig {
    default_currency?: string;
    default_vat_rate?: number;
    shipping_cost?: number;
    free_shipping_threshold?: number;
    order_prefix?: string;
}

export interface Settings {
    id: number;
    company_info: CompanyInfo;
    iyzico_config: IyzicoConfig;
    smtp_config: SmtpConfig;
    ecommerce_config: EcommerceConfig;
    updated_at: string;
}

// ─── Members (End-user accounts — isolated from admin Users) ───
export interface Member {
    id: string;
    site_id: number;
    full_name: string;
    email: string;
    password_hash: string | null;
    google_id: string | null;
    phone: string | null;
    company_name: string | null;
    is_active: number;
    addresses: string | null;
    cart_data: string | null;
    favorite_products: string | null;
    favorite_articles: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Wizard (Intelligence Platform) ───
export interface WizardStep {
    id: number;
    site_id: number;
    step_number: number;
    field_key: string;
    title: string | null;
    title_en: string | null;
    prefix: string | null;
    prefix_en: string | null;
    suffix: string | null;
    suffix_en: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WizardOption {
    id: number;
    step_id: number;
    label: string;
    label_en: string | null;
    value: string;
    description: string | null;
    description_en: string | null;
    match_tags: string[];
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WizardStepWithOptions extends WizardStep {
    options: WizardOption[];
}

export interface WizardStepPayload {
    step_number?: number;
    field_key?: string;
    title?: string | null;
    title_en?: string | null;
    prefix?: string | null;
    prefix_en?: string | null;
    suffix?: string | null;
    suffix_en?: string | null;
    is_active?: boolean;
}

export interface WizardOptionPayload {
    label?: string;
    label_en?: string | null;
    value?: string;
    description?: string | null;
    description_en?: string | null;
    match_tags?: string[];
    sort_order?: number;
    is_active?: boolean;
}

// ─── Site Override base (common fields for all override tables) ───
export interface SiteOverrideBase {
    id: number;
    site_id: number;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface SiteProductOverride extends SiteOverrideBase {
    product_id: number;
    title: string | null;
    description: string | null;
    content: string | null;
    specs: string | null;
    price: number | null;
    compare_price: number | null;
    campaign_label: string | null;
    currency: string | null;
    image_url: string | null;
    gallery: string | null;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    is_featured: boolean;
    hide_price: boolean;
    sort_order: number;
}

export interface SiteArticleOverride extends SiteOverrideBase {
    article_id: number;
    title: string | null;
    excerpt: string | null;
    content: string | null;
    cover_image_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    is_featured: boolean;
    sort_order: number;
}

export interface SiteCategoryOverride extends SiteOverrideBase {
    category_id: number;
    name: string | null;
    name_en: string | null;
    description: string | null;
    description_en: string | null;
    parent_id: number | null;
    sort_order: number | null;
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
}
