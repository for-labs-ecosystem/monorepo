import { Link } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowRight, ScanLine } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNavigations } from '@forlabs/core'
interface NavItem {
    id: number
    name: string
    url: string
    location: string
    parent_id: number | null
    sort_order: number
}

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)

    const { data: navRes } = useQuery({
        queryKey: ['navigations', 'header', SITE_ID],
        queryFn: () => getNavigations({ site_id: SITE_ID, location: 'header' }),
        staleTime: 5 * 60 * 1000,
    })

    const STATIC_URLS = useMemo(() => new Set(['/urunler', '/hizmetler', '/projeler', '/bilgi-bankasi']), [])

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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const staticLinks = [
        { label: 'Ürünler', href: '/urunler' },
        { label: 'Hizmetler', href: '/hizmetler' },
        { label: 'Projeler', href: '/projeler' },
        { label: 'Bilgi Bankası', href: '/bilgi-bankasi' },
    ]

    function renderDesktopLink(link: { label: string; href: string }) {
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
                        className="group inline-flex items-center gap-1 px-3 py-2 text-[13px] font-semibold tracking-wide uppercase text-slate-600 transition-colors hover:text-brand-600"
                    >
                        {link.label}
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === dbItem.id ? 'rotate-180' : ''}`} />
                    </Link>
                    {openDropdown === dbItem.id && (
                        <div className="absolute left-0 top-full z-50 min-w-52 rounded-sm border border-slate-200 bg-white py-1 shadow-md">
                            {children.map((child) => (
                                <Link
                                    key={`child-${child.id}`}
                                    to={child.url}
                                    className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700"
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
                className="group relative px-3 py-2 text-[13px] font-semibold tracking-wide uppercase text-slate-600 transition-colors hover:text-brand-600"
            >
                {link.label}
                <span className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
        )
    }

    function renderDesktopDynamicLink(nav: NavItem) {
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
                        className="group inline-flex items-center gap-1 px-3 py-2 text-[13px] font-semibold tracking-wide uppercase text-slate-600 transition-colors hover:text-brand-600"
                    >
                        {nav.name}
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === nav.id ? 'rotate-180' : ''}`} />
                    </Link>
                    {openDropdown === nav.id && (
                        <div className="absolute left-0 top-full z-50 min-w-52 rounded-sm border border-slate-200 bg-white py-1 shadow-md">
                            {children.map((child) => (
                                <Link
                                    key={`cms-child-${child.id}`}
                                    to={child.url}
                                    className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700"
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
                className="group relative px-3 py-2 text-[13px] font-semibold tracking-wide uppercase text-slate-600 transition-colors hover:text-brand-600"
            >
                {nav.name}
                <span className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
        )
    }

    return (
        <>
            {/* Main navbar */}
            <div className={`transition-all duration-200 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="group flex items-center gap-2 shrink-0">
                            <img 
                                src="/labkurulum-logo.svg" 
                                alt="Lab Kurulum Logo" 
                                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" 
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {staticLinks.map(renderDesktopLink)}
                            {dynamicLinks.map(renderDesktopDynamicLink)}
                        </nav>

                        {/* CTA + Mobile toggle */}
                        <div className="flex items-center gap-3">
                            {/* Proje Simülatörü linki */}
                            <Link
                                to="/projelendir"
                                id="nav-simulator-link"
                                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-brand-600 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 border border-transparent hover:border-brand-200 rounded-sm"
                            >
                                <ScanLine className="w-3.5 h-3.5" />
                                Proje Simülatörü
                            </Link>

                            <Link
                                to="/iletisim"
                                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-accent-500 text-brand-900 text-[13px] font-bold uppercase tracking-wider transition-all duration-200 hover:bg-accent-400 hover:shadow-[0_0_0_2px_rgba(245,158,11,0.3)] dimension-line"
                            >
                                Teklif Al
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                                className="lg:hidden p-2 text-slate-600"
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
                <div className="lg:hidden border-b border-slate-200 bg-white shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                        {staticLinks.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                            return (
                                <div key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="block text-sm font-semibold text-slate-700 py-2.5 px-3 rounded-sm hover:bg-slate-50 uppercase tracking-wide"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                    {children?.map((child) => (
                                        <Link
                                            key={`m-child-${child.id}`}
                                            to={child.url}
                                            className="block text-sm text-slate-500 py-2 pl-7 pr-3 rounded-sm hover:bg-slate-50"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )
                        })}
                        {dynamicLinks.map((nav) => {
                            const children = childrenMap.get(nav.id)
                            return (
                                <div key={`cms-m-${nav.id}`}>
                                    <Link
                                        to={nav.url}
                                        className="block text-sm font-semibold text-slate-700 py-2.5 px-3 rounded-sm hover:bg-slate-50 uppercase tracking-wide"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {nav.name}
                                    </Link>
                                    {children?.map((child) => (
                                        <Link
                                            key={`cms-m-child-${child.id}`}
                                            to={child.url}
                                            className="block text-sm text-slate-500 py-2 pl-7 pr-3 rounded-sm hover:bg-slate-50"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )
                        })}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <Link
                                to="/projelendir"
                                id="mobile-nav-simulator-link"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-sm border border-slate-200 text-slate-600 font-mono text-sm uppercase tracking-wider"
                                onClick={() => setMobileOpen(false)}
                            >
                                <ScanLine className="w-4 h-4 text-brand-500" />
                                Proje Simülatörü
                            </Link>
                            <Link
                                to="/iletisim"
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-sm bg-accent-500 text-brand-900 text-sm font-bold uppercase tracking-wider"
                                onClick={() => setMobileOpen(false)}
                            >
                                Teklif Al
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
