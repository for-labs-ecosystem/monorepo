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
    { label: 'Araştırmalar', href: '/arastirmalar' },
    { label: 'Kurumsal', href: '/kurumsal' },
    { label: 'İletişim', href: '/iletisim' },
]

const STATIC_URLS = new Set(STATIC_LINKS.map((l) => l.href))

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
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
            <header className={`w-full transition-all duration-500 ${
                scrolled
                    ? 'bg-white/70 backdrop-blur-xl border-b border-ocean-100/40 shadow-[0_1px_20px_-6px_rgba(0,0,0,0.04)]'
                    : 'bg-transparent border-b border-transparent'
            }`}>
                <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">

                    {/* Logo — clean, typographic, warm */}
                    <Link to="/" className="group flex items-center gap-3 shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/15 group-hover:shadow-ocean-500/25 transition-shadow duration-300">
                            <span className="text-sm font-bold text-white tracking-tight">A</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[17px] font-bold tracking-tight text-slate-700">
                                Alerjen
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ocean-500/80 mt-0.5">
                                Test Kitleri
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {STATIC_LINKS.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined

                            return (
                                <div key={link.href} className="relative group">
                                    <Link
                                        to={link.href}
                                        className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                                            isActive(link.href)
                                                ? 'bg-ocean-50 text-ocean-700'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80'
                                        }`}
                                    >
                                        {link.label}
                                        {children && children.length > 0 && <ChevronDown className="h-3 w-3 opacity-40" />}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-56 pebble-card p-2.5 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="block px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-ocean-50/60 hover:text-ocean-700 rounded-xl transition-all duration-200"
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

                        {/* Dynamic CMS links */}
                        {dynamicRoots.map((nav) => {
                            const children = childrenMap.get(nav.id)
                            return (
                                <div key={nav.id} className="relative group">
                                    <Link
                                        to={nav.url}
                                        className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                                            isActive(nav.url)
                                                ? 'bg-ocean-50 text-ocean-700'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80'
                                        }`}
                                    >
                                        {nav.name}
                                        {children && children.length > 0 && <ChevronDown className="h-3 w-3 opacity-40" />}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-56 pebble-card p-2.5 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="block px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-ocean-50/60 hover:text-ocean-700 rounded-xl transition-all duration-200"
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

                    {/* CTA + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/iletisim"
                            className="hidden sm:inline-flex btn-warm text-[13px] !py-2.5 !px-6"
                        >
                            Teklif İste
                        </Link>
                        <button
                            className="md:hidden p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 transition-all duration-300"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav — floating pebble */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-x-0 top-[112px] z-50 mx-4 pebble-card overflow-hidden animate-fade-in-up">
                    <div className="p-4 space-y-1">
                        {STATIC_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`block px-4 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
                                    isActive(link.href) ? 'bg-ocean-50 text-ocean-700' : 'text-slate-500 hover:bg-slate-50/80'
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
                                className="block px-4 py-3.5 rounded-2xl text-[13px] font-medium text-slate-500 hover:bg-slate-50/80 transition-all duration-200"
                                onClick={() => setMobileOpen(false)}
                            >
                                {nav.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-ocean-100/30">
                            <Link
                                to="/iletisim"
                                className="block text-center btn-warm !w-full"
                                onClick={() => setMobileOpen(false)}
                            >
                                Teklif İste
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
