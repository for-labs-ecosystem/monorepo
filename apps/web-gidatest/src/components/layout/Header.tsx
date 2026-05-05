import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Sprout, FlaskConical, BookOpen, Building2, Phone, Wrench } from 'lucide-react'
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
    { label: 'Ürünler', href: '/urunler', Icon: FlaskConical, desc: 'Analiz cihazları & test kitleri' },
    { label: 'Hizmetler', href: '/hizmetler', Icon: Wrench, desc: 'Akredite analiz ve raporlama' },
    { label: 'Bilgi Bankası', href: '/bilgi-bankasi', Icon: BookOpen, desc: 'Gıda güvenliği & teknik makaleler' },
    { label: 'Kurumsal', href: '/kurumsal', Icon: Building2, desc: 'Hakkımızda & değerlerimiz' },
    { label: 'İletişim', href: '/iletisim', Icon: Phone, desc: 'Bize ulaşın, teklif alın' },
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
            <div
                className={`relative mx-auto max-w-7xl transition-all duration-400 ${
                    scrolled
                        ? 'bg-oat-50/85 backdrop-blur-xl border border-stone-200 shadow-[0_18px_50px_-18px_rgba(26,51,32,0.15)] mt-2'
                        : 'bg-transparent border-transparent shadow-none mt-0'
                }`}
                style={{
                    borderTopLeftRadius: '2rem',
                    borderBottomRightRadius: '2rem',
                    borderTopRightRadius: '0.75rem',
                    borderBottomLeftRadius: '0.75rem',
                }}
            >
                <div className="relative flex h-[78px] items-center justify-between pl-5 pr-3">
                    {/* Official SVG Logo */}
                    <Link to="/" className="group shrink-0 flex items-center" aria-label="GıdaTest">
                        <img 
                            src="/images/gidatest-logo.svg" 
                            alt="GıdaTest" 
                            className="h-10 w-auto transition-transform duration-300 group-hover:scale-[1.05]" 
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-0.5">
                        {STATIC_LINKS.map((link) => {
                            const dbItem = urlToDbItem.get(link.href)
                            const children = dbItem ? childrenMap.get(dbItem.id) : undefined
                            const Icon = link.Icon
                            const active = isActive(link.href)

                            return (
                                <div key={link.href} className="relative group">
                                    <Link
                                        to={link.href}
                                        className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${
                                            active
                                                ? 'text-forest-900 bg-sage-100/70'
                                                : 'text-stone-600 hover:text-forest-900 hover:bg-sage-50/70'
                                        }`}
                                        style={{
                                            borderTopLeftRadius: '0.85rem',
                                            borderBottomRightRadius: '0.85rem',
                                        }}
                                    >
                                        <Icon className={`w-3.5 h-3.5 transition-colors ${active ? 'text-sage-600' : 'text-stone-400 group-hover:text-sage-500'}`} />
                                        {link.label}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-stone-400 transition-transform duration-300 group-hover:rotate-180" />
                                        )}
                                    </Link>

                                    {/* Hover dropdown — desc card */}
                                    {!children?.length && (
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none">
                                            <div className="bg-oat-50 border border-stone-200 px-4 py-3 w-56 shadow-[0_8px_32px_-8px_rgba(26,51,32,0.18)]"
                                                 style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                    <div className="flex items-center justify-center w-7 h-7 bg-sage-100"
                                                         style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                                        <Icon className="w-3.5 h-3.5 text-sage-600" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-forest-800">{link.label}</span>
                                                </div>
                                                <p className="text-[11.5px] text-stone-500 leading-relaxed pl-9">{link.desc}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub-menu */}
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-60 bg-oat-50 border border-stone-200 p-2 space-y-0.5 shadow-[0_8px_32px_-8px_rgba(26,51,32,0.18)]"
                                                 style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-sage-50 hover:text-forest-900 transition-all duration-200"
                                                        style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                                                    >
                                                        <ChevronDown className="w-3 h-3 -rotate-90 text-stone-400" />
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
                                        className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${
                                            isActive(nav.url)
                                                ? 'text-forest-900 bg-sage-100/70'
                                                : 'text-stone-600 hover:text-forest-900 hover:bg-sage-50/70'
                                        }`}
                                        style={{
                                            borderTopLeftRadius: '0.85rem',
                                            borderBottomRightRadius: '0.85rem',
                                        }}
                                    >
                                        <Sprout className="w-3.5 h-3.5 text-stone-400 group-hover:text-sage-500" />
                                        {nav.name}
                                        {children && children.length > 0 && (
                                            <ChevronDown className="h-3 w-3 text-stone-400 group-hover:rotate-180 transition-transform duration-300" />
                                        )}
                                    </Link>
                                    {children && children.length > 0 && (
                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <div className="w-60 bg-oat-50 border border-stone-200 p-2 space-y-0.5 shadow-[0_8px_32px_-8px_rgba(26,51,32,0.18)]"
                                                 style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                                                {children.sort((a, b) => a.sort_order - b.sort_order).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        to={child.url}
                                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-sage-50 hover:text-forest-900 transition-all duration-200"
                                                        style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                                                    >
                                                        <ChevronDown className="w-3 h-3 -rotate-90 text-stone-400" />
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

                    <div className="flex items-center gap-3">
                        <Link
                            to="/iletisim"
                            className="hidden sm:inline-flex btn-organic !py-2.5 !px-5 text-[12.5px]"
                        >
                            Teklif İste
                        </Link>
                        <button
                            className="lg:hidden p-2.5 text-stone-600 hover:text-forest-900 hover:bg-sage-50 transition-all duration-300"
                            style={{ borderTopLeftRadius: '0.85rem', borderBottomRightRadius: '0.85rem' }}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menüyü aç/kapat"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-x-0 top-[120px] z-50 mx-6 bg-oat-50 border border-stone-200 shadow-[0_16px_48px_-12px_rgba(26,51,32,0.18)] overflow-hidden animate-fade-in-up"
                     style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}>
                    <div className="p-4 space-y-0.5">
                        {STATIC_LINKS.map((link) => {
                            const Icon = link.Icon
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 text-[13.5px] font-semibold transition-all duration-200 ${
                                        isActive(link.href) ? 'bg-sage-100 text-forest-900' : 'text-stone-600 hover:bg-sage-50/70'
                                    }`}
                                    style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                                >
                                    <Icon className={`w-4 h-4 ${isActive(link.href) ? 'text-sage-600' : 'text-stone-400'}`} />
                                    {link.label}
                                </Link>
                            )
                        })}
                        {dynamicRoots.map((nav) => (
                            <Link
                                key={nav.id}
                                to={nav.url}
                                className="flex items-center gap-3 px-4 py-3.5 text-[13.5px] font-semibold text-stone-600 hover:bg-sage-50/70 transition-all duration-200"
                                style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                            >
                                <Sprout className="w-4 h-4 text-stone-400" />
                                {nav.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-stone-200">
                            <Link to="/iletisim" className="block text-center btn-organic !w-full">
                                Teklif İste
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
