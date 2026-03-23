import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'

export function HeroSection() {
  const { lang } = useLanguage()

  const METRICS = [
    { value: '15+', label: t('heroSection.metric.years', lang) },
    { value: 'ISO 9001', label: t('heroSection.metric.quality', lang) },
    { value: '1.200+', label: t('heroSection.metric.clients', lang) },
    { value: '7', label: t('heroSection.metric.companies', lang) },
  ]

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Editorial Hero — text + image */}
        <div className="grid grid-cols-1 items-end gap-10 pb-12 pt-14 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:pb-16 lg:pt-20">
          {/* Left — Copy */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {t('heroSection.badge', lang)}
            </p>

            <h1 className="mt-6 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.08] tracking-tight text-slate-900">
              {t('heroSection.titleLine1', lang)}
              <br />
              {t('heroSection.titleLine2', lang)}
              <br />
              <span className="text-brand-600">{t('heroSection.titleLine3', lang)}</span>
            </h1>

            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-slate-500">
              {t('heroSection.desc', lang)}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to="/urunler"
                className="group inline-flex items-center gap-2 bg-slate-900 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-slate-800"
              >
                {t('heroSection.ctaProducts', lang)}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/akademi"
                className="group inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
              >
                <span className="border-b border-slate-400 pb-0.5 group-hover:border-slate-900">{t('heroSection.ctaAcademy', lang)}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right — Editorial image */}
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1200&auto=format&fit=crop"
              alt={t('heroSection.imgCaption', lang)}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                {t('heroSection.imgCaption', lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 border-t border-slate-200 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`py-7 lg:py-9 ${
                i < METRICS.length - 1 ? 'border-r border-slate-200' : ''
              } ${i < 2 ? 'border-b border-slate-200 lg:border-b-0' : ''}`}
            >
              <div className={`${i === 0 ? '' : 'pl-6 lg:pl-8'}`}>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{m.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
