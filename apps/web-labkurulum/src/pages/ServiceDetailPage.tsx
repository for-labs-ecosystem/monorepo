import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getService, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ServiceDetail {
    id: number
    slug: string
    title: string
    description: string | null
    short_description: string | null
    image_url: string | null
    content: string | null
    price: number | null
    currency: string | null
    meta_title: string | null
    meta_description: string | null
}

export default function ServiceDetailPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data, isLoading, error } = useQuery({
        queryKey: ['service', slug],
        queryFn: () => getService(slug!),
        enabled: !!slug,
    })

    const service = data?.data as ServiceDetail | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-brand-900 mb-3">Hizmet Bulunamadı</h1>
                <Link to="/hizmetler" className="text-sm font-semibold text-brand-600">← Hizmetlere Dön</Link>
            </div>
        )
    }

    return (
        <>
            <title>{service.meta_title || service.title} — Lab Kurulum</title>
            {service.meta_description && <meta name="description" content={service.meta_description} />}

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/hizmetler" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Hizmetlere Dön
                    </Link>
                </div>
            </div>

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-20">
                {service.image_url && (
                    <div className="mb-10 overflow-hidden rounded-md border border-slate-200">
                        <img
                            src={resolveMediaUrl(service.image_url)}
                            alt={service.title}
                            className="w-full h-48 sm:h-56 md:h-72 object-cover"
                        />
                    </div>
                )}

                <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight mb-4">{service.title}</h1>

                {service.short_description && (
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">{service.short_description}</p>
                )}

                {service.content ? (
                    <TiptapRenderer content={service.content} />
                ) : service.description ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                ) : null}

                {/* CTA */}
                <div className="mt-12 p-6 border border-brand-200 rounded-md bg-brand-50">
                    <h3 className="text-base font-bold text-brand-900">Bu hizmetten yararlanmak ister misiniz?</h3>
                    <p className="text-sm text-slate-600 mt-1">Proje detaylarınızı paylaşın, size özel teklif hazırlayalım.</p>
                    <Link
                        to="/iletisim"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors"
                    >
                        Teklif Al <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </>
    )
}
