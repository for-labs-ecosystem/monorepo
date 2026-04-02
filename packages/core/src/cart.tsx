import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useMemberAuth } from './auth'
import { CART_STORAGE_KEY } from './constants'

export interface CartItem {
    id: number
    slug: string
    title: string
    image_url: string | null
    price: number
    currency: string
    brand: string | null
    quantity: number
}

interface CartContextValue {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
    removeItem: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
    isInCart: (id: number) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

import { getEcosystemConfig } from './config'

function loadCart(): CartItem[] {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { member, updateProfile } = useMemberAuth()
    const [items, setItems] = useState<CartItem[]>(loadCart)
    const initialSyncDone = useRef(false)
    const { siteId } = getEcosystemConfig()

    // Sync from database on login
    useEffect(() => {
        if (member && !initialSyncDone.current) {
            initialSyncDone.current = true
            const localItems = loadCart()
            try {
                const memberData = member.cart_data ? JSON.parse(member.cart_data) : {}
                let memberCartForSite: CartItem[] = []
                
                if (Array.isArray(memberData)) {
                    // Legacy array format
                    memberCartForSite = memberData
                } else if (memberData && typeof memberData === 'object') {
                    memberCartForSite = memberData[siteId] || []
                }

                if (memberCartForSite.length > 0) {
                    setItems(memberCartForSite)
                    saveCart(memberCartForSite)
                } else if (localItems.length > 0) {
                    const newDbData = Array.isArray(memberData) ? {} : { ...memberData }
                    newDbData[siteId] = localItems
                    updateProfile({ cart_data: JSON.stringify(newDbData) }).catch(() => { })
                }
            } catch {
                if (localItems.length > 0) {
                    updateProfile({ cart_data: JSON.stringify({ [siteId]: localItems }) }).catch(() => { })
                }
            }
        }
    }, [member, updateProfile, siteId])

    // Notice we clear sync flag on logout so a future login will trigger sync again
    useEffect(() => {
        if (!member) {
            initialSyncDone.current = false
        }
    }, [member])

    // Automatically sync back to the database any time `items` changes, provided we're logged in
    useEffect(() => {
        saveCart(items)
        if (member && initialSyncDone.current) {
            try {
                const memberData = member.cart_data ? JSON.parse(member.cart_data) : {}
                const currentSaveObj = Array.isArray(memberData) ? {} : { ...memberData }
                currentSaveObj[siteId] = items
                
                const newSaveString = JSON.stringify(currentSaveObj)
                if (member.cart_data !== newSaveString) {
                    updateProfile({ cart_data: newSaveString }).catch(() => { })
                }
            } catch {
                updateProfile({ cart_data: JSON.stringify({ [siteId]: items }) }).catch(() => { })
            }
        }
    }, [items, member, updateProfile, siteId])

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                )
            }
            return [...prev, { ...item, quantity }]
        })
    }, [])

    const removeItem = useCallback((id: number) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }, [])

    const updateQuantity = useCallback((id: number, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(i => i.id !== id))
        } else {
            setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
        }
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const isInCart = useCallback((id: number) => items.some(i => i.id === id), [items])

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}
