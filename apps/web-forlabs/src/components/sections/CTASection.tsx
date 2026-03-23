import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'

export function CTASection() {
  const { lang } = useLanguage()

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="border-t border-slate-200 py-20 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left — Copy */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                {t('cta.badge', lang)}
              </p>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {t('cta.titleLine1', lang)}
                <br />
                {t('cta.titleLine2', lang)}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500">
                {t('cta.desc', lang)}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/iletisim"
                  className="group inline-flex items-center gap-2 bg-slate-900 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-slate-800"
                >
                  {t('cta.requestQuote', lang)}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="tel:+902121234567"
                  className="text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {t('cta.orCall', lang)} +90 (212) 123 45 67
                </a>
              </div>
            </div>

            {/* Right — Editorial image */}
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=900&auto=format&fit=crop"
                alt={t('cta.imgAlt', lang)}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
