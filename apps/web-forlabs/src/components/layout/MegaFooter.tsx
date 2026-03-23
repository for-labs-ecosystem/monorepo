import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface FooterColumn {
  titleKey: TranslationKey
  links: { labelKey: TranslationKey; href: string }[]
}

const COLUMNS: FooterColumn[] = [
  {
    titleKey: 'footer.col.solutions',
    links: [
      { labelKey: 'footer.link.foodAnalysis', href: '/cozumler/gida-analizi' },
      { labelKey: 'footer.link.waterEnv', href: '/cozumler/cevre-analizi' },
      { labelKey: 'footer.link.pharma', href: '/cozumler/ilac-kozmetik' },
      { labelKey: 'footer.link.chemistry', href: '/cozumler/kimya' },
    ],
  },
  {
    titleKey: 'footer.col.products',
    links: [
      { labelKey: 'footer.link.analyzers', href: '/urunler?category=analiz-cihazlari' },
      { labelKey: 'footer.link.equipment', href: '/urunler?category=lab-ekipmanlari' },
      { labelKey: 'footer.link.consumables', href: '/urunler?category=sarf-malzemeleri' },
      { labelKey: 'footer.link.allProducts', href: '/urunler' },
    ],
  },
  {
    titleKey: 'footer.col.info',
    links: [
      { labelKey: 'footer.link.academy', href: '/akademi' },
      { labelKey: 'footer.link.about', href: '/kurumsal' },
      { labelKey: 'footer.link.references', href: '/referanslar' },
      { labelKey: 'footer.link.contact', href: '/iletisim' },
    ],
  },
  {
    titleKey: 'footer.col.support',
    links: [
      { labelKey: 'footer.link.techSupport', href: '/iletisim' },
      { labelKey: 'footer.link.projectQuote', href: '/iletisim' },
      { labelKey: 'footer.link.shipping', href: '/kargo-teslimat' },
      { labelKey: 'footer.link.faq', href: '/sss' },
    ],
  },
]

const CERTIFICATIONS = ['ISO 9001', 'ISO 17025', 'CE', 'TSE']

export function MegaFooter() {
  const { lang } = useLanguage()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Top section: logo + description | 4 link columns */}
        <div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link to="/" className="group relative flex h-7 items-center">
              <img
                src="/forlabs-logo-blue.svg"
                alt="For Labs"
                className="absolute left-0 h-7 w-auto opacity-100 transition-opacity duration-300 group-hover:opacity-0"
              />
              <img
                src="/forlabs-logo-blue-hover.svg"
                alt="For Labs Hover"
                className="absolute left-0 h-7 w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-slate-500">
              {t('footer.brand.desc', lang)}
            </p>
            <div className="mt-6 space-y-2.5">
              <a href="tel:+902121234567" className="flex items-center gap-2.5 text-[13px] text-slate-500 transition-colors hover:text-slate-900">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +90 (212) 123 45 67
              </a>
              <a href="mailto:info@for-labs.com" className="flex items-center gap-2.5 text-[13px] text-slate-500 transition-colors hover:text-slate-900">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                info@for-labs.com
              </a>
              <div className="flex items-center gap-2.5 text-[13px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                İstanbul, Türkiye
              </div>
            </div>
          </div>

          {/* 4 Link columns — equal width, left-aligned */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.titleKey}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">
                  {t(col.titleKey, lang)}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.labelKey}>
                      <Link
                        to={link.href}
                        className="text-[13px] text-slate-500 transition-colors hover:text-slate-900"
                      >
                        {t(link.labelKey, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications & Payment Methods */}
        <div className="flex flex-wrap items-center gap-6 border-t border-slate-200 py-6">
          {/* Certifications */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t('footer.certifications', lang)}
            </span>
            {CERTIFICATIONS.map((cert) => (
              <span
                key={cert}
                className="border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
              >
                {cert}
              </span>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Payment'}
            </span>
            <div className="flex h-7 items-center rounded border border-slate-200 bg-white px-2.5">
              <span className="text-[10px] font-black tracking-wide text-[#2F6BFF]">iyzico</span>
            </div>
            <div className="flex h-7 items-center rounded border border-slate-200 bg-white px-2.5">
              <div className="flex -space-x-1.5">
                <div className="h-4 w-4 rounded-full bg-[#EB001B]" />
                <div className="h-4 w-4 rounded-full bg-[#F79E1B]" />
              </div>
            </div>
            <div className="flex h-7 items-center rounded border border-slate-200 bg-white px-2.5">
              <span className="text-[10px] font-black italic tracking-tight text-[#1434CB]">VISA</span>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 py-6 sm:flex-row sm:items-center">
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} {t('footer.copyright', lang)}
          </p>
          <div className="flex gap-5">
            <Link to="/gizlilik-politikasi" className="text-[11px] text-slate-400 transition-colors hover:text-slate-700">
              {t('footer.privacy', lang)}
            </Link>
            <Link to="/kullanim-kosullari" className="text-[11px] text-slate-400 transition-colors hover:text-slate-700">
              {t('footer.terms', lang)}
            </Link>
            <Link to="/kvkk" className="text-[11px] text-slate-400 transition-colors hover:text-slate-700">
              {t('footer.kvkk', lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
