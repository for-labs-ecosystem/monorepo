import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronLeft, ChevronRight, Package, Shield,
    CheckCircle2, Layers, Settings2, Activity,
    Tag, ArrowRight, Beaker, Info,
} from 'lucide-react'
import { useProduct, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import QuoteModal from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'

/**
 * Safely parse a JSON string or return the value as-is.
 */
function parseJsonSafe(val: unknown): unknown {
    if (val === null || val === undefined) return null
    if (typeof val === 'object') return val
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed) } catch { /* not valid JSON */ }
    }
    return trimmed
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useProduct(slug!)
    const product = data?.data as Product | undefined

    const [quoteOpen, setQuoteOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const parsedData = useMemo(() => {
        if (!product) return null

        const rawSpecs = parseJsonSafe(product.specs)
        const rawFeatures = parseJsonSafe(product.features)
        const rawGallery = parseJsonSafe(product.gallery)
        const rawAppAreas = parseJsonSafe(product.application_areas)
        const rawTags = parseJsonSafe(product.tags)
        const rawCompliance = parseJsonSafe(product.compliance_tags)
        const rawAnalysis = parseJsonSafe(product.analysis_types)

        let specsObj: Record<string, string> | null = null
        let specsHtml: string | null = null
        if (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)) {
            specsObj = rawSpecs as Record<string, string>
        } else if (typeof rawSpecs === 'string') {
            specsHtml = rawSpecs
        }

        return {
            specsObj,
            specsHtml,
            features: (Array.isArray(rawFeatures) ? rawFeatures : []) as Array<{ key: string; value: string } | string>,
            gallery: (Array.isArray(rawGallery) ? rawGallery : []) as string[],
            applicationAreas: (Array.isArray(rawAppAreas) ? rawAppAreas : []) as string[],
            tags: (Array.isArray(rawTags) ? rawTags : []) as string[],
            complianceTags: (Array.isArray(rawCompliance) ? rawCompliance : []) as string[],
            analysisTypes: (Array.isArray(rawAnalysis) ? rawAnalysis : []) as string[],
        }
    }, [product])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-stone-400 text-sm animate-pulse">Ürün bilgileri yükleniyor...</span>
            </div>
        )
    }

    if (error || !product || !parsedData) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-50 mb-6">
                    <Info className="w-8 h-8 text-sage-300" />
                </div>
                <h1 className="heading-serif text-2xl mb-3">Ürün Bulunamadı</h1>
                <p className="text-stone-400 text-sm mb-8 max-w-xs mx-auto">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="btn-organic">
                    <ChevronLeft className="w-4 h-4" /> Ürünlere Dön
                </Link>
            </div>
        )
    }

    const { specsObj, specsHtml, features, gallery, applicationAreas, tags, complianceTags, analysisTypes } = parsedData
    const allImages = gallery.length > 0 ? gallery : (product.image_url ? [product.image_url] : [])

    return (
        <div className="min-h-screen">
            <title>{product.meta_title || product.title} — GıdaTest</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2.5 text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-forest-900 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <Link to="/urunler" className="hover:text-forest-900 transition-colors">Ürünler</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-stone-500 truncate max-w-[200px]">{product.title}</span>
                </nav>

                {/* ─── Hero: Gallery + Product Info ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    {/* Gallery */}
                    <div className="lg:col-span-7 xl:col-span-6 space-y-5">
                        <div
                            className="group relative bg-gradient-to-br from-sage-50/40 via-oat-50 to-harvest-50/30 border border-stone-200/60 p-8 md:p-14 aspect-square flex items-center justify-center overflow-hidden"
                            style={{ borderTopLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}
                        >
                            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                                {product.campaign_label && (
                                    <span
                                        className="inline-flex px-3 py-1.5 bg-harvest-400 text-forest-900 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                        style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                                    >
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
                                <Package className="w-32 h-32 text-sage-200" />
                            )}

                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all text-stone-500" style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setCurrentImageIndex((i) => (i + 1) % allImages.length)} className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all text-stone-500" style={{ borderTopRightRadius: '0.75rem', borderBottomLeftRadius: '0.75rem' }}>
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`group/thumb relative flex-shrink-0 w-20 h-20 border-2 overflow-hidden transition-all duration-300 ${idx === currentImageIndex ? 'border-sage-400 ring-4 ring-sage-400/10' : 'border-stone-200 hover:border-sage-300 bg-oat-50'}`}
                                        style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}
                                    >
                                        <img src={resolveMediaUrl(img)} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="lg:col-span-5 xl:col-span-6">
                        <div className="sticky top-12 space-y-7">
                            {/* Brand + Title */}
                            <div className="space-y-4">
                                {product.brand && (
                                    <div
                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-50 border border-sage-200/50"
                                        style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                                    >
                                        <Layers className="w-3 h-3 text-sage-500" />
                                        <span className="text-[10px] font-bold text-sage-700 uppercase tracking-[0.2em]">{product.brand}</span>
                                    </div>
                                )}
                                <h1 className="heading-serif text-3xl xl:text-5xl leading-[1.1] tracking-tight">{product.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                                    {product.model_number && (
                                        <div className="flex items-center gap-1.5">
                                            <Settings2 className="w-3.5 h-3.5 text-stone-300" />
                                            <span>Model: <span className="text-stone-600 font-medium">{product.model_number}</span></span>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-stone-300" />
                                            <span>SKU: <span className="text-stone-600 font-mono text-xs">{product.sku}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <p className="text-[15px] text-stone-500 leading-relaxed max-w-xl">{product.description}</p>
                            )}

                            {/* Price */}
                            {product.price && (
                                <div className="flex items-baseline gap-3 py-4 border-y border-stone-200/60">
                                    {product.compare_price && product.compare_price > product.price && (
                                        <span className="text-lg text-stone-400 line-through">
                                            ₺{product.compare_price.toLocaleString('tr-TR')}
                                        </span>
                                    )}
                                    <span className="text-3xl font-extrabold text-forest-900">
                                        ₺{product.price.toLocaleString('tr-TR')}
                                    </span>
                                    <span className="text-sm text-stone-400 font-medium">{product.currency || 'TRY'}</span>
                                </div>
                            )}

                            {/* KPIs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 py-5 border-b border-stone-200/60">
                                {product.unit && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Paketleme</span>
                                        <p className="text-sm font-semibold text-stone-700">{product.unit}</p>
                                    </div>
                                )}
                                {product.warranty_period && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Garanti</span>
                                        <p className="text-sm font-semibold text-stone-700">{product.warranty_period}</p>
                                    </div>
                                )}
                                {product.automation_level && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Otomasyon</span>
                                        <p className="text-sm font-semibold text-stone-700 capitalize">{product.automation_level}</p>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            {features.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-sage-500" /> Öne Çıkan Özellikler
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                        {features.map((feat, i) => {
                                            const label = typeof feat === 'object' ? feat.key : String(feat)
                                            const val = typeof feat === 'object' ? feat.value : ''
                                            return (
                                                <div key={i} className="flex flex-col gap-0.5 text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0" />
                                                        <span className="font-medium text-stone-600">{label}</span>
                                                    </div>
                                                    {val && <span className="pl-4 text-xs text-stone-400">{val}</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Analysis Types + Compliance Tags */}
                            {(complianceTags.length > 0 || analysisTypes.length > 0) && (
                                <div className="flex flex-wrap gap-2.5">
                                    {analysisTypes.map((type, i) => (
                                        <span key={`at-${i}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sage-50 text-sage-700 text-[10px] font-semibold uppercase tracking-wider border border-sage-200/50" style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                            <Beaker className="w-3.5 h-3.5" /> {String(type)}
                                        </span>
                                    ))}
                                    {complianceTags.map((tag, i) => (
                                        <span key={`ct-${i}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-oat-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider border border-stone-200/50" style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                            <Shield className="w-3.5 h-3.5" /> {String(tag)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 !mt-10">
                                <button onClick={() => setQuoteOpen(true)} className="w-full sm:w-auto btn-organic !px-8 !py-3.5 text-[13px]">
                                    Sipariş Oluştur <ArrowRight className="w-4 h-4" />
                                </button>
                                <Link to="/iletisim" className="w-full sm:w-auto btn-ghost-sage !px-8 !py-3.5 text-[13px] text-center">
                                    Danışmanlık Al
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Rich Content Section ─── */}
                <div className="mt-20 lg:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-14 xl:gap-20">
                    {/* Left: Specs + Content */}
                    <div className="lg:col-span-8 space-y-14">
                        {/* Specs as key-value table */}
                        {specsObj && Object.keys(specsObj).length > 0 && (
                            <section className="space-y-5">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-sage-500 to-sage-300" />
                                    <h2 className="text-base font-bold text-forest-900 uppercase tracking-widest">Teknik Özellikler</h2>
                                </div>
                                <div
                                    className="border border-stone-200/60 bg-white overflow-hidden shadow-sm"
                                    style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                                >
                                    {Object.entries(specsObj).map(([key, value], i) => (
                                        <div key={key} className={`flex flex-col sm:flex-row sm:items-center px-7 py-5 gap-1 sm:gap-6 ${i !== Object.keys(specsObj!).length - 1 ? 'border-b border-stone-100' : ''}`}>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest sm:w-44 shrink-0">{key.replace(/_/g, ' ')}</span>
                                            <span className="font-semibold text-stone-700 text-sm">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Specs as HTML */}
                        {specsHtml && (
                            <section className="space-y-5">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-sage-500 to-sage-300" />
                                    <h2 className="text-base font-bold text-forest-900 uppercase tracking-widest">Ürün Detayları</h2>
                                </div>
                                <div
                                    className="prose prose-stone max-w-none prose-img:rounded-2xl prose-headings:text-forest-900 prose-headings:font-semibold border border-stone-200/60 bg-white p-8 shadow-sm"
                                    style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                                    dangerouslySetInnerHTML={{ __html: specsHtml }}
                                />
                            </section>
                        )}

                        {/* TipTap content */}
                        {product.content && (
                            <section className="space-y-5">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-sage-500 to-sage-300" />
                                    <h2 className="text-base font-bold text-forest-900 uppercase tracking-widest">Detaylı Açıklama</h2>
                                </div>
                                <div className="prose prose-stone max-w-none prose-img:rounded-2xl prose-headings:text-forest-900 prose-headings:font-semibold">
                                    <TiptapRenderer content={product.content} />
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:col-span-4 space-y-10">
                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em]">Etiketler</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <Link
                                            key={i}
                                            to={`/urunler?q=${encodeURIComponent(String(tag))}`}
                                            className="px-4 py-2 border border-stone-200 bg-white text-[11px] font-medium text-stone-400 hover:text-sage-700 hover:border-sage-300 transition-all shadow-sm"
                                            style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                                        >
                                            #{String(tag)}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Application Areas */}
                        {applicationAreas.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em]">Kullanım Alanları</h3>
                                <div className="space-y-2">
                                    {applicationAreas.map((area, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-5 py-3.5 border border-stone-200/60 bg-white shadow-sm"
                                            style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}
                                        >
                                            <div className="w-8 h-8 bg-sage-50 flex items-center justify-center shrink-0" style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                                                <Activity className="w-4 h-4 text-sage-500" />
                                            </div>
                                            <span className="text-[13px] font-medium text-stone-600">{String(area)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Info Card */}
                        {(product.sku || product.model_number || product.brand) && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em]">Ürün Bilgileri</h3>
                                <div
                                    className="border border-stone-200/60 bg-white shadow-sm overflow-hidden divide-y divide-stone-100"
                                    style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                                >
                                    {product.brand && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-stone-400">Marka</span>
                                            <span className="text-xs font-semibold text-stone-700">{product.brand}</span>
                                        </div>
                                    )}
                                    {product.model_number && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-stone-400">Model</span>
                                            <span className="text-xs font-semibold text-stone-700">{product.model_number}</span>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-stone-400">Stok Kodu</span>
                                            <span className="text-xs font-mono font-semibold text-stone-700">{product.sku}</span>
                                        </div>
                                    )}
                                    {product.unit && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-stone-400">Birim</span>
                                            <span className="text-xs font-semibold text-stone-700">{product.unit}</span>
                                        </div>
                                    )}
                                    {product.warranty_period && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-stone-400">Garanti</span>
                                            <span className="text-xs font-semibold text-stone-700">{product.warranty_period}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                product={{
                    id: product.id, title: product.title, image_url: product.image_url,
                    brand: product.brand, model_number: product.model_number,
                    description: product.description, price: product.price,
                    currency: product.currency, sku: product.sku,
                }}
            />
        </div>
    )
}
