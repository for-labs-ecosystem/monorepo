import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getProduct } from '@forlabs/core'
import { ArrowLeft, ArrowRight, X, Send, CheckCircle2, Loader2, FileText } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const API_BASE = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface ProductDetail {
    id: number
    slug: string
    title: string
    title_en: string | null
    description: string | null
    description_en: string | null
    content: string | null
    content_en: string | null
    short_description: string | null
    image_url: string | null
    gallery: string | null
    brand: string | null
    model_number: string | null
    sku: string | null
    price: number | null
    compare_price: number | null
    currency: string | null
    unit: string | null
    specs: string | null
    specs_en: string | null
    features: string | null
    features_en: string | null
    warranty_period: string | null
    application_areas: string | null
    analysis_types: string | null
    compliance_tags: string | null
    automation_level: string | null
    category_id: number | null
    meta_title: string | null
    meta_description: string | null
    canonical_url: string | null
}

// ── Safe JSON parse helpers ──
function safeParseArray(val: string | null | undefined): string[] {
    if (!val) return []
    try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed.map(item => {
            if (typeof item === 'string') return item
            if (typeof item === 'object' && item !== null) {
                // Handle {key, value} objects from features
                if ('key' in item && 'value' in item) return `${item.key}: ${item.value}`
                return JSON.stringify(item)
            }
            return String(item)
        })
        return []
    } catch {
        return []
    }
}

function safeParseKeyValue(val: string | null | undefined): Array<{key: string; value: string}> {
    if (!val) return []
    try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) {
            return parsed
                .filter(item => typeof item === 'object' && item !== null && 'key' in item && 'value' in item)
                .map(item => ({ key: String(item.key), value: String(item.value) }))
        }
        if (typeof parsed === 'object' && parsed !== null) {
            return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }))
        }
        return []
    } catch {
        return []
    }
}

function safeParseGallery(val: string | null | undefined): string[] {
    if (!val) return []
    try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []
    } catch {
        return []
    }
}

