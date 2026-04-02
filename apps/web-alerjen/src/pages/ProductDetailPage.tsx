import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronRight,
    Leaf,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Package,
    Shield,
    CheckCircle2,
    Info,
    Layers,
    Settings2,
    Thermometer,
    Activity,
    ExternalLink,
    Zap
} from 'lucide-react'
import { useProduct, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import QuoteModal from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useProduct(slug!)
    const product = data?.data as Product | undefined

    const [quoteOpen, setQuoteOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Parse JSON fields
    const parsedData = useMemo(() => {
        if (!product) return null

        const parseJson = (val: any, fallback: any = []) => {
            if (!val) return fallback
            if (typeof val === 'object') return val
            try {
                if (typeof val === 'string') {
                    if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
                        return JSON.parse(val)
                    }
                    return val
                }
            } catch { /* ignore */ }
            return val || fallback
        }

        return {
            specs: parseJson(product.specs, null),
            features: parseJson(product.features),
            gallery: parseJson(product.gallery),
            applicationAreas: parseJson(product.application_areas),
            tags: parseJson(product.tags),
            complianceTags: parseJson(product.compliance_tags),
            analysisTypes: parseJson(product.analysis_types)
        }
    }, [product])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-sm font-light animate-pulse">Ürün Bilgileri Yükleniyor...</span>
            </div>
        )
    }

    if (error || !product || !parsedData) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ocean-50/50 mb-6">
                    <Info className="w-8 h-8 text-ocean-300" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Ürün Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto font-light">Aradığınız ürün mevcut değil, ismi değişmiş veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="inline-flex items-center gap-2 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300">
                    <ChevronLeft className="w-4 h-4" />
                    Ürün Kataloğuna Dön
                </Link>
            </div>
        )
    }

    const { specs, features, gallery, applicationAreas, tags, complianceTags, analysisTypes } = parsedData
    const allImages = gallery.length > 0 ? gallery : (product.image_url ? [product.image_url] : [])

    const renderSmartSpecs = (data: any) => {
        if (!data) return null;

        if (typeof data === 'object' && !Array.isArray(data)) {
            return (
                <div className="pebble-card overflow-hidden text-sm">
                    {Object.entries(data).map(([key, value], i) => (
                        <div key={key} className={`flex flex-col px-7 py-5 gap-1 ${i !== Object.keys(data).length - 1 ? 'border-b border-ocean-100/20' : ''}`}>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-slate-600">{String(value)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof data === 'string' && (data.includes('<') || data.includes('&'))) {
            return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: data }} />;
        }

        return <p className="text-slate-500 font-medium">{String(data)}</p>;
    };

    return (
        <div className="min-h-screen">
            <title>{product.meta_title || product.title} — Alerjen TEST KİTLERİ</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                {/* ─── Breadcrumb ─── */}
                <nav className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <Link to="/urunler" className="hover:text-ocean-500 transition-colors duration-300">Ürünler</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-slate-500 truncate max-w-[200px]">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* ─── Gallery (Left) ─── */}
                    <div className="lg:col-span-7 xl:col-span-6 space-y-6">
                        <div className="group relative bg-gradient-to-br from-mint-50/40 to-ocean-50/20 rounded-[36px] border border-ocean-100/20 p-8 md:p-16 aspect-square flex items-center justify-center overflow-hidden">
                            {/* Badges Overlay */}
                            <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
                                {product.is_featured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-coral-500 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-md shadow-coral-500/15">
                                        <Zap className="w-3 h-3" />
                                        Öne Çıkan
                                    </span>
                                )}
                                {product.campaign_label && (
                                    <span className="inline-flex px-3 py-1.5 bg-ocean-500 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-md shadow-ocean-500/15">
                                        {product.campaign_label}
                                    </span>
                                )}
                            </div>

                            {allImages.length > 0 ? (
                                <img
                                    src={resolveMediaUrl(allImages[currentImageIndex])}
                                    alt={product.title}
                                    className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            ) : (
                                <Leaf className="w-32 h-32 text-ocean-100" />
                            )}

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 text-slate-500"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i + 1) % allImages.length)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 text-slate-500"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                                {allImages.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`group relative flex-shrink-0 w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${idx === currentImageIndex
                                            ? 'border-ocean-400 ring-4 ring-ocean-400/10'
                                            : 'border-ocean-100/30 hover:border-ocean-200 bg-ocean-50/20'
                                            }`}
                                    >
                                        <img
                                            src={resolveMediaUrl(img)}
                                            alt={`${product.title} ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Info (Right) ─── */}
                    <div className="lg:col-span-5 xl:col-span-6">
                        <div className="sticky top-12 space-y-8">
                            <div className="space-y-5">
                                {product.brand && (
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-ocean-50/40 border border-ocean-100/30 rounded-xl">
                                        <Layers className="w-3 h-3 text-ocean-400" />
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">{product.brand}</span>
                                    </div>
                                )}

                                <h1 className="text-3xl xl:text-4xl font-bold text-slate-600 leading-[1.15] tracking-tight">
                                    {product.title}
                                </h1>

                                {product.model_number && (
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-slate-300" />
                                        <p className="text-sm text-slate-400 font-light tracking-wide">
                                            Model: <span className="text-slate-500 font-medium">{product.model_number}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {product.description && (
                                <div
                                    className="text-base text-slate-400 leading-relaxed max-w-xl prose prose-slate font-light"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            )}

                            {/* Key Performance Indicators */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-8 border-y border-ocean-100/20">
                                {product.unit && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">PAKETLEME</span>
                                        <p className="text-sm font-semibold text-slate-600">{product.unit}</p>
                                    </div>
                                )}
                                {product.warranty_period && (
                                    <div className="space-y-2 border-l border-ocean-100/20 pl-6">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">GARANTİ</span>
                                        <p className="text-sm font-semibold text-slate-600">{product.warranty_period}</p>
                                    </div>
                                )}
                                {product.automation_level && (
                                    <div className="space-y-2 border-l border-ocean-100/20 pl-6">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">OTOMASYON</span>
                                        <p className="text-sm font-semibold text-slate-600 uppercase">{product.automation_level}</p>
                                    </div>
                                )}
                            </div>

                            {/* Features Checklist */}
                            {features.length > 0 && (
                                <div className="space-y-5">
                                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-ocean-400" />
                                        Öne Çıkan Özellikler
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                                        {features.map((feat: any, i: number) => {
                                            const label = typeof feat === 'object' ? feat.key : feat;
                                            const val = typeof feat === 'object' ? feat.value : '';
                                            return (
                                                <div key={i} className="flex flex-col gap-0.5 text-sm font-light text-slate-400">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-ocean-300 shrink-0" />
                                                        <span className="font-medium text-slate-600">{String(label)}</span>
                                                    </div>
                                                    {val && <span className="pl-4 text-xs text-slate-400">{String(val)}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Compliance & Analysis Badges */}
                            {(complianceTags.length > 0 || analysisTypes.length > 0) && (
                                <div className="flex flex-wrap gap-2.5">
                                    {analysisTypes.map((type: any, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ocean-50/50 text-ocean-600 rounded-xl text-[10px] font-semibold uppercase tracking-wider border border-ocean-100/30">
                                            <Thermometer className="w-3.5 h-3.5" />
                                            {typeof type === 'string' ? type : String(type)}
                                        </span>
                                    ))}
                                    {complianceTags.map((tag: any, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50/50 text-slate-500 rounded-xl text-[10px] font-semibold uppercase tracking-wider border border-slate-100/50">
                                            <Shield className="w-3.5 h-3.5" />
                                            {typeof tag === 'string' ? tag : String(tag)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 !mt-14">
                                <button
                                    onClick={() => setQuoteOpen(true)}
                                    className="w-full sm:w-auto btn-warm !px-8 !py-4 uppercase tracking-widest !text-[12px]"
                                >
                                    Fiyat Teklifi Al
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white border-1.5 border-ocean-100/40 px-8 py-4 text-[12px] font-semibold text-slate-500 shadow-sm hover:border-green-300 hover:text-green-600 hover:bg-green-50/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-widest"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>

                            {/* Extra Info */}
                            <div className="flex items-center justify-between pt-8 opacity-50">
                                {product.sku && (
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-medium text-slate-400 tracking-wider">
                                        <Package className="w-3.5 h-3.5" />
                                        SKU: {product.sku}
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-px h-5 bg-ocean-100/30" />
                                    <span className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">TÜRKİYE DİSTRİBÜTÖRÜ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Rich Content & Details (Bottom) ─── */}
                <div className="mt-28 lg:mt-36 grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    <div className="lg:col-span-8 space-y-16">
                        {(product.content || specs) && (
                            <section className="space-y-8">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-ocean-400 to-ocean-300" />
                                    <h2 className="text-lg font-semibold text-slate-600 uppercase tracking-widest">Ürün Detayları</h2>
                                </div>
                                <div className="prose prose-slate max-w-none prose-img:rounded-3xl prose-headings:text-slate-600 prose-headings:font-semibold">
                                    {product.content && <TiptapRenderer content={product.content} />}
                                    {specs && renderSmartSpecs(specs)}
                                </div>
                            </section>
                        )}

                        {applicationAreas.length > 0 && (
                            <section className="space-y-8">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-ocean-400 to-ocean-300" />
                                    <h2 className="text-lg font-semibold text-slate-600 uppercase tracking-widest">Kullanım Alanları</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {applicationAreas.map((area: any, i: number) => (
                                        <div key={i} className="group pebble-card p-6">
                                            <div className="w-10 h-10 rounded-xl bg-ocean-50/50 flex items-center justify-center text-ocean-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-500">{String(area)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Technical Specs & Tags */}
                    <aside className="lg:col-span-4 space-y-12">
                        {features.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] px-2">Teknik Veriler</h3>
                                <div className="pebble-card overflow-hidden text-sm">
                                    {features.map((feat: any, i: number) => {
                                        const label = typeof feat === 'object' ? feat.key : `Özellik ${i + 1}`;
                                        const value = typeof feat === 'object' ? feat.value : feat;
                                        if (!label || !value) return null;
                                        return (
                                            <div key={i} className={`flex flex-col px-7 py-5 gap-1 ${i !== features.length - 1 ? 'border-b border-ocean-100/20' : ''}`}>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{String(label).replace(/_/g, ' ')}</span>
                                                <span className="font-semibold text-slate-600">
                                                    {typeof value === 'string' ? value : String(value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {tags.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] px-2">Etiket Arşivi</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string, i: number) => (
                                        <Link
                                            key={i}
                                            to={`/urunler?tag=${encodeURIComponent(tag)}`}
                                            className="px-4 py-2.5 pebble-card !rounded-xl text-[11px] font-medium text-slate-400 hover:text-ocean-600 hover:border-ocean-200 transition-all duration-300"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* ─── Quote Modal ─── */}
            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                productId={product.id}
                productName={product.title}
            />
        </div>
    )
}
