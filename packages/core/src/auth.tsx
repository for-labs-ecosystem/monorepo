import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getEcosystemConfig } from './config'
import { TOKEN_KEY } from './constants'

/**
 * Parse favorite_products JSON string into a clean number[] of product IDs.
 * Handles numbers, strings, and FavoriteItem objects ({ id, ... }).
 */
export function parseFavoriteIds(raw: string | null | undefined, siteId?: string | number): number[] {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        let favArray: unknown[] = []
        const currentSiteId = siteId || getEcosystemConfig().siteId
        
        if (Array.isArray(parsed)) {
            favArray = parsed
        } else if (parsed && typeof parsed === 'object') {
            if (currentSiteId && Array.isArray(parsed[currentSiteId])) {
                favArray = parsed[currentSiteId]
            } else {
                // Return empty if not targeted
            }
        }
        
        if (!Array.isArray(favArray)) return []
        
        return favArray
            .map((item: unknown) =>
                typeof item === 'object' && item !== null && 'id' in item
                    ? Number((item as Record<string, unknown>).id)
                    : Number(item)
            )
            .filter((id: number) => !isNaN(id))
    } catch {
        return []
    }
}

export interface MemberProfile {
    id: string
    site_id: number
    full_name: string
    email: string
    phone: string | null
    company_name: string | null
    is_active: number
    addresses: string | null
    cart_data: string | null
    favorite_products: string | null
    favorite_articles: string | null
    created_at?: string
    updated_at?: string
}

interface AuthContextValue {
    member: MemberProfile | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: () => void
    loginWithToken: (token: string) => Promise<void>
    register: (data: { email: string; password: string; full_name: string; phone?: string; company_name?: string }) => Promise<void>
    logout: () => void
    updateProfile: (data: Partial<MemberProfile>) => Promise<void>
    refreshProfile: () => Promise<void>
    toggleFavoriteProduct: (productId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function memberRequest<T>(
    path: string,
    options: RequestInit & { token?: string | null } = {}
): Promise<T> {
    const { apiUrl, siteId } = getEcosystemConfig()
    const { token, ...init } = options
    const url = `${apiUrl}/api/member-auth${path}?site_id=${siteId}`
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { ...init, headers })
    const data = await res.json()
    if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
    return data as T
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [member, setMember] = useState<MemberProfile | null>(null)
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
    const [isLoading, setIsLoading] = useState(true)

    const fetchProfile = useCallback(async (t: string) => {
        try {
            const res = await memberRequest<{ data: MemberProfile }>('/me', { token: t })
            setMember(res.data)
        } catch {
            localStorage.removeItem(TOKEN_KEY)
            setToken(null)
            setMember(null)
        }
    }, [])

    // On mount, try to fetch profile if token exists
    useEffect(() => {
        if (!token) {
            setIsLoading(false)
            return
        }
        fetchProfile(token).finally(() => setIsLoading(false))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback(async (email: string, password: string) => {
        const res = await memberRequest<{ data: { token: string; member: MemberProfile } }>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
        localStorage.setItem(TOKEN_KEY, res.data.token)
        setToken(res.data.token)
        setMember(res.data.member)
    }, [])

    const register = useCallback(async (data: { email: string; password: string; full_name: string; phone?: string; company_name?: string }) => {
        const res = await memberRequest<{ data: { token: string; member: MemberProfile } }>('/register', {
            method: 'POST',
            body: JSON.stringify(data),
        })
        localStorage.setItem(TOKEN_KEY, res.data.token)
        setToken(res.data.token)
        setMember(res.data.member)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setMember(null)
    }, [])

    const updateProfile = useCallback(async (data: Partial<MemberProfile>) => {
        if (!token) throw new Error('Not authenticated')
        const res = await memberRequest<{ data: MemberProfile }>('/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        })
        setMember((prev) => (prev ? { ...prev, ...res.data } : prev))
    }, [token])

    const refreshProfile = useCallback(async () => {
        if (!token) return
        await fetchProfile(token)
    }, [token, fetchProfile])

    const loginWithGoogle = useCallback(() => {
        const { apiUrl, siteId } = getEcosystemConfig()
        const returnUrl = `${window.location.origin}/auth/callback`
        const state = `${siteId}:${returnUrl}`
        window.location.href = `${apiUrl}/api/member-auth/google?site_id=${siteId}&state=${encodeURIComponent(state)}`
    }, [])

    const loginWithToken = useCallback(async (t: string) => {
        localStorage.setItem(TOKEN_KEY, t)
        setToken(t)
        await fetchProfile(t)
    }, [fetchProfile])

    const toggleFavoriteProduct = useCallback(async (productId: number) => {
        if (!member) return

        const { siteId } = getEcosystemConfig()
        let favs = parseFavoriteIds(member.favorite_products, siteId)
        const numId = Number(productId)
        const isFav = favs.includes(numId)
        if (isFav) {
            favs = favs.filter(id => id !== numId)
        } else {
            favs.push(numId)
        }

        try {
            const memberData = member.favorite_products ? JSON.parse(member.favorite_products) : {}
            const currentSaveObj = Array.isArray(memberData) ? {} : { ...memberData }
            currentSaveObj[siteId] = favs
            
            await updateProfile({ favorite_products: JSON.stringify(currentSaveObj) })
        } catch {
            await updateProfile({ favorite_products: JSON.stringify({ [siteId]: favs }) })
        }
    }, [member, updateProfile])

    return (
        <AuthContext.Provider value={{ member, token, isLoading, login, loginWithGoogle, loginWithToken, register, logout, updateProfile, refreshProfile, toggleFavoriteProduct }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useMemberAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useMemberAuth must be used within AuthProvider')
    return ctx
}
