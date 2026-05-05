import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getNavigations } from '@forlabs/core'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface NavItem {
    id: number
    name: string
    url: string
    parent_id: number | null
    location: string
    sort_order: number
}

const STATIC_LINKS = [
    { label: 'Ürünler', href: '/urunler' },
    { label: 'Bilgi Bankası', href: '/bilgi-bankasi' },
    { label: 'Hizmetler', href: '/hizmetler' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
]

const STATIC_URLS = new Set(STATIC_LINKS.map((l) => l.href))

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    const { data: navRes } = useQuery({
        queryKey: ['navigations', 'header', SITE_ID],
        queryFn: () => getNavigations({ location: 'header' }),
        staleTime: 5 * 60 * 1000,
    })

    const items = (navRes?.data ?? []) as NavItem[]
    const headerItems = items.filter((n) => n.location === 'header')

    const dynamicRoots = headerItems
        .filter((n) => !n.parent_id && !STATIC_URLS.has(n.url))
        .sort((a, b) => a.sort_order - b.sort_order)

    const childrenMap = new Map<number, NavItem[]>()
    for (const item of headerItems) {
        if (item.parent_id) {
            const list = childrenMap.get(item.parent_id) || []
            list.push(item)
            childrenMap.set(item.parent_id, list)
        }
    }

    const urlToDbItem = new Map<string, NavItem>()
    for (const item of headerItems) {
        if (!item.parent_id) urlToDbItem.set(item.url, item)
    }

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/')

    return (
        <>
            <header
                className={`w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200 ${
                    scrolled
                        ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100/60 shadow-[0_1px_12px_-2px_rgba(0,0,0,0.05)]'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
                <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-5 lg:px-8">

                    {/* Glassmorphic Logo */}
                    <Link to="/" className="group shrink-0 flex items-center">
                        <div className="relative flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,1),0_2px_12px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:bg-white/70 group-hover:shadow-[inset_0_1px_4px_rgba(255,255,255,1),0_4px_16px_-4px_rgba(0,0,0,0.08)] group-hover:scale-[1.02]">
                            <span className="text-[19px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 drop-shadow-sm">
                                Gıda
                            </span>
                            <span className="text-[19px] font-medium text-slate-400 drop-shadow-sm">
                                /
                            </span>
                            <span className="text-[19px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-azure-600 to-sky-400 drop-shadow-sm">
                                Kimya
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav — clean, no icons, just text like Genoverge reference */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {STATIC_LINKS.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                            const active = isActive(link.href)

                            return (
                                <div key={link.href} className="relative group">
                                    <Link
                                        to={link.href}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                                            active
                                                ? 'text-azure-700 bg-azure-50/80'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        {link.label}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400 transition-transform duration-300 group-hover:rotate-180" />
                                        )}
                                    </Link>

                                    {/* Dropdown */}
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_12px_48px_-8px_rgba(0,0,0,0.12)] border border-slate-100/60 p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-azure-50/60 hover:text-azure-600 rounded-xl transition-all duration-200"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {dynamicRoots.map((nav) => {
                            const children = childrenMap.get(nav.id)
                            return (
                                <div key={nav.id} className="relative group">
                                    <Link
                                        to={nav.url}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                                            isActive(nav.url)
                                                ? 'text-azure-700 bg-azure-50/80'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        {nav.name}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-slate-300 group-hover:rotate-180 transition-transform duration-300" />
                                        )}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_12px_48px_-8px_rgba(0,0,0,0.12)] border border-slate-100/60 p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-azure-50/60 hover:text-azure-600 rounded-xl transition-all duration-200"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* CTA icon + mobile toggle */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/iletisim"
                            className="hidden sm:inline-flex btn-azure !py-2.5 !px-6 !text-[12px]"
                        >
                            İletişime Geçin
                        </Link>
                        <button
                            className="lg:hidden p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 transition-all duration-300"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-x-0 top-[68px] z-50 mx-4 bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-in-up">
                    <div className="p-4 space-y-0.5">
                        {STATIC_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`flex items-center px-4 py-3.5 rounded-2xl text-[13.5px] font-semibold transition-all duration-200 ${
                                    isActive(link.href) ? 'bg-azure-50 text-azure-600' : 'text-slate-600 hover:bg-slate-50/80'
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {dynamicRoots.map((nav) => (
                            <Link
                                key={nav.id}
                                to={nav.url}
                                className="flex items-center px-4 py-3.5 rounded-2xl text-[13.5px] font-semibold text-slate-600 hover:bg-slate-50/80 transition-all duration-200"
                                onClick={() => setMobileOpen(false)}
                            >
                                {nav.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-slate-100/50">
                            <Link
                                to="/iletisim"
                                className="block text-center btn-azure !w-full"
                                onClick={() => setMobileOpen(false)}
                            >
                                İletişime Geçin
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
