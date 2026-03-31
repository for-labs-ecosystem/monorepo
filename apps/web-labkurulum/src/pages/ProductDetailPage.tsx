import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '@forlabs/core'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface ProductDetail {
    id: number
    slug: string
    title: string
    description: string | null
    short_description: string | null
    image_url: string | null
    gallery: string | null
    brand: string | null
    model: string | null
    sku: string | null
    price: number | null
    currency: string | null
    specs: string | null
    features: string | null
    meta_title: string | null
    meta_description: string | null
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()

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

    const galleryImages: string[] = (() => {
        try { return product.gallery ? JSON.parse(product.gallery) : [] } catch { return [] }
    })()

    const specs: Record<string, string> = (() => {
        try { return product.specs ? JSON.parse(product.specs) : {} } catch { return {} }
    })()

    const features: string[] = (() => {
        try { return product.features ? JSON.parse(product.features) : [] } catch { return [] }
    })()

    return (
        <>
            <title>{product.meta_title || product.title} — Lab Kurulum</title>
            {product.meta_description && <meta name="description" content={product.meta_description} />}

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/urunler" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Ürünlere Dön
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Image */}
                    <div>
                        <div className="aspect-square bg-slate-50 border border-slate-200 rounded-md overflow-hidden flex items-center justify-center p-8">
                            <img
                                src={getImageUrl(product.image_url)}
                                alt={product.title}
                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        {galleryImages.length > 0 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto">
                                {galleryImages.map((img, i) => (
                                    <div key={i} className="w-20 h-20 border border-slate-200 rounded-sm bg-slate-50 flex items-center justify-center shrink-0 p-1">
                                        <img src={getImageUrl(img)} alt={`${product.title} ${i + 1}`} className="max-w-full max-h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        {product.brand && (
                            <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">{product.brand}</p>
                        )}
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-brand-900 tracking-tight">{product.title}</h1>
                        {product.model && <p className="text-xs font-mono text-slate-400 mt-1">Model: {product.model}</p>}
                        {product.sku && <p className="text-xs font-mono text-slate-400">SKU: {product.sku}</p>}

                        {product.price != null ? (
                            <div className="mt-6 p-4 border border-slate-200 rounded-sm bg-slate-50">
                                <span className="text-2xl font-extrabold text-brand-700 font-mono">
                                    {product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}
                                </span>
                                <span className="text-xs text-slate-400 ml-2">+ KDV</span>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 border border-accent-200 rounded-sm bg-accent-50">
                                <p className="text-sm font-semibold text-accent-700">Fiyat için teklif talep edin</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <Link
                                to="/iletisim"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider transition-all hover:bg-brand-700 dimension-line"
                            >
                                Teklif Al <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {product.short_description && (
                            <p className="mt-8 text-sm text-slate-600 leading-relaxed">{product.short_description}</p>
                        )}

                        {features.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Özellikler</h3>
                                <ul className="space-y-2">
                                    {features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {Object.keys(specs).length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-3">Teknik Özellikler</h3>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {Object.entries(specs).map(([key, val]) => (
                                            <tr key={key} className="border-b border-slate-100">
                                                <td className="py-2.5 pr-4 text-slate-500 font-medium">{key}</td>
                                                <td className="py-2.5 text-slate-800 font-mono text-xs">{val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {product.description && (
                            <div className="mt-8 prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
