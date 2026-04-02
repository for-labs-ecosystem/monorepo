import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, ShoppingBag, Heart, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage, t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { useCart } from '@/lib/cart'
import { useMemberAuth, parseFavoriteIds } from '@/lib/auth'
import { getNavigations } from '@/lib/api'
import { NavbarSearch } from './NavbarSearch'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface NavItem {
  id: number
  name: string
  url: string
  location: string
  parent_id: number | null
  sort_order: number
}

const NAV_LINKS: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: 'nav.products', href: '/urunler' },
  { labelKey: 'nav.services', href: '/hizmetler' },
  { labelKey: 'nav.academy', href: '/akademi' },
  { labelKey: 'nav.corporate', href: '/kurumsal' },
]

export function MainHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang } = useLanguage()
  const { totalItems } = useCart()
  const { member } = useMemberAuth()

  const { data: navRes } = useQuery({
    queryKey: ['navigations', 'header', SITE_ID],
    queryFn: () => getNavigations({ site_id: SITE_ID, location: 'header' }),
    staleTime: 5 * 60 * 1000,
  })
  const { roots: dynamicLinks, childrenMap, urlToDbItem } = useMemo(() => {
    const items = (navRes?.data ?? []) as NavItem[]
    const headerItems = items.filter((n) => n.location === 'header')
    const staticUrls = new Set(NAV_LINKS.map((l) => l.href))
    const roots = headerItems
      .filter((n) => !n.parent_id && !staticUrls.has(n.url))
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
  }, [navRes])

  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const favCount = useMemo(() => {
    return parseFavoriteIds(member?.favorite_products, SITE_ID).length
  }, [member?.favorite_products])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/85 backdrop-blur-2xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border-b border-slate-100/60'
        : 'bg-white border-b border-slate-100'
        }`}
    >
      <div className="mx-auto flex max-w-350 items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link to="/" className="group relative flex items-center py-4">
          <img
            src="/forlabs-logo-blue.svg"
            alt="For Labs"
            className="h-7 w-auto opacity-100 transition-opacity duration-300 group-hover:opacity-0 sm:h-8"
          />
          <img
            src="/forlabs-logo-blue-hover.svg"
            alt="For Labs Hover"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-8"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex translate-x-4">
          {NAV_LINKS.map((link) => {
            const isProducts = link.href === '/urunler'
            const dbItem = urlToDbItem.get(link.href)
            const children = dbItem ? childrenMap.get(dbItem.id) : undefined

            if (isProducts) {
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group relative mr-2 flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/50 px-4 py-2 mt-0.5 text-[13px] font-semibold text-slate-700 transition-all duration-300 hover:border-[#0055FF] hover:bg-[#0055FF] hover:text-white hover:shadow-lg hover:shadow-[#0055FF]/20"
                >
                  <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="absolute h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out" />
                    <span className="absolute h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out group-hover:rotate-90" />
                  </div>
                  <span>{t(link.labelKey, lang)}</span>
                </Link>
              )
            }

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
                    className="group relative flex items-center gap-1 px-4 py-5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                  >
                    {t(link.labelKey, lang)}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === dbItem.id ? 'rotate-180' : ''}`} />
                    <span className="absolute bottom-3.5 left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#0055FF] transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                  {openDropdown === dbItem.id && (
                    <div className="absolute left-0 top-full z-50 min-w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-lg shadow-slate-200/50">
                      {children.map((child) => (
                        <Link
                          key={`nav-child-${child.id}`}
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
                className="group relative px-4 py-5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {t(link.labelKey, lang)}
                <span className="absolute bottom-3.5 left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#0055FF] transition-transform duration-300 ease-out group-hover:scale-x-100" />
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
                    className="group relative flex items-center gap-1 px-4 py-5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                  >
                    {nav.name}
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === nav.id ? 'rotate-180' : ''}`} />
                    <span className="absolute bottom-3.5 left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#0055FF] transition-transform duration-300 ease-out group-hover:scale-x-100" />
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
                className="group relative px-4 py-5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {nav.name}
                <span className="absolute bottom-3.5 left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#0055FF] transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            to={member ? '/hesabim?tab=favorites' : '/giris-yap'}
            className="relative rounded-full p-2.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-rose-500"
          >
            <Heart className="h-4.5 w-4.5" strokeWidth={1.75} />
            {favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </Link>
          <Link to="/sepet" className="relative rounded-full p-2.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700">
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={1.75} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white ring-2 ring-white">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
          <NavbarSearch />

          <Link
            to="/iletisim"
            className="ml-2 hidden items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:bg-slate-700 hover:shadow-md lg:inline-flex"
          >
            {t('nav.contact', lang)}
            <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-2 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto max-w-350 px-6 py-4">
            {NAV_LINKS.map((link) => {
              const dbItem = urlToDbItem.get(link.href)
              const children = dbItem ? childrenMap.get(dbItem.id) : undefined
              return (
                <div key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-slate-100 py-3.5 text-[13px] font-medium text-slate-700"
                  >
                    {t(link.labelKey, lang)}
                  </Link>
                  {children && children.map((child) => (
                    <Link
                      key={`m-child-${child.id}`}
                      to={child.url}
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-slate-100 py-3 pl-6 text-[12px] font-medium text-slate-500 last:border-0"
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
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-slate-100 py-3.5 text-[13px] font-medium text-slate-700"
                  >
                    {nav.name}
                  </Link>
                  {children && children.map((child) => (
                    <Link
                      key={`cms-m-child-${child.id}`}
                      to={child.url}
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-slate-100 py-3 pl-6 text-[12px] font-medium text-slate-500 last:border-0"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )
            })}
            <Link
              to="/iletisim"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-[12px] font-semibold text-white"
            >
              {t('nav.contact', lang)}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
