import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, LogOut, ArrowRight, Heart, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCart, useMemberAuth, parseFavoriteIds, getNavigations } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'

interface NavItem {
    id: number
    name: string
    url: string
    location: string
    parent_id: number | null
    sort_order: number
}

const API_BASE = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface SearchProduct {
    id: number
    slug: string
    title: string
    brand?: string
    price?: number
    currency?: string
    image_url?: string
}

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { totalItems } = useCart()
    const { member, logout } = useMemberAuth()
    const totalFavorites = parseFavoriteIds(member?.favorite_products).length

    const { data: navRes } = useQuery({
        queryKey: ['navigations', 'header', SITE_ID],
        queryFn: () => getNavigations({ site_id: SITE_ID, location: 'header' }),
        staleTime: 5 * 60 * 1000,
    })
    const STATIC_URLS = useMemo(() => new Set(['/urunler', '/hizmetler', '/bilgi-bankasi', '/hakkimizda', '/destek']), [])

    const { roots: dynamicLinks, childrenMap, urlToDbItem } = useMemo(() => {
        const items = (navRes?.data ?? []) as NavItem[]
        const headerItems = items.filter((n) => n.location === 'header')
        const roots = headerItems
            .filter((n) => !n.parent_id && !STATIC_URLS.has(n.url))
            .sort((a, b) => a.sort_order - b.sort_order)
        const map = new Map<number, NavItem[]>()
        for (const item of headerItems) {
            if (item.parent_id) {
                const list = map.get(item.parent_id) || []
                list.push(item)
                map.set(item.parent_id, list)
            }
        }
        for (const [key, list] of map) {
            map.set(key, list.sort((a, b) => a.sort_order - b.sort_order))
        }
        const urlMap = new Map<string, NavItem>()
        for (const item of headerItems) {
            if (!item.parent_id) urlMap.set(item.url, item)
        }
        return { roots, childrenMap: map, urlToDbItem: urlMap }
    }, [navRes, STATIC_URLS])

    const [openDropdown, setOpenDropdown] = useState<number | null>(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                closeSearch()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchResults = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setSearchResults([])
            return
        }
        setSearchLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/products?site_id=${SITE_ID}&q=${encodeURIComponent(q)}&limit=6`)
            const json = await res.json() as { data: SearchProduct[] }
            setSearchResults(json.data ?? [])
        } catch {
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResults(searchQuery)
        }, 280)
        return () => clearTimeout(timer)
    }, [searchQuery, fetchResults])

    const openSearch = () => {
        setSearchOpen(true)
        setTimeout(() => inputRef.current?.focus(), 80)
    }

    const closeSearch = () => {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/urunler?q=${encodeURIComponent(searchQuery.trim())}`)
            closeSearch()
        }
    }

    const handleResultClick = () => {
        closeSearch()
    }

    return (
        <>
            {/* Main Navbar */}
            <div className={`transition-[padding,background-color] duration-200 ${scrolled ? 'py-2.5 px-4 sm:px-6 lg:px-8 bg-transparent' : 'bg-slate-50 py-0'}`}>
                <div
                    className={`mx-auto max-w-[1400px] rounded-2xl transition-[background-color,box-shadow,border-color] duration-200 ${
                        scrolled
                            ? 'bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/70 px-6'
                            : 'bg-slate-50 border border-transparent px-4 sm:px-6 lg:px-8'
                    }`}
                >
                    <div className="flex items-center justify-between h-14 gap-4">
                        {/* Logo */}
                        <Link to="/" className="group flex items-center shrink-0">
                            <div className="relative flex items-center bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-400 ease-out hover:shadow-[0_12px_24px_-4px_rgba(0,82,204,0.15)] hover:border-[#0052cc]/30 hover:-translate-y-0.5 overflow-hidden">
                                {/* Sweep animation */}
                                <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-linear-to-r from-transparent via-[#0052cc]/8 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover:translate-x-[50%]" />
                                
                                <span className="relative flex items-baseline">
                                    <span
                                        className="font-black text-[1.25rem] sm:text-[1.4rem] leading-none tracking-[-0.05em] text-[#00398f]"
                                        style={{ fontFamily: 'Arial Black, Inter, sans-serif' }}
                                    >
                                        ATAGO
                                    </span>
                                    <span 
                                        className="font-extrabold text-[1.25rem] sm:text-[1.4rem] leading-none tracking-tight text-transparent bg-clip-text bg-linear-to-br from-[#0052cc] to-[#0ea5e9]"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        TR
                                    </span>
                                    {/* Accent dot */}
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] ml-1 mb-0.5 shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-transform duration-300 group-hover:scale-125" />
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-3">
                            <Link
                                to="/urunler"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#0052cc]/15 bg-linear-to-r from-[#0052cc]/[0.08] via-white to-[#f97316]/[0.12] px-4 py-2 text-sm font-black tracking-[-0.02em] text-[#00398f] shadow-[0_10px_30px_rgba(0,82,204,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0052cc]/30 hover:shadow-[0_14px_36px_rgba(0,82,204,0.16)]"
                            >
                                <span className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.8),transparent_45%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                                <span className="relative">Ürünler</span>
                                <span className="relative rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_20px_rgba(249,115,22,0.28)] transition-transform duration-300 group-hover:scale-105">
                                    KEŞFET
                                </span>
                            </Link>
                            {[{ label: 'Hizmetler', href: '/hizmetler' }, { label: 'Bilgi Bankası', href: '/bilgi-bankasi' }, { label: 'Hakkımızda', href: '/hakkimizda' }].map((link) => {
                                const dbItem = urlToDbItem.get(link.href)
                                const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                                if (children && children.length > 0 && dbItem) {
                                    return (
                                        <div
                                            key={link.href}
                                            className="relative"
                                            onMouseEnter={() => setOpenDropdown(dbItem.id)}
                                            onMouseLeave={() => setOpenDropdown(null)}
                                        >
                                            <Link
                                                to={link.href}
                                                className="group relative inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-[#0052cc]"
                                            >
                                                <span className="relative">{link.label}</span>
                                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === dbItem.id ? 'rotate-180' : ''}`} />
                                                <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-linear-to-r from-[#0052cc] to-[#5b9cff] transition-transform duration-300 group-hover:scale-x-100" />
                                            </Link>
                                            {openDropdown === dbItem.id && (
                                                <div className="absolute left-0 top-full z-50 min-w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg shadow-slate-200/50">
                                                    {children.map((child) => (
                                                        <Link
                                                            key={`child-${child.id}`}
                                                            to={child.url}
                                                            className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className="group relative inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-[#0052cc]"
                                    >
                                        <span className="relative">{link.label}</span>
                                        <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-linear-to-r from-[#0052cc] to-[#5b9cff] transition-transform duration-300 group-hover:scale-x-100" />
                                    </Link>
                                )
                            })}
                            {dynamicLinks.map((nav) => {
                                const children = childrenMap.get(nav.id)
                                if (children && children.length > 0) {
                                    return (
                                        <div
                                            key={`cms-${nav.id}`}
                                            className="relative"
                                            onMouseEnter={() => setOpenDropdown(nav.id)}
                                            onMouseLeave={() => setOpenDropdown(null)}
                                        >
                                            <Link
                                                to={nav.url}
                                                className="group relative inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-[#0052cc]"
                                            >
                                                <span className="relative">{nav.name}</span>
                                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === nav.id ? 'rotate-180' : ''}`} />
                                            </Link>
                                            {openDropdown === nav.id && (
                                                <div className="absolute left-0 top-full z-50 min-w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg shadow-slate-200/50">
                                                    {children.map((child) => (
                                                        <Link
                                                            key={`cms-child-${child.id}`}
                                                            to={child.url}
                                                            className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                                return (
                                    <Link
                                        key={`cms-${nav.id}`}
                                        to={nav.url}
                                        className="group relative inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-[#0052cc]"
                                    >
                                        <span className="relative">{nav.name}</span>
                                        <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-linear-to-r from-[#0052cc] to-[#5b9cff] transition-transform duration-300 group-hover:scale-x-100" />
                                    </Link>
                                )
                            })}
                            <Link
                                to="/destek"
                                className="group inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white px-3.5 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:font-black hover:text-emerald-700 hover:shadow-[0_12px_28px_rgba(16,185,129,0.16)]"
                            >
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)] transition-transform duration-300 group-hover:scale-110" />
                                <span>Yardım & Destek</span>
                            </Link>
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2">
                            {/* Expanding Search */}
                            <div ref={searchRef} className="relative flex items-center">
                                <div className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'w-64 sm:w-80' : 'w-0'}`}>
                                    <form onSubmit={handleSearchSubmit} className="w-full">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Ürün ara..."
                                            className="w-full bg-white/90 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 shadow-sm"
                                        />
                                    </form>
                                </div>

                                <button
                                    onClick={searchOpen ? closeSearch : openSearch}
                                    className={`relative z-10 p-2 rounded-full transition-all duration-200 ${
                                        searchOpen
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-slate-500 hover:text-primary-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                </button>

                                {/* Search Dropdown */}
                                {searchOpen && (searchQuery.length >= 2) && (
                                    <div className="absolute top-full right-0 mt-2 w-64 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                        {searchLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="px-5 py-6 text-center">
                                                <p className="text-sm font-medium text-slate-400">"{searchQuery}" için sonuç bulunamadı</p>
                                                <p className="text-xs text-slate-300 mt-1">Farklı bir arama deneyin</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="px-4 py-2.5 border-b border-slate-50">
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                        {searchResults.length} ürün bulundu
                                                    </p>
                                                </div>
                                                <ul className="py-1 max-h-[400px] overflow-y-auto">
                                                    {searchResults.map((product) => (
                                                        <li key={product.id}>
                                                            <Link
                                                                to={`/urunler/${product.slug}`}
                                                                onClick={handleResultClick}
                                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group/item"
                                                            >
                                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                                    <img
                                                                        src={getImageUrl(product.image_url)}
                                                                        alt={product.title}
                                                                        className="max-w-full max-h-full object-contain p-1 mix-blend-multiply"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    {product.brand && (
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.brand}</p>
                                                                    )}
                                                                    <p className="text-sm font-semibold text-slate-800 truncate group-hover/item:text-primary-600 transition-colors">
                                                                        {product.title}
                                                                    </p>
                                                                    {product.price != null && (
                                                                        <p className="text-xs font-bold text-primary-700 mt-0.5">
                                                                            {product.price.toLocaleString('tr-TR')} {product.currency}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-primary-500 shrink-0 transition-colors" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="px-4 py-3 border-t border-slate-50">
                                                    <button
                                                        onClick={handleSearchSubmit as unknown as React.MouseEventHandler}
                                                        className="w-full text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors text-center py-1"
                                                    >
                                                        Tüm sonuçları gör →
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {member ? (
                                <div className="hidden sm:flex items-center gap-1.5">
                                    <Link
                                        to="/hesabim"
                                        className="inline-flex items-center rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0052cc]/20 hover:bg-[#0052cc]/[0.04] hover:text-[#00398f] hover:shadow-[0_12px_26px_rgba(0,82,204,0.12)]"
                                    >
                                        {member.full_name}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Çıkış Yap"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/giris" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors px-2 py-1.5">
                                    <User className="w-4 h-4" />
                                    Giriş Yap
                                </Link>
                            )}

                            <Link to="/hesabim?tab=favorites" className={`p-2 transition-colors relative ${totalFavorites > 0 ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
                                <Heart className={`w-5 h-5 ${totalFavorites > 0 ? 'fill-red-500' : ''}`} />
                                {totalFavorites > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {totalFavorites}
                                    </span>
                                )}
                            </Link>

                            <Link to="/sepet" className="p-2 text-slate-500 hover:text-primary-600 transition-colors relative">
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            <button
                                className="md:hidden p-2 text-slate-500"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                    <div className="md:hidden mt-1 mx-4 sm:mx-6 lg:mx-8 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                        {/* Mobile Search */}
                        <div className="px-4 pt-4 pb-2">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Ürün ara..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400"
                                    />
                                </div>
                            </form>
                            {searchQuery.length >= 2 && searchResults.length > 0 && (
                                <ul className="mt-2 space-y-1 max-h-[240px] overflow-y-auto">
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                to={`/urunler/${product.slug}`}
                                                onClick={() => { handleResultClick(); setMobileOpen(false) }}
                                                className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                                    <img src={getImageUrl(product.image_url)} alt={product.title} className="max-w-full max-h-full object-contain p-0.5 mix-blend-multiply" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{product.title}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="px-4 py-3 space-y-2 border-t border-slate-100">
                            <Link
                                to="/urunler"
                                className="flex items-center justify-between rounded-2xl border border-[#0052cc]/15 bg-linear-to-r from-[#0052cc]/[0.08] via-white to-[#f97316]/[0.12] px-3.5 py-3 text-sm font-black tracking-[-0.02em] text-[#00398f] shadow-[0_10px_26px_rgba(0,82,204,0.08)]"
                                onClick={() => setMobileOpen(false)}
                            >
                                <span>Ürünler</span>
                                <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                    KEŞFET
                                </span>
                            </Link>
                            {[{ label: 'Hizmetler', href: '/hizmetler' }, { label: 'Bilgi Bankası', href: '/bilgi-bankasi' }, { label: 'Hakkımızda', href: '/hakkimizda' }].map((link) => {
                                const dbItem = urlToDbItem.get(link.href)
                                const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                                return (
                                    <div key={link.href}>
                                        <Link to={link.href} className="block text-sm font-semibold text-slate-700 py-2.5 px-3 rounded-xl hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{link.label}</Link>
                                        {children && children.map((child) => (
                                            <Link key={`m-child-${child.id}`} to={child.url} className="block text-sm text-slate-500 py-2 pl-7 pr-3 rounded-xl hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{child.name}</Link>
                                        ))}
                                    </div>
                                )
                            })}
                            {dynamicLinks.map((nav) => {
                                const children = childrenMap.get(nav.id)
                                return (
                                    <div key={`cms-m-${nav.id}`}>
                                        <Link to={nav.url} className="block text-sm font-semibold text-slate-700 py-2.5 px-3 rounded-xl hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{nav.name}</Link>
                                        {children && children.map((child) => (
                                            <Link key={`cms-m-child-${child.id}`} to={child.url} className="block text-sm text-slate-500 py-2 pl-7 pr-3 rounded-xl hover:bg-slate-50" onClick={() => setMobileOpen(false)}>{child.name}</Link>
                                        ))}
                                    </div>
                                )
                            })}
                            <Link
                                to="/destek"
                                className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-3 text-sm font-bold text-emerald-700 shadow-[0_10px_24px_rgba(16,185,129,0.1)] transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50"
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                                <span>Yardım & Destek</span>
                            </Link>
                            <div className="border-t border-slate-100 pt-3 mt-2">
                                {member ? (
                                    <div className="flex items-center justify-between px-3">
                                        <Link to="/hesabim" className="text-sm text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>{member.full_name}</Link>
                                        <button onClick={() => { logout(); setMobileOpen(false) }} className="text-sm text-red-500 font-medium">
                                            Çıkış Yap
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/giris" className="block text-sm font-medium text-primary-600 py-2.5 px-3 rounded-xl hover:bg-primary-50" onClick={() => setMobileOpen(false)}>
                                        Giriş Yap / Kayıt Ol
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
            )}
        </>
    )
}
