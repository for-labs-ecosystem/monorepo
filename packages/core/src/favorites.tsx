import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useMemberAuth } from './auth'
import { FAVORITES_STORAGE_KEY } from './constants'

export interface FavoriteItem {
    id: number
    slug: string
    title: string
    image_url: string | null
    price: number | null
    currency: string
    brand: string | null
}

interface FavoritesContextValue {
    items: FavoriteItem[]
    totalFavorites: number
    addFavorite: (item: FavoriteItem) => void
    removeFavorite: (id: number) => void
    toggleFavorite: (item: FavoriteItem) => void
    isFavorite: (id: number) => boolean
    clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

import { getEcosystemConfig } from './config'

function loadFavorites(): FavoriteItem[] {
    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
            return parsed
        }
        return []
    } catch {
        return []
    }
}

function saveFavorites(items: FavoriteItem[]) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { member, updateProfile } = useMemberAuth()
    const [items, setItems] = useState<FavoriteItem[]>(loadFavorites)
    const initialSyncDone = useRef(false)
    const { siteId } = getEcosystemConfig()

    // Sync from database on login
    useEffect(() => {
        if (member && !initialSyncDone.current) {
            initialSyncDone.current = true
            const localItems = loadFavorites()
            try {
                const memberData = member.favorite_products ? JSON.parse(member.favorite_products) : {}
                let memberFavsForSite: FavoriteItem[] = []
                
                if (Array.isArray(memberData)) {
                    // Legacy array format
                    memberFavsForSite = memberData
                } else if (memberData && typeof memberData === 'object') {
                    memberFavsForSite = memberData[siteId] || []
                }

                if (memberFavsForSite.length > 0 && typeof memberFavsForSite[0] === 'object') {
                    setItems(memberFavsForSite)
                    saveFavorites(memberFavsForSite)
                } else if (localItems.length > 0) {
                    const newDbData = Array.isArray(memberData) ? {} : { ...memberData }
                    newDbData[siteId] = localItems
                    updateProfile({ favorite_products: JSON.stringify(newDbData) }).catch(() => { })
                }
            } catch {
                if (localItems.length > 0) {
                    updateProfile({ favorite_products: JSON.stringify({ [siteId]: localItems }) }).catch(() => { })
                }
            }
        }
    }, [member, updateProfile, siteId])

    // Clear sync flag on logout
    useEffect(() => {
        if (!member) {
            initialSyncDone.current = false
        }
    }, [member])

    // Sync to database when items change
    useEffect(() => {
        saveFavorites(items)
        if (member && initialSyncDone.current) {
            try {
                const memberData = member.favorite_products ? JSON.parse(member.favorite_products) : {}
                const currentSaveObj = Array.isArray(memberData) ? {} : { ...memberData }
                currentSaveObj[siteId] = items
                
                const newSaveString = JSON.stringify(currentSaveObj)
                if (member.favorite_products !== newSaveString) {
                    updateProfile({ favorite_products: newSaveString }).catch(() => { })
                }
            } catch {
                updateProfile({ favorite_products: JSON.stringify({ [siteId]: items }) }).catch(() => { })
            }
        }
    }, [items, member, updateProfile, siteId])

    const addFavorite = useCallback((item: FavoriteItem) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id)) return prev
            return [...prev, item]
        })
    }, [])

    const removeFavorite = useCallback((id: number) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }, [])

    const toggleFavorite = useCallback((item: FavoriteItem) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id)) {
                return prev.filter(i => i.id !== item.id)
            }
            return [...prev, item]
        })
    }, [])

    const isFavorite = useCallback((id: number) => items.some(i => i.id === id), [items])

    const clearFavorites = useCallback(() => setItems([]), [])

    return (
        <FavoritesContext.Provider value={{ items, totalFavorites: items.length, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext)
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
    return ctx
}
