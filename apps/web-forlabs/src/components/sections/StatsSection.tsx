import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'

export function CapabilitiesSection() {
  const { lang } = useLanguage()

  const CAPABILITIES = [
    {
      number: '01',
      titleKey: 'capabilities.cap1.title' as const,
      descKey: 'capabilities.cap1.desc' as const,
      href: '/urunler',
    },
    {
      number: '02',
      titleKey: 'capabilities.cap2.title' as const,
      descKey: 'capabilities.cap2.desc' as const,
      href: '/hizmetler',
    },
    {
      number: '03',
      titleKey: 'capabilities.cap3.title' as const,
      descKey: 'capabilities.cap3.desc' as const,
      href: '/akademi',
    },
  ]

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* Left — Editorial image */}
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=900&auto=format&fit=crop"
              alt={t('capabilities.labImgAlt', lang)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/10" />
          </div>

          {/* Right — Capabilities */}
          <div className="py-20 sm:py-24 lg:py-28 lg:pl-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {t('capabilities.badge', lang)}
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t('capabilities.title', lang)}
            </h2>

            <div className="mt-14 space-y-0 divide-y divide-slate-200">
              {CAPABILITIES.map((cap) => (
                <Link
                  key={cap.number}
                  to={cap.href}
                  className="group block py-7 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-5">
                    <span className="mt-1 text-[13px] font-extrabold tabular-nums text-slate-300">
                      {cap.number}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                        {t(cap.titleKey, lang)}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                        {t(cap.descKey, lang)}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-400 transition-colors group-hover:text-slate-900">
                        {t('common.explore', lang)}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
