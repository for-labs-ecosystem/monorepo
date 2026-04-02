import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Package, BookOpen, Building2, Phone, Beaker, FileText } from 'lucide-react'
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

// Icon map for each static nav link
const NAV_ICON_MAP: Record<string, React.ElementType> = {
    '/urunler': Package,
    '/arastirmalar': BookOpen,
    '/kurumsal': Building2,
    '/iletisim': Phone,
}

// Short description for hover tooltip
const NAV_DESC_MAP: Record<string, string> = {
    '/urunler': 'Test kiti kataloğunu inceleyin',
    '/arastirmalar': 'Bilimsel makale ve araştırmalar',
    '/kurumsal': 'Hakkımızda ve değerlerimiz',
    '/iletisim': 'Bize ulaşın, teklif alın',
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
        const onScroll = () => setScrolled(window.scrollY > 20)
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
                className={`w-full transition-all duration-400 ${
                    scrolled
                        ? 'bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
                <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 lg:px-10">

                    {/* Logo */}
                    <Link to="/" className="group shrink-0">
                        <img
                            src="/alerjen-logo.png"
                            alt="Alerjen.net"
                            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {STATIC_LINKS.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                            const Icon = NAV_ICON_MAP[link.href] ?? FileText
                            const desc = NAV_DESC_MAP[link.href]
                            const active = isActive(link.href)

                            return (
                                <div key={link.href} className="relative group">
                                    <Link
                                        to={link.href}
                                        className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-all duration-300 ${
                                            active
                                                ? 'text-orange-600 bg-orange-50/80'
                                                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/60'
                                        }`}
                                    >
                                        {/* Active underline dot */}
                                        {active && (
                                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                                        )}
                                        <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${active ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-400'}`} />
                                        {link.label}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-slate-300 group-hover:text-orange-400 transition-transform duration-300 group-hover:rotate-180" />
                                        )}
                                    </Link>

                                    {/* Hover tooltip card */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none">
                                        {!children?.length && (
                                            <div className="bg-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-slate-100 px-4 py-3 w-52 pointer-events-none">
                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                    <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-50">
                                                        <Icon className="w-3.5 h-3.5 text-orange-500" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-slate-700">{link.label}</span>
                                                </div>
                                                <p className="text-[11.5px] text-slate-400 leading-relaxed pl-9">{desc}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropdown if has children */}
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-60 bg-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-slate-100 p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-orange-50/60 hover:text-orange-600 rounded-xl transition-all duration-200"
                                                    >
                                                        <ChevronDown className="w-3 h-3 -rotate-90 text-slate-300" />
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
                                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-all duration-300 ${
                                            isActive(nav.url)
                                                ? 'text-orange-600 bg-orange-50/80'
                                                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/60'
                                        }`}
                                    >
                                        <Beaker className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
                                        {nav.name}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-slate-300 group-hover:rotate-180 transition-transform duration-300" />
                                        )}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-60 bg-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-slate-100 p-2 space-y-0.5">
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-orange-50/60 hover:text-orange-600 rounded-xl transition-all duration-200"
                                                    >
                                                        <ChevronDown className="w-3 h-3 -rotate-90 text-slate-300" />
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
                            to="/teklif"
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

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-x-0 top-[68px] z-50 mx-4 bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-3xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-in-up">
                    <div className="p-4 space-y-0.5">
                        {STATIC_LINKS.map((link) => {
                            const Icon = NAV_ICON_MAP[link.href] ?? FileText
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13.5px] font-semibold transition-all duration-200 ${
                                        isActive(link.href) ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50/80'
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon className={`w-4 h-4 ${isActive(link.href) ? 'text-orange-500' : 'text-slate-400'}`} />
                                    {link.label}
                                </Link>
                            )
                        })}
                        {dynamicRoots.map((nav) => (
                            <Link
                                key={nav.id}
                                to={nav.url}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13.5px] font-semibold text-slate-600 hover:bg-slate-50/80 transition-all duration-200"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Beaker className="w-4 h-4 text-slate-400" />
                                {nav.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-slate-100">
                            <Link
                                to="/teklif"
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
