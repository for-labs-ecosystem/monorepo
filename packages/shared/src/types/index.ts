// @forlabs/shared — Type definitions

export interface Site {
    id: number;
    slug: string;
    domain: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    price: number | null;
    currency: string;
    category_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SiteOverride {
    id: number;
    site_id: number;
    entity_type: "product" | "article";
    entity_id: number;
    field_name: string;
    field_value: string;
    created_at: string;
    updated_at: string;
}

export interface Article {
    id: number;
    slug: string;
    title: string;
    content: string | null;
    category_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
