import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getServices } from '@forlabs/core'
import { ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface ServiceItem {
    id: number
    slug: string
    title: string
    short_description: string | null
    image_url: string | null
    is_featured: boolean | number
}

export default function ServicesPage() {
    const { data: servicesRes, isLoading } = useQuery({
        queryKey: ['services', SITE_ID],
        queryFn: () => getServices({}),
        staleTime: 3 * 60 * 1000,
    })

    const services = (servicesRes?.data ?? []) as unknown as ServiceItem[]

    return (
        <>
            <title>Hizmetlerimiz — Lab Kurulum</title>
            <meta name="description" content="Anahtar teslim laboratuvar kurulum, ekipman entegrasyonu, eğitim ve akreditasyon danışmanlığı hizmetleri." />

            {/* Page header */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">// Hizmetler</span>
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">Hizmetlerimiz</h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl">
                        Laboratuvar kurulumundan akreditasyona kadar uçtan uca mühendislik hizmetleri sunuyoruz.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && services.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-slate-400">Henüz hizmet kaydı bulunmuyor.</p>
                    </div>
                )}

                {!isLoading && services.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {services.map((svc) => (
                            <Link
                                key={svc.id}
                                to={`/hizmetler/${svc.slug}`}
                                className="group border border-slate-200 rounded-md bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                            >
                                {svc.image_url ? (
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                        <img
                                            src={getImageUrl(svc.image_url)}
                                            alt={svc.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[16/10] bg-blueprint-grid-heavy flex items-center justify-center">
                                        <span className="font-mono text-sm text-brand-300">SVC-{String(svc.id).padStart(3, '0')}</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-base font-bold text-brand-900 group-hover:text-brand-600 transition-colors">
                                        {svc.title}
                                    </h3>
                                    {svc.short_description && (
                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                                            {svc.short_description}
                                        </p>
                                    )}
                                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                                        Detayları Gör <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
