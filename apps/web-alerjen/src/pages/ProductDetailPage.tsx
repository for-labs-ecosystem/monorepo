import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, FlaskConical, ChevronLeft, ChevronRight as ChevronRightIcon, Tag, Package, Shield } from 'lucide-react'
import { useProduct } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useProduct(slug!)
    const product = data?.data as Product | undefined

    const [quoteOpen, setQuoteOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Ürün Bulunamadı</h1>
                <p className="text-slate-500 text-sm mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    ← Ürünlere Dön
                </Link>
            </div>
        )
    }

    const specs: Record<string, string> = (() => {
        try {
            if (product.specs && typeof product.specs === 'string') return JSON.parse(product.specs)
        } catch { /* ignore */ }
        return {}
    })()

    const features: string[] = (() => {
        try {
            if (product.features && typeof product.features === 'string') return JSON.parse(product.features)
        } catch { /* ignore */ }
        return []
    })()

    const gallery: string[] = (() => {
        try {
            if (product.gallery && typeof product.gallery === 'string') return JSON.parse(product.gallery)
        } catch { /* ignore */ }
        return []
    })()

    const applicationAreas: string[] = (() => {
        try {
            if (product.application_areas && typeof product.application_areas === 'string') return JSON.parse(product.application_areas)
        } catch { /* ignore */ }
        return []
    })()

    const tags: string[] = (() => {
        try {
            if (product.tags && typeof product.tags === 'string') return JSON.parse(product.tags)
        } catch { /* ignore */ }
        return []
    })()

    const allImages = gallery.length > 0 ? gallery : (product.image_url ? [product.image_url] : [])

    return (
        <div className="min-h-screen">
            <title>{product.meta_title || product.title} — Alerjen</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-8">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/urunler" className="hover:text-primary-600 transition-colors">Ürünler</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 truncate max-w-[200px]">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 lg:p-12 flex items-center justify-center aspect-square relative">
                            {allImages.length > 0 ? (
                                <img
                                    src={getImageUrl(allImages[currentImageIndex])}
                                    alt={product.title}
                                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                                />
                            ) : (
                                <FlaskConical className="w-24 h-24 text-slate-200" />
                            )}
                            
                            {/* Gallery Navigation */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((i) => (i + 1) % allImages.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        <ChevronRightIcon className="w-5 h-5 text-slate-700" />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Thumbnail Strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                                            idx === currentImageIndex
                                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${product.title} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        {product.brand && (
                            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">{product.brand}</span>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {product.title}
                        </h1>
                        {product.model_number && (
                            <p className="text-sm text-slate-400 mt-2">Model: <span className="text-slate-600 font-medium">{product.model_number}</span></p>
                        )}

                        {product.description && (
                            <p className="mt-6 text-base text-slate-600 leading-relaxed">{product.description}</p>
                        )}

                        {/* Features */}
                        {features.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Öne Çıkan Özellikler</h3>
                                <ul className="space-y-2">
                                    {features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Application Areas */}
                        {applicationAreas.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Kullanım Alanları</h3>
                                <div className="flex flex-wrap gap-2">
                                    {applicationAreas.map((area, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Etiketler</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Meta Info */}
                        <div className="mt-6 space-y-3">
                            {product.sku && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500">SKU:</span>
                                    <span className="font-mono text-slate-700">{product.sku}</span>
                                </div>
                            )}
                            {product.unit && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Birim:</span>
                                    <span className="text-slate-700">{product.unit}</span>
                                </div>
                            )}
                            {product.warranty_period && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-500">Garanti:</span>
                                    <span className="text-slate-700">{product.warranty_period}</span>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setQuoteOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Bu Ürün İçin Teklif Al
                            </button>
                            <a
                                href="https://wa.me/905320000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                            >
                                WhatsApp ile Sorun
                            </a>
                        </div>

                        {/* Specs Table */}
                        {Object.keys(specs).length > 0 && (
                            <div className="mt-10">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Teknik Özellikler</h3>
                                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                    {Object.entries(specs).map(([key, value], i) => (
                                        <div key={key} className={`flex items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                            <span className="w-1/3 font-semibold text-slate-600">{key}</span>
                                            <span className="w-2/3 text-slate-800">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote Modal */}
            <QuoteModal
                open={quoteOpen}
                onClose={() => setQuoteOpen(false)}
                productId={product.id}
                productName={product.title}
            />
        </div>
    )
}
