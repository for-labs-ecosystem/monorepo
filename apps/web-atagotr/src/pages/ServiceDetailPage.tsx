import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useService } from '@forlabs/core'
import type { Service } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'
import {
    ChevronRight,
    Beaker,
    Settings,
    ClipboardCheck,
    GraduationCap,
    Shield,
    Phone,
    Mail,
    ArrowRight,
    Clock,
    CheckCircle2,
    Share2,
} from 'lucide-react'

const SERVICE_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    analysis: { label: 'Analiz & Test', icon: <Beaker className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    setup: { label: 'Kurulum', icon: <Settings className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    audit: { label: 'Denetim', icon: <ClipboardCheck className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    consulting: { label: 'Danışmanlık', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    training: { label: 'Eğitim', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
}

function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false)

    const handleShare = useCallback(async () => {
        const url = window.location.href
        if (navigator.share) {
            try { await navigator.share({ title, url }) } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [title])

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-primary-200 hover:text-primary-600"
        >
            <Share2 className="h-3.5 w-3.5" />
            {copied ? 'Kopyalandı!' : 'Paylaş'}
        </button>
    )
}

export default function ServiceDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading } = useService(slug ?? '')

    const service = data?.data as Service | undefined

    if (isLoading) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 bg-slate-200 rounded w-48" />
                        <div className="h-10 bg-slate-200 rounded w-2/3" />
                        <div className="h-80 bg-slate-200 rounded-3xl" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-5/6" />
                            <div className="h-4 bg-slate-200 rounded w-4/6" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Beaker className="w-7 h-7 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700">Hizmet Bulunamadı</h2>
                    <p className="text-sm text-slate-400 mt-1">Aradığınız hizmet mevcut değil veya kaldırılmış olabilir.</p>
                    <Link
                        to="/hizmetler"
                        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-primary-700 transition-colors"
                    >
                        Tüm Hizmetler
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    const typeInfo = service.service_type ? SERVICE_TYPE_META[service.service_type] : null
    let galleryImages: string[] = []
    try {
        galleryImages = service.gallery ? JSON.parse(service.gallery) : []
    } catch {
        galleryImages = []
    }

    let specsList: Array<{ key: string; value: string }> = []
    try {
        if (service.specs) {
            const parsed = JSON.parse(service.specs)
            if (Array.isArray(parsed)) {
                specsList = parsed
            }
        }
    } catch {
        // specs is HTML content, will render as HTML
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* ── Breadcrumb ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/hizmetler" className="hover:text-primary-600 transition-colors">Hizmetler</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 truncate max-w-xs">{service.title}</span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & badges */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {typeInfo && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.color}`}>
                                        {typeInfo.icon}
                                        {typeInfo.label}
                                    </span>
                                )}
                                {Boolean(service.is_featured) && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Öne Çıkan Hizmet
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                                {service.title}
                            </h1>
                            {service.description && (
                                <p className="text-base text-slate-500 mt-3 leading-relaxed">
                                    {service.description}
                                </p>
                            )}
                        </div>

                        {/* Hero image */}
                        {service.image_url && (
                            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                <img
                                    src={getImageUrl(service.image_url)}
                                    alt={service.title}
                                    className="w-full object-cover max-h-96"
                                />
                            </div>
                        )}

                        {/* Content */}
                        {service.content && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Hizmet Detayı</h2>
                                <div
                                    className="prose prose-slate prose-sm max-w-none
                                        prose-headings:font-bold prose-headings:text-slate-900
                                        prose-p:text-slate-600 prose-p:leading-relaxed
                                        prose-li:text-slate-600
                                        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline"
                                    dangerouslySetInnerHTML={{ __html: service.content }}
                                />
                            </div>
                        )}

                        {/* Specs */}
                        {service.specs && specsList.length === 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Teknik Bilgiler</h2>
                                <div
                                    className="prose prose-slate prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: service.specs }}
                                />
                            </div>
                        )}

                        {specsList.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Teknik Bilgiler</h2>
                                <div className="divide-y divide-slate-100">
                                    {specsList.map((spec, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 text-sm">
                                            <span className="text-slate-500 font-medium">{spec.key}</span>
                                            <span className="text-slate-900 font-semibold">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery */}
                        {galleryImages.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Galeri</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${service.title} - ${i + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                to="/hizmetler"
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700"
                            >
                                ← Tüm Hizmetlere Dön
                            </Link>
                            <ShareButton title={service.title} />
                        </div>
                        {/* Price card */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-28">
                            {service.price != null ? (
                                <div className="mb-5">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hizmet Bedeli</p>
                                    <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
                                        {service.price.toLocaleString('tr-TR')}
                                        <span className="text-base font-bold text-slate-400 ml-1">{service.currency || 'TRY'}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">KDV dahil değildir</p>
                                </div>
                            ) : (
                                <div className="mb-5">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fiyatlandırma</p>
                                    <p className="text-lg font-bold text-slate-700 mt-1">Proje bazlı fiyatlandırma</p>
                                    <p className="text-xs text-slate-400 mt-1">Detaylar için bizimle iletişime geçin</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md hover:bg-green-700 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    WhatsApp ile Teklif Al
                                </a>
                                <a
                                    href="mailto:info@atagotr.com"
                                    className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    E-posta Gönder
                                </a>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Sertifikalı Hizmet</p>
                                        <p className="text-xs text-slate-400">ISO standartlarına uygun</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Hızlı Geri Dönüş</p>
                                        <p className="text-xs text-slate-400">24 saat içinde teklif</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                                        <Shield className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Garanti Kapsamında</p>
                                        <p className="text-xs text-slate-400">Hizmet sonrası destek</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
