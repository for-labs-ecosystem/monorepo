import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, LayoutGrid, FlaskConical, Compass, Boxes } from 'lucide-react'
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
            {/* ── Hero — Deep breath ── */}
            <section className="relative overflow-hidden">
                {/* Ambient background — morning sunlight on a white desk */}
                <div className="absolute inset-0 bg-gradient-to-br from-mint-50 via-white to-peach-50/60" />
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-ocean-200/10 blur-[160px] animate-glow-pulse" />
                <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-coral-200/10 blur-[140px] animate-glow-pulse" style={{ animationDelay: '3s' }} />

                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-24 lg:py-40">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-ocean-50/50 border border-ocean-200/30 px-4 py-2 mb-8">
                            <Leaf className="w-3.5 h-3.5 text-ocean-500" />
                            <span className="text-[11px] font-semibold text-ocean-600 uppercase tracking-[0.15em]">Gıda Güvenliği Çözümleri</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-slate-600 tracking-tight leading-[1.1]">
                            Alerjen Testinde{' '}
                            <span className="bg-gradient-to-r from-ocean-500 to-ocean-400 bg-clip-text text-transparent">
                                Hız ve Güven
                            </span>
                        </h1>
                        <p className="mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl font-light">
                            Gıda endüstrisi için hızlı alerjen ve kontaminasyon test kitleri.
                            Bilimsel doğrulukla üretim hattınızı güvence altına alın.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                to="/urunler"
                                className="btn-warm"
                            >
                                Test Kitlerini Keşfet
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/iletisim"
                                className="btn-ocean"
                            >
                                Ücretsiz Danışmanlık
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trust Badges — Floating pebbles ── */}
            <section className="relative py-12 lg:py-16">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                        {[
                            { icon: LayoutGrid, label: 'Geniş Marka ve Ürün Portföyü', desc: 'Dünyanın önde gelen test kiti üreticilerini ve global referans markalarını tek bir çatı altında sunuyoruz.' },
                            { icon: FlaskConical, label: 'Çoklu Metodoloji Seçeneği', desc: 'Lateral Flow, ELISA veya PCR... Numune matrisinize ve tesisinize en uygun doğrulama metodolojisine ulaşın.' },
                            { icon: Compass, label: 'Objektif Uzman Yönlendirmesi', desc: 'Sadece ürün tedarik etmiyor; prosesiniz için en doğru, hızlı ve maliyet-etkin çözümü belirlemenize rehberlik ediyoruz.' },
                            { icon: Boxes, label: 'For-Labs Stok ve Destek Güvencesi', desc: 'Üretiminizin aksamaması için güçlü lojistik ağı, sürekli stok bulunabilirliği ve Protek Analitik teknik desteği.' },
                        ].map((item) => (
                            <div key={item.label} className="pebble-card p-5 lg:p-6 flex items-start gap-4">
                                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50/60">
                                    <item.icon className="w-5 h-5 text-ocean-400" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-600">{item.label}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Products — Floating cloud cards ── */}
            <section className="py-20 lg:py-32">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-end justify-between mb-14">
                        <div>
                            <span className="text-[11px] font-semibold text-ocean-500 uppercase tracking-[0.2em]">Ürün Vitrini</span>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight">Popüler Test Kitleri</h2>
                            <p className="mt-3 text-slate-400 max-w-lg leading-relaxed">En çok tercih edilen alerjen ve gıda güvenliği hızlı test kitlerimiz.</p>
                        </div>
                        <Link
                            to="/urunler"
                            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                        >
                            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {products.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[400px] pebble-card animate-pulse !bg-ocean-50/30" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col pebble-card overflow-hidden"
                                >
                                    <Link to={`/urunler/${product.slug}`} className="aspect-[4/3] bg-gradient-to-br from-mint-50/40 to-ocean-50/30 p-10 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
                                        />
                                    </Link>
                                    <div className="p-7 flex flex-col flex-1 justify-between gap-5">
                                        <div>
                                            {product.brand && (
                                                <span className="text-[10px] font-semibold text-ocean-500 uppercase tracking-[0.15em]">{product.brand}</span>
                                            )}
                                            <Link to={`/urunler/${product.slug}`}>
                                                <h3 className="text-[15px] font-semibold text-slate-600 line-clamp-2 group-hover:text-ocean-600 transition-colors duration-300 leading-snug mt-1.5">
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            {product.description && (
                                                <p className="text-[12px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setQuoteProduct({ id: product.id, name: product.title })}
                                            className="btn-warm w-full !text-[13px] !py-3"
                                        >
                                            Teklif Al
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 text-center sm:hidden">
                        <Link
                            to="/urunler"
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                        >
                            Tüm Ürünleri Gör <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Latest Research — Magazine-style ── */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-transparent via-mint-50/30 to-transparent">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-end justify-between mb-14">
                        <div>
                            <span className="text-[11px] font-semibold text-ocean-500 uppercase tracking-[0.2em]">Bilgi Portalı</span>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight">Son Araştırmalar</h2>
                            <p className="mt-3 text-slate-400 max-w-lg leading-relaxed">Gıda güvenliği ve alerjen yönetimi üzerine güncel bilimsel içerikler.</p>
                        </div>
                        <Link
                            to="/arastirmalar"
                            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                        >
                            Tümünü Oku <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {articles.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[360px] pebble-card animate-pulse !bg-ocean-50/20" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {articles.map((article, idx) => (
                                <Link
                                    key={article.id}
                                    to={`/arastirmalar/${article.slug}`}
                                    className={`group flex flex-col pebble-card overflow-hidden ${
                                        idx === 0 ? 'md:col-span-2 md:flex-row' : ''
                                    }`}
                                >
                                    <div className={`bg-gradient-to-br from-ocean-50/40 to-mint-50/30 flex items-center justify-center overflow-hidden ${
                                        idx === 0 ? 'md:w-1/2 aspect-[16/10]' : 'aspect-[16/10]'
                                    }`}>
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <Leaf className="w-10 h-10 text-ocean-200" />
                                        )}
                                    </div>
                                    <div className={`p-7 flex flex-col justify-center ${idx === 0 ? 'md:w-1/2 md:p-10' : ''}`}>
                                        <span className="text-[10px] font-semibold text-ocean-500 uppercase tracking-[0.15em]">Araştırma</span>
                                        <h3 className={`font-semibold text-slate-600 group-hover:text-ocean-600 transition-colors duration-300 mt-2.5 line-clamp-2 leading-snug ${
                                            idx === 0 ? 'text-xl' : 'text-[15px]'
                                        }`}>
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className={`text-slate-400 mt-3 leading-relaxed ${idx === 0 ? 'text-sm line-clamp-3' : 'text-[12px] line-clamp-2'}`}>
                                                {article.excerpt}
                                            </p>
                                        )}
                                        <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ocean-500 group-hover:gap-2.5 transition-all duration-300">
                                            Devamını Oku <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA Section — Warm, inviting, not aggressive ── */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                {/* Soft gradient background instead of solid dark */}
                <div className="absolute inset-0 bg-gradient-to-br from-ocean-50 via-mint-50 to-peach-50/40" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-ocean-200/15 blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-coral-200/10 blur-[100px]" />

                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight">
                        Projeniz İçin Doğru Test Kitini Bulalım
                    </h2>
                    <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Uzman ekibimiz, üretim hattınıza en uygun alerjen test çözümünü belirlemek için yanınızda.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/iletisim"
                            className="btn-warm"
                        >
                            Ücretsiz Danışmanlık Al
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="https://wa.me/905320000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ocean"
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
