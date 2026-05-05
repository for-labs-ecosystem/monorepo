import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '@forlabs/core'
import type { Service } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'
import {
    ChevronRight,
    Search,
    X,
    SlidersHorizontal,
    Beaker,
    Settings,
    ClipboardCheck,
    GraduationCap,
    Shield,
    Sparkles,
    ArrowRight,
    Phone,
} from 'lucide-react'

// ─── Service type labels & icons ─────────────────────────────────────────────

const SERVICE_TYPES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    analysis: { label: 'Analiz & Test', icon: <Beaker className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    setup: { label: 'Kurulum', icon: <Settings className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    audit: { label: 'Denetim', icon: <ClipboardCheck className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    consulting: { label: 'Danışmanlık', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    training: { label: 'Eğitim', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
    const typeInfo = service.service_type ? SERVICE_TYPES[service.service_type] : null

    return (
        <Link
            to={`/hizmetler/${service.slug}`}
            className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 md:h-[260px] lg:h-[280px]"
        >
            {/* Image */}
            <div className="w-full md:w-[40%] lg:w-[35%] aspect-[16/10] md:aspect-auto h-full bg-slate-50 overflow-hidden relative shrink-0">
                {Boolean(service.is_featured) && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                            <Sparkles className="w-3 h-3" />
                            Öne Çıkan
                        </div>
                    </div>
                )}
                {typeInfo && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md bg-white/90 ${typeInfo.color.replace('bg-', 'text-').split(' ')[1]} ${typeInfo.color.split(' ')[2]}`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                        </div>
                    </div>
                )}
                <img
                    src={getImageUrl(service.image_url)}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col flex-1 h-full">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        {typeInfo && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${typeInfo.color}`}>
                                {typeInfo.label}
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug line-clamp-2 mb-3">
                        {service.title}
                    </h3>
                    {service.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 lg:line-clamp-3 leading-relaxed">
                            {service.description}
                        </p>
                    )}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                    {service.price != null ? (
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Başlangıç fiyatı</p>
                            <p className="text-xl font-black text-primary-700 tabular-nums leading-none">
                                {service.price.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-400">{service.currency || 'TRY'}</span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-1">Fiyat bilgisi için</p>
                            <p className="text-sm font-bold text-primary-600 leading-none">Teklif Alın</p>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400 group-hover:text-primary-600 transition-colors hidden sm:block">Detayları İncele</span>
                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shrink-0">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function TypeFilterButton({
    label,
    icon,
    isActive,
    onClick,
}: {
    label: string
    icon: React.ReactNode
    isActive: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 border ${
                isActive
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ServicesPage() {
    const [search, setSearch] = useState('')
    const [activeType, setActiveType] = useState<string>('')

    const { data: servicesData, isLoading } = useServices()

    const allServices = (servicesData?.data ?? []) as Service[]

    const filteredServices = useMemo(() => {
        let result = allServices
        if (activeType) {
            result = result.filter((s) => s.service_type === activeType)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(
                (s) =>
                    s.title?.toLowerCase().includes(q) ||
                    s.description?.toLowerCase().includes(q)
            )
        }
        return result
    }, [allServices, activeType, search])

    const featuredServices = useMemo(
        () => allServices.filter((s) => Boolean(s.is_featured)),
        [allServices]
    )

    const availableTypes = useMemo(() => {
        const types = new Set(allServices.map((s) => s.service_type).filter(Boolean))
        return [...types] as string[]
    }, [allServices])

    return (
        <div className="bg-slate-50 min-h-screen">
            <title>Hizmetler — Atago TR</title>
            {/* ── Hero Section (Floating Style) ── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
                <section className="relative bg-primary-900 rounded-4xl text-white overflow-hidden shadow-2xl shadow-primary-900/20 group">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[40px] border-white/[0.02] blur-sm" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[30px] border-white/[0.03] blur-md" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-[20px] border-white/[0.05] blur-lg" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800/80 via-transparent to-transparent" />
                    </div>
                    
                    <div className="px-6 sm:px-12 lg:px-16 py-12 sm:py-16 relative z-10">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
                            <Link to="/" className="hover:text-white transition-colors">Anasayfa</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white/90">Hizmetler</span>
                        </div>
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
                            <div className="max-w-3xl">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                    Profesyonel Laboratuvar<br />
                                    <span className="text-primary-300">Hizmetleri</span>
                                </h1>
                                <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                                    Analiz, kurulum, kalibrasyon, denetim ve eğitim hizmetlerimizle laboratuvarınızı
                                    uluslararası standartlarda çalışır hale getiriyoruz.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
                                    <a 
                                        href="https://wa.me/905320000000" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-xl shadow-green-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>WhatsApp'tan Yazın</span>
                                    </a>
                                    <Link 
                                        to="/destek"
                                        className="group w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                                    >
                                        <span>Teklif Alın</span>
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative hidden h-[240px] lg:block">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-[200px] w-[340px]">
                                        {/* Arkaplan halkaları - Daha küçük ve ayrık */}
                                        <div className="absolute left-6 top-6 h-28 w-28 rounded-full border border-white/10 bg-white/6 blur-3xl animate-pulse" />
                                        <div className="absolute right-8 top-4 h-16 w-16 rounded-full bg-cyan-300/10 blur-2xl animate-pulse" />

                                        {/* Sol proses kartı - Eskiden anlamsız büyük ikondu, şimdi süreci anlatan yatay dekoratif kart */}
                                        <div className="absolute left-0 top-14 flex w-44 flex-col gap-2.5 rounded-[1.25rem] border border-white/10 bg-white/8 p-3.5 backdrop-blur-md shadow-lg shadow-slate-950/10 transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1.5deg] group-hover:bg-white/12">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200">
                                                    <Beaker className="h-3.5 w-3.5" />
                                                </div>
                                                <p className="text-[10px] font-bold text-white">1. Analiz Testi</p>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                                <div className="h-full w-3/4 rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Sağ üst bilgi kartı - Daha ufak, daha sağda ve üstte */}
                                        <div className="absolute right-0 top-0 z-10 w-52 rounded-[1.5rem] border border-white/10 bg-white/9 p-3.5 shadow-xl shadow-slate-950/15 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:bg-white/12">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary-200/90">Hizmet Akışı</p>
                                                    <p className="mt-1 text-xs font-bold leading-snug text-white">Kurulum,<br />Kalibrasyon</p>
                                                </div>
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12 text-primary-100 transition-transform duration-300 group-hover:scale-105">
                                                    <Settings className="h-3.5 w-3.5 animate-[spin_8s_linear_infinite]" />
                                                </div>
                                            </div>
                                            <div className="mt-3.5 space-y-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/80">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                                    Analiz planı
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/10">
                                                    <div className="h-1.5 w-[68%] rounded-full bg-linear-to-r from-cyan-300 to-primary-200 transition-all duration-700 group-hover:w-[78%]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sağ alt kart - Daha ufak, daha solda */}
                                        <div className="absolute bottom-4 right-10 z-20 w-48 rounded-[1.25rem] border border-white/10 bg-white/8 px-3.5 py-2.5 backdrop-blur-md shadow-lg shadow-slate-950/10 transition-all duration-500 group-hover:translate-y-0.5 group-hover:bg-white/12">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-emerald-300/15 text-emerald-200 transition-transform duration-300 group-hover:scale-105">
                                                    <ClipboardCheck className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200/90 truncate">Saha Desteği</p>
                                                    <p className="mt-0.5 text-xs font-semibold text-white truncate">Eğitim ve tam destek</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── Featured Services ── */}
            {featuredServices.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredServices.slice(0, 3).map((service) => (
                            <Link
                                key={service.id}
                                to={`/hizmetler/${service.slug}`}
                                className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                                    {service.service_type && SERVICE_TYPES[service.service_type]
                                        ? SERVICE_TYPES[service.service_type].icon
                                        : <Beaker className="w-5 h-5 text-primary-600" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                                        {service.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 shrink-0 mt-1 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Filter & Search Bar ── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Tüm Hizmetlerimiz</h2>
                        <p className="text-sm text-slate-400 mt-1">{filteredServices.length} hizmet listeleniyor</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Hizmet ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 shadow-sm transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Type filters */}
                {availableTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <TypeFilterButton
                            label="Tümü"
                            icon={<SlidersHorizontal className="w-4 h-4" />}
                            isActive={activeType === ''}
                            onClick={() => setActiveType('')}
                        />
                        {availableTypes.map((type) => {
                            const info = SERVICE_TYPES[type]
                            return (
                                <TypeFilterButton
                                    key={type}
                                    label={info?.label ?? type}
                                    icon={info?.icon ?? <Beaker className="w-4 h-4" />}
                                    isActive={activeType === type}
                                    onClick={() => setActiveType(activeType === type ? '' : type)}
                                />
                            )
                        })}
                    </div>
                )}

                {/* ── Services Grid ── */}
                {isLoading ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
                                <div className="w-full md:w-2/5 aspect-16/10 md:aspect-auto md:min-h-[240px] bg-slate-100 shrink-0" />
                                <div className="p-6 md:p-8 flex flex-col flex-1 space-y-4">
                                    <div className="h-4 bg-slate-100 rounded-lg w-20" />
                                    <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 bg-slate-100 rounded-lg w-full" />
                                        <div className="h-3 bg-slate-100 rounded-lg w-full" />
                                        <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <div className="h-8 bg-slate-100 rounded-lg w-24" />
                                        <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <Search className="w-7 h-7 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Hizmet bulunamadı</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                            Aradığınız kriterlere uygun hizmet bulunamadı. Filtrelerinizi değiştirmeyi deneyin.
                        </p>
                        {(search || activeType) && (
                            <button
                                onClick={() => { setSearch(''); setActiveType('') }}
                                className="mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-primary-700 transition-colors"
                            >
                                Filtreleri Temizle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── CTA Section ── */}
            <section className="bg-white border-t border-slate-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                Özel hizmet ihtiyacınız mı var?
                            </h2>
                            <p className="text-slate-400 mt-3 text-base leading-relaxed max-w-lg">
                                Laboratuvarınıza özel çözümler üretiyoruz. Uzman ekibimizle iletişime geçin,
                                ihtiyaçlarınıza uygun bir proje teklifi hazırlayalım.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <a
                                href="https://wa.me/905320000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-green-700 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                WhatsApp ile İletişim
                            </a>
                            <Link
                                to="/destek"
                                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-white/20 transition-colors"
                            >
                                Teklif Formu
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
