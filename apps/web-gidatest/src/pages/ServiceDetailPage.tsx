import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Wrench } from 'lucide-react'
import { useService, TiptapRenderer } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'

export default function ServiceDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading } = useService(slug!)
    const service = data?.data

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!service) {
        return (
            <div className="max-w-xl mx-auto py-32 text-center px-6">
                <h1 className="heading-serif text-3xl mb-4">Hizmet bulunamadı</h1>
                <Link to="/hizmetler" className="btn-organic">
                    <ChevronLeft className="w-4 h-4" /> Hizmetlere Dön
                </Link>
            </div>
        )
    }

    return (
        <div className="py-16 lg:py-24">
            <title>{service.meta_title || service.title} — GıdaTest</title>
            {service.meta_description && <meta name="description" content={service.meta_description} />}
            <div className="max-w-4xl mx-auto px-6 lg:px-10">
                <Link to="/hizmetler" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-forest-900 mb-8">
                    <ChevronLeft className="w-4 h-4" /> Tüm Hizmetler
                </Link>

                {service.image_url ? (
                    <div className="card-organic overflow-hidden mb-10 h-72">
                        <img src={getImageUrl(service.image_url) || ''} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="card-organic overflow-hidden mb-10 h-72 bg-gradient-to-br from-sage-50 via-oat-50 to-harvest-50 flex items-center justify-center">
                        <Wrench className="w-16 h-16 text-sage-300" />
                    </div>
                )}

                <h1 className="heading-serif text-4xl lg:text-5xl mb-6">{service.title}</h1>
                {service.description && (
                    <p className="text-stone-600 text-lg leading-relaxed mb-10">{service.description}</p>
                )}

                <div className="flex flex-wrap gap-4 mb-12">
                    <Link to="/iletisim" className="btn-organic">Hizmet Talep Et</Link>
                    <Link to="/urunler" className="btn-ghost-sage">İlgili Cihazlar</Link>
                </div>

                {service.content && (
                    <div className="pt-8 border-t border-stone-200">
                        <TiptapRenderer content={service.content} />
                    </div>
                )}
            </div>
        </div>
    )
}
