import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Package, Shield, CheckCircle2, Info, Layers, Settings2, Thermometer, Activity, ExternalLink, Zap, Tag } from 'lucide-react'
import { useProduct, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import QuoteModal from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'

/**
 * Safely parse a JSON string or return the value as-is.
 * Handles: JSON objects/arrays, plain strings, null/undefined.
 */
function parseJsonSafe(val: unknown): unknown {
    if (val === null || val === undefined) return null
    if (typeof val === 'object') return val // already parsed
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    if (!trimmed) return null
    // Only attempt JSON parse if it looks like JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed) } catch { /* not valid JSON */ }
    }
    // Return as plain string (could be HTML or text)
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

        // Specs can be: JSON object, HTML string, or plain text
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
                <div className="w-10 h-10 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-sm font-light animate-pulse">Ürün Bilgileri Yükleniyor...</span>
            </div>
        )
    }

    if (error || !product || !parsedData) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-azure-50/50 mb-6">
                    <Info className="w-8 h-8 text-azure-300" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Ürün Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto font-light">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="inline-flex items-center gap-2 text-[13px] font-semibold text-azure-500 hover:text-azure-600 transition-colors duration-300">
                    <ChevronLeft className="w-4 h-4" />
                    Ürün Kataloğuna Dön
                </Link>
            </div>
        )
    }

    const { specsObj, specsHtml, features, gallery, applicationAreas, tags, complianceTags, analysisTypes } = parsedData
    const allImages = gallery.length > 0 ? gallery : (product.image_url ? [product.image_url] : [])

    return (
        <div className="min-h-screen">
            <title>{product.meta_title || product.title} — GıdaKimya</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-azure-500 transition-colors duration-300">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <Link to="/urunler" className="hover:text-azure-500 transition-colors duration-300">Ürünler</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-slate-500 truncate max-w-[200px]">{product.title}</span>
                </nav>

                {/* ─── Hero: Gallery + Product Info ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* Gallery */}
                    <div className="lg:col-span-7 xl:col-span-6 space-y-6">
                        <div className="group relative bg-gradient-to-br from-azure-50/30 to-frost-50/40 rounded-[2rem] border border-azure-100/20 p-8 md:p-16 aspect-square flex items-center justify-center overflow-hidden">
                            <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
                                {product.is_featured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-azure-600 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-md shadow-azure-500/15">
                                        <Zap className="w-3 h-3" />
                                        Öne Çıkan
                                    </span>
                                )}
                                {product.campaign_label && (
                                    <span className="inline-flex px-3 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-md">
                                        {product.campaign_label}
                                    </span>
                                )}
                            </div>

                            {allImages.length > 0 ? (
                                <img src={resolveMediaUrl(allImages[currentImageIndex])} alt={product.title} className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105" />
                            ) : (
                                <Package className="w-32 h-32 text-azure-100" />
                            )}

                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 text-slate-500">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setCurrentImageIndex((i) => (i + 1) % allImages.length)} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 text-slate-500">
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                                {allImages.map((img, idx) => (
                                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`group relative flex-shrink-0 w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${idx === currentImageIndex ? 'border-azure-400 ring-4 ring-azure-400/10' : 'border-azure-100/30 hover:border-azure-200 bg-azure-50/20'}`}>
                                        <img src={resolveMediaUrl(img)} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="lg:col-span-5 xl:col-span-6">
                        <div className="sticky top-12 space-y-8">
                            {/* Title block */}
                            <div className="space-y-4">
                                {product.brand && (
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-azure-50/40 border border-azure-100/30 rounded-xl">
                                        <Layers className="w-3 h-3 text-azure-400" />
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">{product.brand}</span>
                                    </div>
                                )}
                                <h1 className="text-3xl xl:text-4xl font-bold text-slate-800 leading-[1.15] tracking-tight">{product.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    {product.model_number && (
                                        <div className="flex items-center gap-1.5">
                                            <Settings2 className="w-3.5 h-3.5 text-slate-300" />
                                            <span>Model: <span className="text-slate-500 font-medium">{product.model_number}</span></span>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-slate-300" />
                                            <span>SKU: <span className="text-slate-500 font-mono text-xs">{product.sku}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="text-[15px] text-slate-400 leading-relaxed max-w-xl prose prose-slate prose-p:text-slate-400 font-light" dangerouslySetInnerHTML={{ __html: product.description }} />
                            )}

                            {/* Price */}
                            {product.price && (
                                <div className="flex items-baseline gap-3 py-4 border-y border-azure-100/20">
                                    {product.compare_price && product.compare_price > product.price && (
                                        <span className="text-lg text-slate-400 line-through font-light">
                                            ₺{product.compare_price.toLocaleString('tr-TR')}
                                        </span>
                                    )}
                                    <span className="text-3xl font-extrabold text-slate-800">
                                        ₺{product.price.toLocaleString('tr-TR')}
                                    </span>
                                    <span className="text-sm text-slate-400 font-medium">{product.currency || 'TRY'}</span>
                                </div>
                            )}

                            {/* KPIs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-b border-azure-100/20">
                                {product.unit && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">PAKETLEME</span>
                                        <p className="text-sm font-semibold text-slate-600">{product.unit}</p>
                                    </div>
                                )}
                                {product.warranty_period && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">GARANTİ</span>
                                        <p className="text-sm font-semibold text-slate-600">{product.warranty_period}</p>
                                    </div>
                                )}
                                {product.automation_level && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">OTOMASYON</span>
                                        <p className="text-sm font-semibold text-slate-600 capitalize">{product.automation_level}</p>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            {features.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-azure-400" /> Öne Çıkan Özellikler
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                        {features.map((feat, i) => {
                                            const label = typeof feat === 'object' ? feat.key : String(feat)
                                            const val = typeof feat === 'object' ? feat.value : ''
                                            return (
                                                <div key={i} className="flex flex-col gap-0.5 text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-azure-400 shrink-0" />
                                                        <span className="font-medium text-slate-600">{label}</span>
                                                    </div>
                                                    {val && <span className="pl-4 text-xs text-slate-400">{val}</span>}
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
                                        <span key={`at-${i}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-azure-50/50 text-azure-600 rounded-xl text-[10px] font-semibold uppercase tracking-wider border border-azure-100/30">
                                            <Thermometer className="w-3.5 h-3.5" /> {String(type)}
                                        </span>
                                    ))}
                                    {complianceTags.map((tag, i) => (
                                        <span key={`ct-${i}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50/50 text-slate-500 rounded-xl text-[10px] font-semibold uppercase tracking-wider border border-slate-100/50">
                                            <Shield className="w-3.5 h-3.5" /> {String(tag)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 !mt-12">
                                <button onClick={() => setQuoteOpen(true)} className="w-full sm:w-auto btn-azure !px-8 !py-4 uppercase tracking-widest !text-[12px]">
                                    Sipariş Oluştur <ExternalLink className="w-4 h-4" />
                                </button>
                                <a href="https://wa.me/902121234567" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-500 border border-emerald-600 px-8 py-4 text-[12px] font-semibold text-white shadow-sm hover:bg-emerald-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-widest">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp'tan Yazın
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Rich Content Section ─── */}
                <div className="mt-24 lg:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                    {/* Left: Specs + Content */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Specs as structured key-value table */}
                        {specsObj && Object.keys(specsObj).length > 0 && (
                            <section className="space-y-6">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-azure-500 to-azure-300" />
                                    <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-widest">Teknik Özellikler</h2>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                    {Object.entries(specsObj).map(([key, value], i) => (
                                        <div key={key} className={`flex flex-col sm:flex-row sm:items-center px-7 py-5 gap-1 sm:gap-6 ${i !== Object.keys(specsObj!).length - 1 ? 'border-b border-slate-100' : ''}`}>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest sm:w-40 shrink-0">{key.replace(/_/g, ' ')}</span>
                                            <span className="font-semibold text-slate-600 text-sm">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Specs as HTML (rich text from admin editor) */}
                        {specsHtml && (
                            <section className="space-y-6">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-azure-500 to-azure-300" />
                                    <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-widest">Ürün Detayları</h2>
                                </div>
                                <div className="prose prose-slate max-w-none prose-img:rounded-2xl prose-headings:text-slate-700 prose-headings:font-semibold rounded-2xl border border-slate-100 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: specsHtml }} />
                            </section>
                        )}

                        {/* Content (TipTap rich text from admin block editor) */}
                        {product.content && (
                            <section className="space-y-6">
                                <div className="inline-flex items-center gap-3">
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-azure-500 to-azure-300" />
                                    <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-widest">Detaylı Açıklama</h2>
                                </div>
                                <div className="prose prose-slate max-w-none prose-img:rounded-2xl prose-headings:text-slate-700 prose-headings:font-semibold">
                                    <TiptapRenderer content={product.content} />
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar: Tags + Application Areas */}
                    <aside className="lg:col-span-4 space-y-10">
                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] px-1">Etiketler</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <Link key={i} to={`/urunler?q=${encodeURIComponent(String(tag))}`} className="px-4 py-2.5 rounded-xl border border-slate-100 bg-white text-[11px] font-medium text-slate-400 hover:text-azure-600 hover:border-azure-200 transition-all duration-200 shadow-sm">
                                            #{String(tag)}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Application Areas — moved to right sidebar, under tags */}
                        {applicationAreas.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] px-1">Kullanım Alanları</h3>
                                <div className="space-y-2">
                                    {applicationAreas.map((area, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-azure-50/60 flex items-center justify-center text-azure-400 shrink-0">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-medium text-slate-600">{String(area)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product ID / SKU info card */}
                        {(product.sku || product.model_number || product.brand) && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] px-1">Ürün Bilgileri</h3>
                                <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
                                    {product.brand && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-slate-400">Marka</span>
                                            <span className="text-xs font-semibold text-slate-600">{product.brand}</span>
                                        </div>
                                    )}
                                    {product.model_number && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-slate-400">Model</span>
                                            <span className="text-xs font-semibold text-slate-600">{product.model_number}</span>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-slate-400">Stok Kodu</span>
                                            <span className="text-xs font-mono font-semibold text-slate-600">{product.sku}</span>
                                        </div>
                                    )}
                                    {product.unit && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-slate-400">Birim</span>
                                            <span className="text-xs font-semibold text-slate-600">{product.unit}</span>
                                        </div>
                                    )}
                                    {product.warranty_period && (
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-xs text-slate-400">Garanti</span>
                                            <span className="text-xs font-semibold text-slate-600">{product.warranty_period}</span>
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
                product={{ id: product.id, title: product.title, image_url: product.image_url, brand: product.brand, model_number: product.model_number, description: product.description, price: product.price, currency: product.currency, sku: product.sku }}
            />
        </div>
    )
}
