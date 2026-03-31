import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const API_BASE = import.meta.env.VITE_API_URL || ''
  // make sure not to double slash if API_BASE ends with / and path starts with /
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/**
 * Strip HTML tags from a string — used for showing clean text excerpts
 * in product/service cards where rich content shouldn't render as raw HTML.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
