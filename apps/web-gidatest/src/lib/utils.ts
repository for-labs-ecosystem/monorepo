import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const API_URL = import.meta.env.VITE_API_URL as string

export function getImageUrl(url: string | null | undefined): string | null {
    if (!url) return null
    if (/^https?:\/\//i.test(url)) return url
    if (url.startsWith('/')) return `${API_URL}${url}`
    return `${API_URL}/${url}`
}

export function formatPrice(price: number | null | undefined, currency = 'TRY'): string {
    if (price == null) return ''
    try {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(price)
    } catch {
        return `${price} ${currency}`
    }
}
