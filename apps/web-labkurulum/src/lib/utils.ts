import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const API_BASE = import.meta.env.VITE_API_URL as string

export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder.svg'
    if (path.startsWith('http')) return path
    return `${API_BASE}${path}`
}

/**
 * Strip HTML tags from a string — used for showing clean text excerpts
 * in product/service cards where rich content shouldn't render as raw HTML.
 */
export function stripHtml(html: string | null | undefined): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').trim()
}
