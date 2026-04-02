import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronRight,
    FlaskConical,
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
                    // Try to catch stringified objects that look like JSON
                    if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
                        return JSON.parse(val)
                    }
                    return val // Return as-is if it's just a string (could be HTML)
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
                <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-sm font-medium animate-pulse">Ürün Bilgileri Yükleniyor...</span>
            </div>
        )
    }

    if (error || !product || !parsedData) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-6">
                    <Info className="w-8 h-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-3">Ürün Bulunamadı</h1>
                <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Aradığınız ürün mevcut değil, ismi değişmiş veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Ürün Kataloğuna Dön
                </Link>
            </div>
        )
    }

    const { specs, features, gallery, applicationAreas, tags, complianceTags, analysisTypes } = parsedData
    const allImages = gallery.length > 0 ? gallery : (product.image_url ? [product.image_url] : [])

    // Helper for rendering specifications that could be HTML or JSON
    const renderSmartSpecs = (data: any) => {
        if (!data) return null;
        
        // If it's a valid object/array (not HTML string)
        if (typeof data === 'object' && !Array.isArray(data)) {
            return (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-sm">
                    {Object.entries(data).map(([key, value], i) => (
                        <div key={key} className={`flex flex-col px-6 py-4 gap-1 ${i !== Object.keys(data).length - 1 ? 'border-b border-slate-50' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                            <span className="font-black text-slate-900">{String(value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        
        // If it's HTML string
        if (typeof data === 'string' && (data.includes('<') || data.includes('&'))) {
            return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: data }} />;
        }
        
        // Fallback string render
        return <p className="text-slate-600 font-medium">{String(data)}</p>;
    };

    return (
        <div className="min-h-screen bg-white">
            <title>{product.meta_title || product.title} — Alerjen TEST KİTLERİ</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
                {/* ─── Breadcrumb ─── */}
                <nav className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                    <Link to="/urunler" className="hover:text-primary-600 transition-colors">Ürünler</Link>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                    <span className="text-slate-800 truncate max-w-[200px]">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* ─── Gallery (Left) ─── */}
                    <div className="lg:col-span-7 xl:col-span-6 space-y-6">
                        <div className="group relative bg-[#F8FAFC] rounded-[40px] border border-slate-100/50 p-8 md:p-16 aspect-square flex items-center justify-center overflow-hidden">
                            {/* Badges Overlay */}
                            <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
                                {product.is_featured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-accent-500/20">
                                        <Zap className="w-3 h-3" />
                                        Öne Çıkan
                                    </span>
                                )}
                                {product.campaign_label && (
                                    <span className="inline-flex px-3 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary-600/20">
                                        {product.campaign_label}
                                    </span>
                                )}
                            </div>

                            {allImages.length > 0 ? (
                                <img
                                    src={resolveMediaUrl(allImages[currentImageIndex])}
                                    alt={product.title}
                                    className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <FlaskConical className="w-32 h-32 text-slate-200" />
                            )}
                            
                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all text-slate-800"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i + 1) % allImages.length)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all text-slate-800"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
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
                                        className={`group relative flex-shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                                            idx === currentImageIndex
                                                ? 'border-primary-500 ring-4 ring-primary-500/10'
                                                : 'border-slate-100 hover:border-slate-300 bg-slate-50'
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
                            <div className="space-y-4">
                                {product.brand && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                        <Layers className="w-3 h-3 text-primary-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{product.brand}</span>
                                    </div>
                                )}
                                
                                <h1 className="text-4xl xl:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                    {product.title}
                                </h1>

                                {product.model_number && (
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-slate-400" />
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">
                                            Model: <span className="text-slate-900 font-bold">{product.model_number}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {product.description && (
                                <div 
                                    className="text-lg text-slate-600 leading-relaxed max-w-xl prose prose-slate"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            )}

                            {/* Key Performance Indicators (Custom Metadata) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-8 border-y border-slate-100">
                                {product.unit && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PAKETLEME</span>
                                        <p className="text-sm font-black text-slate-800">{product.unit}</p>
                                    </div>
                                )}
                                {product.warranty_period && (
                                    <div className="space-y-1.5 border-l border-slate-100 pl-6">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GARANTİ</span>
                                        <p className="text-sm font-black text-slate-800">{product.warranty_period}</p>
                                    </div>
                                )}
                                {product.automation_level && (
                                    <div className="space-y-1.5 border-l border-slate-100 pl-6">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">OTOMASYON</span>
                                        <p className="text-sm font-black text-slate-800 uppercase">{product.automation_level}</p>
                                    </div>
                                )}
                            </div>

                            {/* Features Checklist */}
                            {features.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary-500" />
                                        Öne Çıkan Özellikler
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                        {features.map((feat: any, i: number) => {
                                            const label = typeof feat === 'object' ? feat.key : feat;
                                            const val = typeof feat === 'object' ? feat.value : '';
                                            return (
                                                <div key={i} className="flex flex-col gap-0.5 text-sm font-medium text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-200 shrink-0" />
                                                        <span className="font-bold text-slate-800">{String(label)}</span>
                                                    </div>
                                                    {val && <span className="pl-3.5 text-xs text-slate-500">{String(val)}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Compliance & Analysis Badges */}
                            {(complianceTags.length > 0 || analysisTypes.length > 0) && (
                                <div className="flex flex-wrap gap-3">
                                    {analysisTypes.map((type: any, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-[10px] font-bold uppercase tracking-wider ring-1 ring-primary-100">
                                            <Thermometer className="w-3.5 h-3.5" />
                                            {typeof type === 'string' ? type : String(type)}
                                        </span>
                                    ))}
                                    {complianceTags.map((tag: any, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider ring-1 ring-slate-100">
                                            <Shield className="w-3.5 h-3.5" />
                                            {typeof tag === 'string' ? tag : String(tag)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 !mt-12">
                                <button
                                    onClick={() => setQuoteOpen(true)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-accent-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-accent-500/20 hover:bg-accent-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-widest"
                                >
                                    Fiyat Teklifi Al
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white border border-slate-200 px-7 py-4 text-sm font-black text-slate-800 shadow-sm hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-widest"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>

                            {/* Extra Info Icons */}
                            <div className="flex items-center justify-between pt-8 opacity-60">
                                {product.sku && (
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
                                        <Package className="w-3.5 h-3.5" />
                                        SKU: {product.sku}
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-px h-6 bg-slate-100" />
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">TÜRKİYE DİSTRİBÜTÖRÜ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Rich Content & Details (Bottom) ─── */}
                <div className="mt-24 lg:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    <div className="lg:col-span-8 space-y-16">
                        {/* Dynamic Rich Content (TipTap & HTML Specs) */}
                        {(product.content || specs) && (
                            <section className="space-y-8">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-primary-500" />
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Ürün Detayları</h2>
                                </div>
                                <div className="prose prose-slate max-w-none prose-img:rounded-3xl prose-headings:text-slate-900">
                                    {product.content && <TiptapRenderer content={product.content} />}
                                    {specs && renderSmartSpecs(specs)}
                                </div>
                            </section>
                        )}

                        {/* Application Areas Section */}
                        {applicationAreas.length > 0 && (
                            <section className="space-y-8">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-primary-500" />
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Kullanım Alanları</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {applicationAreas.map((area: any, i: number) => (
                                        <div key={i} className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-800">{String(area)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Technical Specs & Tags */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Technical Data Sidebar - Using features as key-value pairs */}
                        {features.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] px-2">Teknik Veriler</h3>
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-sm">
                                    {features.map((feat: any, i: number) => {
                                        const label = typeof feat === 'object' ? feat.key : `Özellik ${i+1}`;
                                        const value = typeof feat === 'object' ? feat.value : feat;
                                        if (!label || !value) return null;
                                        return (
                                            <div key={i} className={`flex flex-col px-6 py-4 gap-1 ${i !== features.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(label).replace(/_/g, ' ')}</span>
                                                <span className="font-black text-slate-900">
                                                    {typeof value === 'string' ? value : String(value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tags Sidebar */}
                        {tags.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] px-2">Etiket Arşivi</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string, i: number) => (
                                        <Link
                                            key={i}
                                            to={`/urunler?tag=${encodeURIComponent(tag)}`}
                                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 transition-all duration-300"
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
