import { Link } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'
import { useServices } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Service } from '@forlabs/shared'

export default function ServicesPage() {
    const { data: servicesData, isLoading } = useServices()
    const services = (servicesData?.data ?? []) as Service[]

    return (
        <>
            <title>Hizmetler — GıdaKimya</title>
            <meta name="description" content="Gıda analiz cihazı kurulum, kalibrasyon, eğitim ve teknik danışmanlık hizmetleri." />

            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
                {/* Page Header */}
                <div className="mb-14">
                    <span className="text-[11px] font-semibold text-azure-500 uppercase tracking-[0.2em]">Hizmetlerimiz</span>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Profesyonel Hizmetler</h1>
                    <p className="mt-4 text-slate-400 max-w-lg leading-relaxed">
                        Cihaz kurulumundan kalibrasyona, eğitimden teknik danışmanlığa kadar kapsamlı hizmet desteği.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[340px] bento-card animate-pulse !bg-azure-50/20" />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20">
                        <Wrench className="w-14 h-14 text-azure-100 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-500 mb-2">Henüz Hizmet Yok</h3>
                        <p className="text-sm text-slate-400">Hizmetlerimiz kısa sürede eklenecektir.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {services.map((service) => (
                            <Link
                                key={service.id}
                                to={`/hizmetler/${service.slug}`}
                                className="group flex flex-col bento-card overflow-hidden"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 flex-shrink-0">
                                    {service.image_url ? (
                                        <img
                                            src={getImageUrl(service.image_url)}
                                            alt={service.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-azure-50 to-lab-50 flex items-center justify-center">
                                            <Wrench className="w-10 h-10 text-azure-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="bg-white/80 backdrop-blur-md text-lab-600 px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm">
                                            Hizmet
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7 flex flex-col flex-1">
                                    <h3 className="text-[16px] font-bold text-slate-700 leading-snug line-clamp-2 group-hover:text-azure-600 transition-colors duration-300">
                                        {service.title}
                                    </h3>
                                    {service.description && (
                                        <p className="mt-2.5 text-[12.5px] text-slate-400 leading-relaxed line-clamp-3">
                                            {service.description}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-6">
                                        <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-azure-500 group-hover:gap-2 transition-all duration-300">
                                            Detaylı Bilgi <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
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
