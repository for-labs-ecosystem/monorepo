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
            <header className={`w-full bg-white/80 backdrop-blur-lg border-b transition-all duration-300 ${scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'}`}>
                <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">

                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-2 shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
                            <span className="text-sm font-black text-white">A</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">
                                Alerjen
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary-500">
                                Test Kitleri
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {STATIC_LINKS.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined

                            return (
                                <div key={link.href} className="relative group">
                                    <Link
                                        to={link.href}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                            isActive(link.href)
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50/50'
                                        }`}
                                    >
                                        {link.label}
                                        {children && children.length > 0 && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
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
                                        className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                            isActive(nav.url)
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50/50'
                                        }`}
                                    >
                                        {nav.name}
                                        {children && children.length > 0 && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
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
                            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-accent-500/20 hover:bg-accent-400 hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Teklif İste
                        </Link>
                        <button
                            className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-x-0 top-[104px] z-50 mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-4 space-y-1">
                        {STATIC_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                    isActive(link.href) ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
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
                                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {nav.name}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-slate-100">
                            <Link
                                to="/iletisim"
                                className="block text-center rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-md"
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
