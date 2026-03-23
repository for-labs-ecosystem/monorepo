import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'

export function SectorsGridSection() {
  const { lang } = useLanguage()

  const SECTORS = [
    {
      tagKey: 'sectors.food.tag' as const,
      titleKey: 'sectors.food.title' as const,
      descKey: 'sectors.food.desc' as const,
      href: '/cozumler/gida-analizi',
      span: 'lg:col-span-2',
      img: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop',
    },
    {
      tagKey: 'sectors.pharma.tag' as const,
      titleKey: 'sectors.pharma.title' as const,
      descKey: 'sectors.pharma.desc' as const,
      href: '/cozumler/ilac-kozmetik',
      span: '',
      img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop',
    },
    {
      tagKey: 'sectors.water.tag' as const,
      titleKey: 'sectors.water.title' as const,
      descKey: 'sectors.water.desc' as const,
      href: '/cozumler/cevre-analizi',
      span: '',
      img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    },
    {
      tagKey: 'sectors.chemistry.tag' as const,
      titleKey: 'sectors.chemistry.title' as const,
      descKey: 'sectors.chemistry.desc' as const,
      href: '/cozumler/kimya',
      span: 'lg:col-span-2',
      img: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop',
    },
  ]

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="border-t border-slate-200 py-20 sm:py-24 lg:py-28">
          {/* Section heading */}
          <div className="mb-14 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                {t('sectors.badge', lang)}
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t('sectors.title', lang)}
              </h2>
            </div>
            <Link
              to="/cozumler"
              className="group hidden items-center gap-2 text-[13px] font-semibold text-slate-900 lg:inline-flex"
            >
              <span className="border-b border-slate-900 pb-0.5">{t('sectors.allSolutions', lang)}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento Grid with images */}
          <div className="grid grid-cols-1 gap-px bg-slate-200 lg:grid-cols-3">
            {SECTORS.map((sector) => (
              <Link
                key={sector.tagKey}
                to={sector.href}
                className={`group relative overflow-hidden bg-white transition-colors hover:bg-slate-50 ${sector.span}`}
              >
                {/* Thumbnail */}
                <div className="overflow-hidden">
                  <img
                    src={sector.img}
                    alt={t(sector.titleKey, lang)}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Content */}
                <div className="p-7 lg:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                    {t(sector.tagKey, lang)}
                  </p>
                  <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
                    {t(sector.titleKey, lang)}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {t(sector.descKey, lang)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-400 transition-colors group-hover:text-slate-900">
                    {t('common.detailedExplore', lang)}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
