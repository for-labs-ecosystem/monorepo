import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useServices } from '@/hooks/useServices'
import { getImageUrl } from '@/lib/utils'


/* ──────────────────────────────────────────────
   HERO — Swiss-style editorial header
   ────────────────────────────────────────────── */
function ServicesHero() {
    const { lang } = useLanguage()
    return (
        <section className="relative w-full overflow-hidden bg-white">
            {/* Soft glowing pastel blobs */}
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-amber-200/20 blur-[100px] mix-blend-multiply pointer-events-none" />
            <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-[100px] mix-blend-multiply pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-200/15 blur-[100px] mix-blend-multiply pointer-events-none" />

            {/* Subtle grid background, stronger opacity so colored blobs reveal it */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-size-[60px_60px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-12 lg:px-8 lg:pb-16 lg:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text Content */}
                    <div className="flex flex-col items-start gap-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 px-4 py-1.5">
                            <FlaskConical className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                {t('services.badge', lang)}
                            </span>
                        </div>

                        <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-6xl lg:text-7xl whitespace-pre-wrap">
                            {t('services.pageTitle', lang)}
                        </h1>

                        <p className="max-w-2xl text-lg font-light leading-relaxed text-slate-500 sm:text-xl">
                            {t('services.pageDesc', lang)}
                        </p>
                    </div>

                    {/* Right: Charcoal Sketch Image */}
                    <div className="relative flex justify-center lg:justify-end opacity-90 mix-blend-multiply">
                        <img
                            src="/images/lab_services_sketch.png"
                            alt="Laboratory Services Illustration"
                            className="w-[400px] max-w-full drop-shadow-sm filter contrast-125 saturate-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   CATALOG LAYOUT — Left: Cards, Right: Sticky Index
   ────────────────────────────────────────────── */
function CatalogSection() {
    const { lang } = useLanguage()
    const { data, isLoading, isError, refetch } = useServices()
    const [activeSlug, setActiveSlug] = useState<string | null>(null)

    // Observe scroll position for sticky index
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSlug(entry.target.getAttribute('data-slug'))
                    }
                })
            },
            {
                rootMargin: '-20% 0px -60% 0px', // Trigger when item is in the upper part of the viewport
                threshold: 0,
            }
        )

        const elements = document.querySelectorAll('.service-card-section')
        elements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [data])

    const scrollToService = (slug: string) => {
        const el = document.getElementById(`service-${slug}`)
        if (el) {
            // Offset for fixed header and some padding
            const y = el.getBoundingClientRect().top + window.scrollY - 120
            window.scrollTo({ top: y, behavior: 'smooth' })
        }
    }

    // Handle Loading State
    if (isLoading) {
        return (
            <section className="flex min-h-[40vh] items-center justify-center bg-white border-t border-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <p className="text-sm text-slate-400">{t('services.loading', lang)}</p>
                </div>
            </section>
        )
    }

    // Handle Error State
    if (isError) {
        return (
            <section className="flex min-h-[40vh] items-center justify-center bg-white border-t border-slate-100">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-6 w-6 text-slate-300" />
                    <p className="text-sm text-slate-500">{t('services.error', lang)}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 rounded-full border border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        {t('services.retry', lang)}
                    </button>
                </div>
            </section>
        )
    }

    const services = data?.data ?? []

    if (services.length === 0) {
        return (
            <section className="flex min-h-[40vh] items-center justify-center bg-white border-t border-slate-100">
                <div className="flex flex-col items-center gap-3 text-center">
                    <FlaskConical className="h-8 w-8 text-slate-200" strokeWidth={1} />
                    <p className="text-sm text-slate-400">{t('services.noServices', lang)}</p>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-white pb-24 lg:pb-32 border-t border-slate-100 pt-16 lg:pt-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">

                    {/* Left Column: Flowing Cards (col-span-8 or 9) */}
                    <div className="flex flex-col gap-16 lg:col-span-8 lg:col-start-1">
                        {services.map((service, index) => {
                            const title = localizedField(service, 'title', lang)
                            const desc = localizedField(service, 'description', lang)

                            return (
                                <article
                                    key={service.slug}
                                    id={`service-${service.slug}`}
                                    data-slug={service.slug}
                                    className="service-card-section scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-8 transition-colors duration-500 hover:border-slate-300 md:p-12"
                                >
                                    <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-10">

                                        {/* Inner Left: Image (Constrained size) */}
                                        <div className="md:col-span-5">
                                            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                {service.image_url ? (
                                                    <img
                                                        src={getImageUrl(service.image_url)}
                                                        alt={title}
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <FlaskConical className="h-10 w-10 text-slate-200" strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Decorative Index / Feature Tag */}
                                            <div className="mt-6 flex items-center gap-4">
                                                <span className="font-serif text-[11px] font-medium tracking-[0.2em] text-slate-300">
                                                    VOL. {String(index + 1).padStart(2, '0')}
                                                </span>
                                                {service.service_type && (
                                                    <div className="h-px flex-1 bg-slate-100" />
                                                )}
                                                {service.service_type && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {service.service_type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inner Right: Content & Actions */}
                                        <div className="flex flex-col justify-between md:col-span-7">
                                            <div>
                                                <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl">
                                                    {title}
                                                </h2>
                                                {desc && (
                                                    <p className="mt-6 text-sm font-light leading-[1.8] text-slate-500 md:text-base">
                                                        {desc}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-10 flex flex-wrap items-center gap-3">
                                                <Link
                                                    to={`/hizmetler/${service.slug}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800"
                                                >
                                                    {t('services.explore', lang)}
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                                <Link
                                                    to={`/iletisim?subject=${encodeURIComponent(title)}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Bilgi Al
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    {/* Right Column: Sticky Fihrist (col-span-4) */}
                    <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
                        <div className="sticky top-32 flex flex-col pt-4">
                            <h3 className="mb-6 border-b border-slate-100 pb-5 font-serif text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                                Fihrist
                            </h3>
                            <nav className="relative ml-2 flex flex-col border-l border-slate-100 py-2">
                                {services.map((service) => {
                                    const title = localizedField(service, 'title', lang)
                                    const isActive = activeSlug === service.slug

                                    return (
                                        <button
                                            key={service.slug}
                                            onClick={() => scrollToService(service.slug)}
                                            className={`relative flex items-center py-3 pl-6 text-left text-[13px] leading-relaxed transition-all duration-300 ${isActive
                                                ? 'font-medium text-slate-900'
                                                : 'font-light text-slate-400 hover:text-slate-700'
                                                }`}
                                        >
                                            {/* Active indicator dot on the border line */}
                                            {isActive && (
                                                <span className="absolute -left-[2px] top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full bg-slate-900 transition-all" />
                                            )}
                                            <span className="line-clamp-2">{title}</span>
                                        </button>
                                    )
                                })}
                            </nav>

                            {/* Consultation minimal block below index */}
                            <div className="mt-12 rounded-2xl bg-slate-50 p-6 mix-blend-multiply">
                                <h4 className="font-serif text-[15px] font-medium text-slate-900">
                                    Projeniz mi var?
                                </h4>
                                <p className="mt-2 text-[12px] font-light leading-relaxed text-slate-500">
                                    Laboratuvarınızın ihtiyaçları için uzman ekibimizle görüşün.
                                </p>
                                <Link
                                    to="/iletisim"
                                    className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-600 transition-colors hover:text-brand-700"
                                >
                                    Bize Ulaşın <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   PAGE EXPORT
   ────────────────────────────────────────────── */
export default function ServicesPage() {
    const { lang } = useLanguage()

    useEffect(() => {
        document.title = `${t('services.pageTitle', lang)} — For-Labs`
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', t('services.metaDesc', lang))
    }, [lang])

    return (
        <div className="min-h-screen bg-slate-50/10">
            <ServicesHero />
            <CatalogSection />
        </div>
    )
}
