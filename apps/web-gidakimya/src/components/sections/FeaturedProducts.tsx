import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import { SectionHeader } from '@/components/ui/SectionHeader'
import QuoteModal from '@/components/QuoteModal'
import type { QuoteProduct } from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'
import { Package, ArrowUpRight } from 'lucide-react'

export default function FeaturedProducts() {
    const { data: productsData } = useProducts({ limit: 4, is_featured: 1 })
    const products = (productsData?.data ?? []) as Product[]
    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)

    return (
        <section className="py-20 lg:py-28 relative">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
                <SectionHeader
                    tag="Ürün Vitrini"
                    title="Öne Çıkan Cihazlar"
                    description="En çok tercih edilen gıda analiz ve kalite kontrol cihazlarımız."
                    linkTo="/urunler"
                />

                {products.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bento-card h-[420px] animate-pulse" style={{ background: 'rgba(239,246,255,0.3)' }} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {products.slice(0, 4).map((product, idx) => (
                            <div
                                key={product.id}
                                className="group flex flex-col bento-card overflow-hidden"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <Link
                                    to={`/urunler/${product.slug}`}
                                    className="aspect-square bg-gradient-to-br from-azure-50/20 via-white to-frost-50/30 p-8 flex items-center justify-center overflow-hidden relative"
                                >
                                    {/* Dönen halo — ürün arkasında */}
                                    <div className="absolute inset-[15%] rounded-full border border-azure-200/20 animate-orbit opacity-40 pointer-events-none" />

                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                                        {Boolean(product.is_featured) && (
                                            <div className="glass-widget-floating !pointer-events-auto px-3 py-1.5 !rounded-full text-[9px] font-bold text-azure-600 uppercase tracking-[0.12em]">
                                                Öne Çıkan
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div className="glass-widget-floating !pointer-events-auto px-3 py-1.5 !rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                                                {product.brand}
                                            </div>
                                        )}
                                    </div>

                                    {product.image_url ? (
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply drop-shadow-sm"
                                        />
                                    ) : (
                                        <Package className="w-16 h-16 text-azure-200/40" />
                                    )}
                                </Link>

                                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                                    <div>
                                        <Link to={`/urunler/${product.slug}`}>
                                            <h3 className="text-[14px] font-bold text-slate-800 line-clamp-2 group-hover:text-azure-600 transition-colors duration-300 leading-snug">
                                                {product.title}
                                            </h3>
                                        </Link>
                                        {product.model_number && (
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-wider uppercase">
                                                {product.model_number}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setQuoteProduct({
                                            id: product.id, title: product.title,
                                            image_url: product.image_url, brand: product.brand,
                                            model_number: product.model_number, description: product.description,
                                            price: product.price, currency: product.currency, sku: product.sku,
                                        })}
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-azure-50/60 border border-azure-100/40 text-[12px] font-bold text-azure-600 hover:bg-azure-100/60 hover:border-azure-200 hover:shadow-lg hover:shadow-azure-500/10 transition-all duration-300 group/btn"
                                    >
                                        Sipariş Oluştur
                                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {quoteProduct && (
                <QuoteModal
                    open={!!quoteProduct}
                    onClose={() => setQuoteProduct(null)}
                    product={quoteProduct}
                />
            )}
        </section>
    )
}
