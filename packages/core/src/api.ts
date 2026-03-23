import type { Service } from '@forlabs/shared'
import { getEcosystemConfig } from './config'
import { TOKEN_KEY } from './constants'

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const { apiUrl, siteId } = getEcosystemConfig()
    const url = new URL(`${apiUrl}${path}`)
    url.searchParams.set('site_id', siteId)
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value))
            }
        }
    }
    return url.toString()
}

async function request<T>(path: string, options?: RequestInit & { params?: Record<string, string | number | undefined> }): Promise<T> {
    const { params, ...init } = options ?? {}
    const url = buildUrl(path, params)

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> || {}),
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(url, {
        ...init,
        headers,
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
}

// --- Products ---
export function getProducts(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[]; count: number }>('/api/products', { params })
}

export function getProduct(id: number | string) {
    return request<{ data: unknown }>(`/api/products/${id}`)
}

// --- Articles ---
export function getArticles(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[]; count: number }>('/api/articles', { params })
}

export function getArticle(id: number | string) {
    return request<{ data: unknown }>(`/api/articles/${id}`)
}

// --- Services ---
export function getServices(params?: Record<string, string | number | undefined>) {
    return request<{ data: Service[]; count: number }>('/api/services', { params })
}

export function getService(id: number | string) {
    return request<{ data: Service }>(`/api/services/${id}`)
}

// --- Categories ---
export function getCategories(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[] }>('/api/categories', { params })
}

// --- Pages ---
export function getPages(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[] }>('/api/pages', { params })
}

// --- Navigations ---
export function getNavigations(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[] }>('/api/navigations', { params })
}

// --- Projects ---
export function getProjects(params?: Record<string, string | number | undefined>) {
    return request<{ data: unknown[]; count: number }>('/api/projects', { params })
}

export function getProject(id: number | string) {
    return request<{ data: unknown }>(`/api/projects/${id}`)
}

// --- Inquiries ---
export function submitInquiry(body: Record<string, unknown>) {
    const { siteId } = getEcosystemConfig()
    return request<{ data: unknown }>('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({ ...body, site_id: Number(siteId) }),
    })
}

// --- Checkout ---
export function initializeCheckout(body: Record<string, unknown>) {
    return request<{ data: { checkout_form_content: string | null; message?: string; order_number?: string } }>('/api/checkout/initialize', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

// --- Wizard Steps (Dynamic CMS content) ---
export interface WizardStepOption {
    id: number
    step_id: number
    label: string
    label_en: string | null
    value: string
    description: string | null
    description_en: string | null
    match_tags: string[]
    sort_order: number
    is_active: boolean
}

export interface WizardStepData {
    id: number
    site_id: number
    step_number: number
    field_key: string
    title: string | null
    title_en: string | null
    prefix: string | null
    prefix_en: string | null
    suffix: string | null
    suffix_en: string | null
    is_active: boolean
    options: WizardStepOption[]
}

export function getWizardSteps() {
    return request<{ data: WizardStepData[] }>('/api/wizard-steps')
}

// --- Intelligence Platform (Match) ---
export interface MatchProduct {
    id: number
    slug: string
    title: string
    description: string | null
    image_url: string | null
    price: number | null
    currency: string
    brand: string | null
    application_areas: string | null
    analysis_types: string | null
    automation_level: string | null
    compliance_tags: string | null
    tags: string | null
    category_id: number | null
    score: number
    matched_criteria: string[]
}

export interface MatchArticle {
    id: number
    slug: string
    title: string
    excerpt: string | null
    cover_image_url: string | null
    tags: string | null
    score: number
    matched_via: string
}

export interface MatchStepInput {
    field_key: string
    match_tags: string[]
}

export interface MatchCriteria {
    steps?: MatchStepInput[]
    // Legacy fields kept for backward compat
    sectors?: string[]
    analysis_types?: string[]
    automation_level?: string
    budget_class?: string
    compliance?: string[]
}

export interface MatchResponse {
    data: {
        products: MatchProduct[]
        articles: MatchArticle[]
        total_products: number
        total_articles: number
        criteria: { steps: MatchStepInput[] }
    }
}

export function postMatch(criteria: MatchCriteria) {
    return request<MatchResponse>('/api/match', {
        method: 'POST',
        body: JSON.stringify(criteria),
    })
}

// --- Sites ---
export function getSites() {
    return request<{ data: unknown[]; count: number }>('/api/sites')
}
