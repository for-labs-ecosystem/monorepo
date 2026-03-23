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
