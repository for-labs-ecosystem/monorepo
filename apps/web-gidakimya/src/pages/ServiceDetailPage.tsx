import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Wrench, ArrowRight } from 'lucide-react'
import { useService, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import type { Service } from '@forlabs/shared'

export default function ServiceDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useService(slug!)
    const service = data?.data as Service | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <Wrench className="w-12 h-12 text-azure-200 mx-auto mb-6" />
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Hizmet Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-8 font-light">Aradığınız hizmet mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/hizmetler" className="inline-flex items-center gap-2 text-[13px] font-semibold text-azure-500 hover:text-azure-600 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Hizmetlere Dön
                </Link>
            </div>
        )
    }

    return (
        <>
            <title>{service.meta_title || service.title} — GıdaKimya</title>
            {service.meta_description && <meta name="description" content={service.meta_description} />}
            {service.canonical_url && <link rel="canonical" href={service.canonical_url} />}

            <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12 lg:py-16">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-azure-500 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <Link to="/hizmetler" className="hover:text-azure-500 transition-colors">Hizmetler</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-slate-500 truncate max-w-[200px]">{service.title}</span>
                </nav>

                {/* Header */}
                <header className="mb-12">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-lab-500 uppercase tracking-[0.2em] mb-4">
                        <Wrench className="w-3.5 h-3.5" />
                        Profesyonel Hizmet
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight tracking-tight">{service.title}</h1>
                    {service.description && (
                        <p className="mt-5 text-lg text-slate-400 leading-relaxed font-light max-w-3xl">{service.description}</p>
                    )}
                </header>

                {/* Cover */}
                {service.image_url && (
                    <div className="mb-14 overflow-hidden rounded-[2rem] border border-azure-100/20">
                        <img
                            src={resolveMediaUrl(service.image_url)}
                            alt={service.title}
                            className="w-full h-48 sm:h-56 md:h-80 object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                {service.content ? (
                    <div className="prose prose-slate max-w-none prose-lg prose-img:rounded-3xl prose-headings:text-slate-700">
                        <TiptapRenderer content={service.content} />
                    </div>
                ) : (
                    <p className="text-slate-400 italic font-light">Bu hizmetin henüz detaylı içeriği bulunmuyor.</p>
                )}

                {/* CTA */}
                <div className="mt-20 bento-card-filled p-10 lg:p-14 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Bu Hizmetle İlgileniyor Musunuz?</h2>
                    <p className="text-azure-100/80 mb-8 max-w-xl mx-auto leading-relaxed font-light">
                        Uzman ekibimizle iletişime geçin, ihtiyaçlarınıza özel çözüm önerileri alalım.
                    </p>
                    <Link
                        to="/iletisim"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-azure-700 font-bold text-sm rounded-full hover:bg-azure-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        İletişime Geçin <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Bottom nav */}
                <div className="mt-14 flex justify-between items-center">
                    <Link to="/hizmetler" className="inline-flex items-center gap-2 text-[13px] font-semibold text-azure-500 hover:text-azure-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Tüm Hizmetler
                    </Link>
                </div>
            </div>
        </>
    )
}
