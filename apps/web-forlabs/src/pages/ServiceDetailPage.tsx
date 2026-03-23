import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FlaskConical, Loader2, AlertCircle, Phone } from 'lucide-react'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useService, useServices } from '@/hooks/useServices'
import { getImageUrl } from '@/lib/utils'
import type { Service } from '@forlabs/shared'

/* ──────────────────────────────────────────────
   BREADCRUMB
   ────────────────────────────────────────────── */
function Breadcrumb({ title }: { title: string }) {
    const { lang } = useLanguage()
    return (
        <nav className="border-b border-slate-100 bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 lg:px-8">
                <Link
                    to="/hizmetler"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-700"
                >
                    <ArrowLeft className="h-3 w-3" />
                    {t('serviceDetail.backToServices', lang)}
                </Link>
                <span className="text-slate-200">/</span>
                <span className="truncate text-[12px] font-medium text-slate-600">{title}</span>
            </div>
        </nav>
    )
}

/* ──────────────────────────────────────────────
   HERO — Full-width image or split layout
   ────────────────────────────────────────────── */
function DetailHero({ service }: { service: Service }) {
    const { lang } = useLanguage()
    const title = localizedField(service, 'title', lang)
    const description = localizedField(service, 'description', lang)

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">

                    {/* Left: Text */}
                    <div>
                        {service.service_type && (
                            <span className="mb-5 inline-block rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {service.service_type}
                            </span>
                        )}

                        <h1 className="font-serif text-3xl font-medium leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-slate-500 sm:text-lg">
                                {description}
                            </p>
                        )}

                        {/* Tags */}
                        {service.tags && (() => {
                            let tagList: string[] = []
                            try {
                                const parsed = JSON.parse(service.tags!)
                                tagList = Array.isArray(parsed) ? parsed : service.tags!.split(',')
                            } catch {
                                tagList = service.tags!.split(',')
                            }
                            return (
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {tagList.map((tag: string) => (
                                        <span
                                            key={tag.trim()}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )
                        })()}
                    </div>

                    {/* Right: Image */}
                    <div>
                        {service.image_url ? (
                            <div className="aspect-[4/3] overflow-hidden rounded-sm">
                                <img
                                    src={getImageUrl(service.image_url)}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center rounded-sm bg-slate-50">
                                <FlaskConical className="h-16 w-16 text-slate-200" strokeWidth={1} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="border-b border-slate-200" />
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   CONTENT — Prose-style reading column
   ────────────────────────────────────────────── */
function DetailContent({ service }: { service: Service }) {
    const { lang } = useLanguage()
    const content = localizedField(service, 'content', lang)

    if (!content) return null

    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                {/* CMS rich text content */}
                <div
                    className="
            prose prose-slate max-w-none
            prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight
            prose-h2:mt-12 prose-h2:text-2xl prose-h2:text-slate-900
            prose-h3:mt-8 prose-h3:text-xl prose-h3:text-slate-800
            prose-p:text-[15px] prose-p:font-light prose-p:leading-[1.85] prose-p:text-slate-600
            prose-li:text-[15px] prose-li:font-light prose-li:text-slate-600
            prose-a:font-medium prose-a:text-brand-600 prose-a:no-underline hover:prose-a:text-brand-700
            prose-strong:font-semibold prose-strong:text-slate-800
            prose-img:rounded-sm prose-img:shadow-none
            prose-blockquote:border-l-2 prose-blockquote:border-slate-200 prose-blockquote:pl-6 prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-slate-500
            prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:text-slate-700
            prose-hr:border-slate-100
          "
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   SPECS — If service has specs data
   ────────────────────────────────────────────── */
function DetailSpecs({ service }: { service: Service }) {
    if (!service.specs) return null

    let specsData: Record<string, string>
    try {
        specsData = JSON.parse(service.specs)
    } catch {
        return null
    }

    const entries = Object.entries(specsData)
    if (entries.length === 0) return null

    return (
        <section className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <h2 className="mb-10 font-serif text-2xl font-medium tracking-tight text-slate-900">
                    Teknik Detaylar
                </h2>
                <div className="divide-y divide-slate-200">
                    {entries.map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                            <dt className="text-[13px] font-semibold text-slate-500">{key}</dt>
                            <dd className="text-[13px] text-slate-700 sm:col-span-2">{value}</dd>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   CTA — Sticky consultation prompt
   ────────────────────────────────────────────── */
function DetailCTA({ service }: { service: Service }) {
    const { lang } = useLanguage()
    const title = localizedField(service, 'title', lang)

    return (
        <section className="border-t border-slate-200 bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Badge */}
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5">
                        <Phone className="h-3 w-3 text-brand-600" strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {t('serviceDetail.ctaBadge', lang)}
                        </span>
                    </span>

                    <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                        {t('serviceDetail.ctaTitle', lang)}
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-500">
                        {t('serviceDetail.ctaDesc', lang)}
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                        <Link
                            to={`/iletisim?subject=${encodeURIComponent(title)}`}
                            className="group inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
                        >
                            {t('serviceDetail.ctaBtn', lang)}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{t('serviceDetail.ctaPhone', lang)}</span>
                            <a
                                href="tel:+908503778689"
                                className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
                            >
                                0850 377 86 89
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   RELATED SERVICES — Other services
   ────────────────────────────────────────────── */
function RelatedServices({ currentId }: { currentId: number }) {
    const { lang } = useLanguage()
    const { data } = useServices()
    const services = (data?.data ?? []).filter((s) => s.id !== currentId).slice(0, 3)

    if (services.length === 0) return null

    return (
        <section className="border-t border-slate-100 bg-slate-50 py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="mb-12 font-serif text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                    {t('serviceDetail.relatedServices', lang)}
                </h2>

                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => {
                        const serviceTitle = localizedField(service, 'title', lang)
                        const serviceDesc = localizedField(service, 'description', lang)

                        return (
                            <Link
                                key={service.id}
                                to={`/hizmetler/${service.slug}`}
                                className="group flex flex-col bg-white p-8 transition-colors hover:bg-slate-50"
                            >
                                {/* Image */}
                                {service.image_url ? (
                                    <div className="mb-6 aspect-[3/2] overflow-hidden rounded-sm">
                                        <img
                                            src={getImageUrl(service.image_url)}
                                            alt={serviceTitle}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-6 flex aspect-[3/2] items-center justify-center rounded-sm bg-slate-50">
                                        <FlaskConical className="h-10 w-10 text-slate-200" strokeWidth={1} />
                                    </div>
                                )}

                                <h3 className="font-serif text-lg font-medium tracking-tight text-slate-900 transition-colors group-hover:text-brand-600">
                                    {serviceTitle}
                                </h3>

                                {serviceDesc && (
                                    <p className="mt-2 line-clamp-2 flex-1 text-sm font-light leading-relaxed text-slate-500">
                                        {serviceDesc}
                                    </p>
                                )}

                                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-brand-600">
                                    {t('services.explore', lang)}
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────
   PAGE EXPORT
   ────────────────────────────────────────────── */
export default function ServiceDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { lang } = useLanguage()
    const { data, isLoading, isError } = useService(slug ?? '')

    const service = data?.data

    useEffect(() => {
        if (service) {
            const title = localizedField(service, 'title', lang)
            document.title = `${title} — For-Labs`
            const meta = document.querySelector('meta[name="description"]')
            if (meta) {
                meta.setAttribute('content', service.meta_description ?? localizedField(service, 'description', lang))
            }
        }
    }, [service, lang])

    /* Loading */
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <p className="text-sm text-slate-400">{t('serviceDetail.loading', lang)}</p>
                </div>
            </div>
        )
    }

    /* Error / Not found */
    if (isError || !service) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-6 w-6 text-slate-300" />
                    <p className="text-sm text-slate-500">{t('serviceDetail.notFound', lang)}</p>
                    <Link
                        to="/hizmetler"
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        {t('serviceDetail.backToServices', lang)}
                    </Link>
                </div>
            </div>
        )
    }

    const title = localizedField(service, 'title', lang)

    return (
        <>
            <Breadcrumb title={title} />
            <DetailHero service={service} />
            <DetailContent service={service} />
            <DetailSpecs service={service} />
            <DetailCTA service={service} />
            <RelatedServices currentId={service.id} />
        </>
    )
}
