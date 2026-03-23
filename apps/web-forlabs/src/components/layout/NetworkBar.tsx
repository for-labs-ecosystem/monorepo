import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, ArrowUpRight, LayoutGrid, ChevronDown, ExternalLink, User } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { useMemberAuth } from '@/lib/auth'

const NETWORK_BRANDS: { name: string; href: string; color: string; descKey: TranslationKey }[] = [
  { name: 'AtagoTR', href: 'https://atagotr.com', color: '#2563eb', descKey: 'network.atagotr' },
  { name: 'GıdaTest', href: 'https://gidatest.com', color: '#16a34a', descKey: 'network.gidatest' },
  { name: 'LabKurulum', href: 'https://labkurulum.com', color: '#475569', descKey: 'network.labkurulum' },
  { name: 'GıdaKimya', href: 'https://gidakimya.com', color: '#9333ea', descKey: 'network.gidakimya' },
  { name: 'Alerjen', href: 'https://alerjen.com', color: '#ea580c', descKey: 'network.alerjen' },
  { name: 'HijyenKontrol', href: 'https://hijyenkontrol.com', color: '#0891b2', descKey: 'network.hijyenkontrol' },
]

export function NetworkBar() {
  const { lang, toggleLang } = useLanguage()
  const { member } = useMemberAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative z-100 border-b border-slate-200 bg-slate-50 text-slate-600" ref={menuRef}>
      <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-6 lg:px-10">

        {/* Left: Ecosystem Trigger */}
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-all ${isOpen ? 'bg-slate-200/70' : 'hover:bg-slate-200/50'}`}
          >
            <LayoutGrid className={`h-4 w-4 transition-colors ${isOpen ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-600'}`} />
            <div className={`relative flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.15em] uppercase transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`}>
              {t('networkBar.ecosystem', lang)}
              <div className={`relative flex h-4 w-12 items-center transition-opacity ${isOpen ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                <img src="/forlabs-logo-blue.svg" alt="For-Labs" className={`absolute h-4 w-auto transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`} />
                <img src="/forlabs-logo-blue-hover.svg" alt="For-Labs Hover" className={`absolute h-4 w-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </div>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Right: Tools & Settings */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-800"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang.toUpperCase()}
          </button>

          {member ? (
            <a
              href="/hesabim"
              className="group flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-[11px] font-bold text-brand-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-100"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline max-w-24 truncate">{member.full_name.split(' ')[0]}</span>
              <span className="sm:hidden">{t('auth.myAccount', lang)}</span>
            </a>
          ) : (
            <a
              href="/giris-yap"
              className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            >
              {t('auth.loginSignup', lang)}
              <ArrowUpRight className="h-3 w-3 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </a>
          )}
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <div
        className={`absolute left-0 w-full border-b border-slate-200 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
          }`}
      >
        <div className="mx-auto max-w-[1400px] p-6 lg:p-10">
          <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-2xl font-medium text-slate-900">
                {t('networkBar.megaMenuTitle1', lang)} <span className="text-slate-400">{t('networkBar.megaMenuTitle2', lang)}</span>
              </h3>
              <p className="mt-2 font-sans text-sm text-slate-500 max-w-xl">
                {t('networkBar.megaMenuDesc', lang)}
              </p>
            </div>
            <Link to="/ekosistem" className="hidden sm:flex group items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700">
              {t('networkBar.viewAll', lang)}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          <div className="no-scrollbar -mx-2 flex gap-4 overflow-x-auto px-2 pb-8 pt-4 sm:gap-5">
            {NETWORK_BRANDS.map((brand) => (
              <a
                key={brand.name}
                href={brand.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex min-w-[210px] flex-1 flex-col items-start gap-1 rounded-[16px] border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:border-brand-500/20 hover:shadow-[0_8px_24px_rgb(0,0,0,0.04)] hover:-translate-y-1"
              >
                {/* Brand Color Glow Effect - Minimal */}
                <div
                  className="absolute inset-0 -z-10 rounded-[16px] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-[0.03]"
                  style={{ backgroundColor: brand.color }}
                />

                <div className="flex w-full items-center justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 shadow-inner ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                  >
                    <div
                      className="h-3.5 w-3.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ring-2 ring-white"
                      style={{ backgroundColor: brand.color }}
                    />
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-brand-50 group-hover:text-brand-500">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[15px] font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-900">
                    {brand.name}
                  </span>
                  <span className="text-[12px] font-medium text-slate-500 line-clamp-2 leading-snug">
                    {t(brand.descKey, lang)}
                  </span>
                </div>

                {/* Bottom line hint */}
                <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
