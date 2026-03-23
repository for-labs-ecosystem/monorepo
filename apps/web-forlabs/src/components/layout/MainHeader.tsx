import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, ShoppingBag, Heart } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { useCart } from '@/lib/cart'
import { useMemberAuth } from '@/lib/auth'
import { NavbarSearch } from './NavbarSearch'

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

  const favCount = useMemo(() => {
    if (!member?.favorite_products) return 0
    try {
      const arr = JSON.parse(member.favorite_products)
      return Array.isArray(arr) ? arr.length : 0
    } catch {
      return 0
    }
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
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10">

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

            if (isProducts) {
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group relative mr-2 flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/50 px-4 py-2 mt-0.5 text-[13px] font-semibold text-slate-700 transition-all duration-300 hover:border-[#0055FF] hover:bg-[#0055FF] hover:text-white hover:shadow-lg hover:shadow-[#0055FF]/20"
                >
                  <div className="relative flex h-[10px] w-[10px] items-center justify-center">
                    <span className="absolute h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out" />
                    <span className="absolute h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out group-hover:rotate-90" />
                  </div>
                  <span>{t(link.labelKey, lang)}</span>
                </Link>
              )
            }

            return (
              <Link
                key={link.href}
                to={link.href}
                className="group relative px-4 py-5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {t(link.labelKey, lang)}
                <span className="absolute bottom-[14px] left-4 right-4 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#0055FF] transition-transform duration-300 ease-out group-hover:scale-x-100" />
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
            <Heart className="h-[17px] w-[17px]" strokeWidth={1.75} />
            {favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </Link>
          <Link to="/sepet" className="relative rounded-full p-2.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700">
            <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.75} />
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
          <nav className="mx-auto max-w-[1400px] px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-slate-100 py-3.5 text-[13px] font-medium text-slate-700 last:border-0"
              >
                {t(link.labelKey, lang)}
              </Link>
            ))}
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