// ── Quote Request Modal ──
function QuoteModal({ product, onClose }: { product: ProductDetail; onClose: () => void }) {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        message: `Merhaba, "${product.title}" ürünü hakkında bilgi ve fiyat teklifi almak istiyorum.${product.model_number ? `\nModel: ${product.model_number}` : ''}${product.sku ? `\nSKU: ${product.sku}` : ''}`,
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = {
                site_id: Number(SITE_ID),
                type: 'quote',
                subject: `Teklif Talebi: ${product.title}`,
                full_name: form.full_name,
                email: form.email,
                phone: form.phone || null,
                company: form.company || null,
                message: form.message,
                metadata: JSON.stringify({
                    product_id: product.id,
                    product_title: product.title,
                    product_slug: product.slug,
                    product_sku: product.sku,
                    product_model: product.model_number,
                    product_brand: product.brand,
                    product_price: product.price,
                }),
            }
            const res = await fetch(`${API_BASE}/api/inquiries?site_id=${SITE_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Gönderim başarısız')
            }
            return res.json()
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.full_name || !form.email) return
        mutation.mutate()
    }

    if (mutation.isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Talebiniz Alındı</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Teknik ekibimiz en kısa sürede sizinle iletişime geçecektir.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-md hover:bg-brand-700 transition-colors"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Teklif Talebi</h3>
                            <p className="text-[11px] text-slate-400">{product.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Product summary */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-md border border-slate-200 flex items-center justify-center p-1 shrink-0">
                        <img src={getImageUrl(product.image_url)} alt={product.title} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{product.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                            {product.brand && <span className="text-[10px] font-mono text-slate-400">{product.brand}</span>}
                            {product.model_number && <span className="text-[10px] font-mono text-slate-400">Model: {product.model_number}</span>}
                            {product.sku && <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Soyad *</label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">E-posta *</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                placeholder="ornek@firma.com"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                placeholder="+90 5XX XXX XX XX"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Firma</label>
                            <input
                                type="text"
                                value={form.company}
                                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                placeholder="Firma Adı"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mesajınız</label>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none"
                        />
                    </div>

                    {mutation.isError && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{(mutation.error as Error).message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-bold rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors"
                    >
                        {mutation.isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Teklif Talebini Gönder</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

// ── Main Page Component ──
export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const [showQuoteModal, setShowQuoteModal] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => getProduct(slug!),
        enabled: !!slug,
    })

    const product = data?.data as ProductDetail | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-brand-900 mb-3">Ürün Bulunamadı</h1>
                <p className="text-slate-500 text-sm mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="text-sm font-semibold text-brand-600 hover:text-brand-700">← Ürünlere Dön</Link>
            </div>
        )
    }

    const galleryImages = safeParseGallery(product.gallery)
    const features = safeParseKeyValue(product.features)
    const applicationAreas = safeParseArray(product.application_areas)
    const analysisTypes = safeParseArray(product.analysis_types)
    const complianceTags = safeParseArray(product.compliance_tags)

    // All images: main + gallery
    const allImages = product.image_url ? [product.image_url, ...galleryImages.filter(g => g !== product.image_url)] : galleryImages
    const currentImage = allImages[activeImageIndex] || product.image_url

    return (
        <>
            <title>{product.meta_title || product.title} — Lab Kurulum</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}
            {product.canonical_url && <link rel="canonical" href={product.canonical_url} />}

            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/urunler" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Ürünlere Dön
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* ── Left: Images ── */}
                    <div>
                        <div className="aspect-square bg-slate-50 border border-slate-200 rounded-md overflow-hidden flex items-center justify-center p-8">
                            <img
                                src={getImageUrl(currentImage)}
                                alt={product.title}
                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`w-20 h-20 border rounded-sm bg-slate-50 flex items-center justify-center shrink-0 p-1 transition-all ${
                                            i === activeImageIndex ? 'border-brand-400 ring-1 ring-brand-200' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <img src={getImageUrl(img)} alt={`${product.title} ${i + 1}`} className="max-w-full max-h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Details ── */}
                    <div>
                        {product.brand && (
                            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">{product.brand}</p>
                        )}
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-brand-900 tracking-tight">{product.title}</h1>

                        {/* Model & SKU */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            {product.model_number && <p className="text-xs font-mono text-slate-400">Model: {product.model_number}</p>}
                            {product.sku && <p className="text-xs font-mono text-slate-400">SKU: {product.sku}</p>}
                            {product.warranty_period && <p className="text-xs font-mono text-slate-400">Garanti: {product.warranty_period}</p>}
                        </div>

                        {/* Price */}
                        {product.price != null ? (
                            <div className="mt-6 p-4 border border-slate-200 rounded-sm bg-slate-50">
                                <div className="flex items-baseline gap-3">
                                    {product.compare_price != null && product.compare_price > product.price && (
                                        <span className="text-base text-slate-400 line-through font-mono">
                                            {product.compare_price.toLocaleString('tr-TR')} {product.currency || 'TRY'}
                                        </span>
                                    )}
                                    <span className="text-2xl font-extrabold text-brand-700 font-mono">
                                        {product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}
                                    </span>
                                    <span className="text-xs text-slate-400">+ KDV</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 border border-accent-200 rounded-sm bg-accent-50">
                                <p className="text-sm font-semibold text-accent-700">Fiyat için teklif talep edin</p>
                            </div>
                        )}

                        {/* CTA: Teklif Al */}
                        <div className="mt-6">
                            <button
                                onClick={() => setShowQuoteModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-brand-600 text-white text-sm font-bold uppercase tracking-wider transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200"
                            >
                                <FileText className="w-4 h-4" />
                                Teklif Al
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Description — rich HTML */}
                        {product.description && (
                            <div className="mt-8 prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                        )}

                        {/* Features (key-value pairs) */}
                        {features.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Özellikler</h3>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {features.map((f, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-2.5 pr-4 text-slate-500 font-medium">{f.key}</td>
                                                <td className="py-2.5 text-slate-800 font-mono text-xs">{f.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Specs — could be HTML or key-value JSON */}
                        {product.specs && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Teknik Özellikler</h3>
                                {(() => {
                                    // Try parsing as JSON key-value first
                                    const specEntries = safeParseKeyValue(product.specs)
                                    if (specEntries.length > 0) {
                                        return (
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    {specEntries.map(({ key, value }, i) => (
                                                        <tr key={i} className="border-b border-slate-100">
                                                            <td className="py-2.5 pr-4 text-slate-500 font-medium">{key}</td>
                                                            <td className="py-2.5 text-slate-800 font-mono text-xs">{value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )
                                    }
                                    // Fallback: render as rich HTML
                                    return <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.specs }} />
                                })()}
                            </div>
                        )}

                        {/* Application Areas */}
                        {applicationAreas.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Uygulama Alanları</h3>
                                <div className="flex flex-wrap gap-2">
                                    {applicationAreas.map((area, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-full border border-brand-100">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Analysis Types */}
                        {analysisTypes.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Analiz Türleri</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysisTypes.map((at, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs font-medium text-accent-700 bg-accent-50 rounded-full border border-accent-100">
                                            {at}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compliance Tags */}
                        {complianceTags.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Uyumluluk & Sertifikalar</h3>
                                <div className="flex flex-wrap gap-2">
                                    {complianceTags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Automation Level */}
                        {product.automation_level && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-2">Otomasyon Seviyesi</h3>
                                <p className="text-sm text-slate-600">{product.automation_level}</p>
                            </div>
                        )}

                        {/* Content — full rich content from TipTap block editor */}
                        {product.content && (
                            <div className="mt-10 pt-8 border-t border-slate-200">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-4">Detaylı Bilgi</h3>
                                <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.content }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote Modal */}
            {showQuoteModal && <QuoteModal product={product} onClose={() => setShowQuoteModal(false)} />}
        </>
    )
}
