import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, ShieldCheck, Microscope, Clock } from 'lucide-react'
import { useProducts, useArticles } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'
import type { Product, Article } from '@forlabs/shared'

export default function HomePage() {
    const { data: productsData } = useProducts({ limit: 6, is_featured: 1 })
    const { data: articlesData } = useArticles({ limit: 3 })

    const products = (productsData?.data ?? []) as Product[]
    const articles = (articlesData?.data ?? []) as Article[]

    const [quoteProduct, setQuoteProduct] = useState<{ id: number; name: string } | null>(null)

    return (
        <>
            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                {/* Background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-accent-50/40" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-200/20 blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent-200/20 blur-[100px]" />

                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/60 border border-primary-200/50 px-4 py-1.5 mb-6">
                            <FlaskConical className="w-4 h-4 text-primary-600" />
                            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Gıda Güvenliği Çözümleri</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            Alerjen Testinde{' '}
                            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                Hız ve Güven
                            </span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                            Gıda endüstrisi için hızlı alerjen ve kontaminasyon test kitleri.
                            Bilimsel doğrulukla üretim hattınızı güvence altına alın.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                to="/urunler"
                                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Test Kitlerini Keşfet
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/iletisim"
                                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 hover:border-primary-300 hover:text-primary-700 transition-all duration-200"
                            >
                                Ücretsiz Danışmanlık
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trust Badges ── */}
            <section className="relative border-y border-slate-100 bg-white/60 backdrop-blur-sm">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                        {[
                            { icon: ShieldCheck, label: 'ISO 17025 Uyumlu', desc: 'Uluslararası standartlara uygun test kitleri' },
                            { icon: Clock, label: 'Sonuç: 5-15 dk', desc: 'Hızlı sonuç alan lateral flow teknolojisi' },
                            { icon: Microscope, label: 'Bilimsel Doğruluk', desc: 'ppb düzeyinde hassas alerjen tespiti' },
                            { icon: FlaskConical, label: '50+ Test Türü', desc: 'Glüten, süt, yumurta, fıstık ve daha fazlası' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-4">
                                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Products ── */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="text-xs font-bold text-primary-600 uppercase tracking-[0.15em]">Ürün Vitrini</span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Popüler Test Kitleri</h2>
                            <p className="mt-2 text-slate-500 max-w-lg">En çok tercih edilen alerjen ve gıda güvenliği hızlı test kitlerimiz.</p>
                        </div>
                        <Link
                            to="/urunler"
                            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Tümünü Gör <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {products.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[380px] rounded-3xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
                                >
                                    <Link to={`/urunler/${product.slug}`} className="aspect-[4/3] bg-slate-50 p-8 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                                        />
                                    </Link>
                                    <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                                        <div>
                                            {product.brand && (
                                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{product.brand}</span>
                                            )}
                                            <Link to={`/urunler/${product.slug}`}>
                                                <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug mt-1">
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            {product.description && (
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setQuoteProduct({ id: product.id, name: product.title })}
                                            className="w-full flex items-center justify-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-accent-500/15 hover:bg-accent-400 hover:shadow-lg hover:shadow-accent-500/25 hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            Teklif Al
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <Link
                            to="/urunler"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Tüm Ürünleri Gör <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Latest Research ── */}
            <section className="py-20 lg:py-28 bg-slate-50/70">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="text-xs font-bold text-primary-600 uppercase tracking-[0.15em]">Bilgi Portalı</span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Son Araştırmalar</h2>
                            <p className="mt-2 text-slate-500 max-w-lg">Gıda güvenliği ve alerjen yönetimi üzerine güncel bilimsel içerikler.</p>
                        </div>
                        <Link
                            to="/arastirmalar"
                            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Tümünü Oku <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {articles.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[340px] rounded-3xl bg-white animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {articles.map((article, idx) => (
                                <Link
                                    key={article.id}
                                    to={`/arastirmalar/${article.slug}`}
                                    className={`group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                                        idx === 0 ? 'md:col-span-2 md:flex-row' : ''
                                    }`}
                                >
                                    <div className={`bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center overflow-hidden ${
                                        idx === 0 ? 'md:w-1/2 aspect-[16/10]' : 'aspect-[16/10]'
                                    }`}>
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <FlaskConical className="w-12 h-12 text-primary-300" />
                                        )}
                                    </div>
                                    <div className={`p-6 flex flex-col justify-center ${idx === 0 ? 'md:w-1/2 md:p-8' : ''}`}>
                                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Araştırma</span>
                                        <h3 className={`font-bold text-slate-900 group-hover:text-primary-700 transition-colors mt-2 line-clamp-2 leading-snug ${
                                            idx === 0 ? 'text-xl' : 'text-base'
                                        }`}>
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className={`text-slate-500 mt-2 leading-relaxed ${idx === 0 ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'}`}>
                                                {article.excerpt}
                                            </p>
                                        )}
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                                            Devamını Oku <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Projeniz İçin Doğru Test Kitini Bulalım
                    </h2>
                    <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
                        Uzman ekibimiz, üretim hattınıza en uygun alerjen test çözümünü belirlemek için yanınızda.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/iletisim"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary-700 shadow-lg hover:bg-primary-50 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Ücretsiz Danışmanlık Al
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="https://wa.me/905320000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all duration-200"
                        >
                            WhatsApp ile Yazın
                        </a>
                    </div>
                </div>
            </section>

            {/* Quote Modal */}
            {quoteProduct && (
                <QuoteModal
                    open={!!quoteProduct}
                    onClose={() => setQuoteProduct(null)}
                    productId={quoteProduct.id}
                    productName={quoteProduct.name}
                />
            )}
        </>
    )
}
