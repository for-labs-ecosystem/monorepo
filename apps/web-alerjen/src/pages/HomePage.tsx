import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf } from 'lucide-react'
import { useProducts, useArticles } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'
import type { QuoteProduct } from '@/components/QuoteModal'
import type { Product, Article } from '@forlabs/shared'

export default function HomePage() {
    const { data: productsData } = useProducts({ limit: 6, is_featured: 1 })
    const { data: articlesData } = useArticles({ limit: 3 })

    const products = (productsData?.data ?? []) as Product[]
    const articles = (articlesData?.data ?? []) as Article[]

    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)

    return (
        <>
            <title>Alerjen — Gıda Güvenliği & Alerjen Hızlı Test Kitleri</title>
            {/* ── Hero — Deep breath, two-column ── */}
            <section className="relative overflow-hidden">
                {/* Ambient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-mint-50 via-white to-peach-50/60" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-ocean-200/10 blur-[80px] animate-glow-pulse" style={{ willChange: 'transform, opacity' }} />
                <div className="absolute bottom-[-20%] left-[10%] w-[400px] h-[400px] rounded-full bg-coral-200/10 blur-[60px] animate-glow-pulse" style={{ animationDelay: '3s', willChange: 'transform, opacity' }} />

                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-16 pb-12 lg:pt-20 lg:pb-16">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* ── Left: Typography ── */}
                        <div className="max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] tracking-tight leading-[1.1]">
                                <span className="block font-light text-slate-500 mb-1" style={{ fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.01em' }}>
                                    Gıda Güvenliği İçin
                                </span>
                                <span
                                    className="block font-extrabold"
                                    style={{
                                        background: 'linear-gradient(135deg, #e8612c 0%, #f0923b 40%, #f5a623 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 2px 12px rgba(232,97,44,0.18))'
                                    }}
                                >
                                    Alerjen Test Kitleri
                                </span>
                            </h1>
                            <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed font-light max-w-lg">
                                Gıda endüstrisi için hızlı alerjen ve kontaminasyon test kitleri.
                                Bilimsel doğrulukla üretim hattınızı güvence altına alın.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link to="/urunler" className="btn-warm">
                                    Test Kitlerini Keşfet
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/iletisim" className="btn-ocean">
                                    Ücretsiz Danışmanlık
                                </Link>
                            </div>
                        </div>

                        {/* ── Right: Interactive Banner Image ── */}
                        <div className="relative flex items-center justify-center lg:justify-end">
                            {/* Soft glow ring behind the image */}
                            <div className="absolute inset-0 m-auto w-[420px] h-[420px] rounded-full bg-gradient-to-br from-ocean-200/20 via-mint-200/15 to-peach-200/20 blur-[60px] animate-glow-pulse" />
                            {/* Decorative orbit ring */}
                            <div className="absolute inset-0 m-auto w-[460px] h-[460px] rounded-full border border-ocean-100/30 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
                            {/* Image container */}
                            <div
                                className="relative z-10 group cursor-default"
                                style={{ filter: 'drop-shadow(0 20px 60px rgba(56,189,186,0.12)) drop-shadow(0 8px 24px rgba(56,189,186,0.08))' }}
                            >
                                <img
                                    src="/alerjen-banner.png"
                                    alt="Alerjen Test Kiti Uzmanı"
                                    loading="eager"
                                    decoding="async"
                                    className="w-full max-w-[480px] lg:max-w-[520px] h-auto animate-float object-contain
                                               transition-transform duration-700 ease-out
                                               group-hover:scale-[1.03] group-hover:-translate-y-2"
                                    draggable={false}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── Info Tiles — floating on page background, no card ── */}
            <section className="relative pb-10 lg:pb-14">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 lg:gap-x-10">
                        {[
                            { img: '/info-cart1.png', label: 'Geniş Marka ve Ürün Portföyü', desc: 'Dünyanın önde gelen test kiti üreticilerini ve global referans markalarını tek bir çatı altında sunuyoruz.' },
                            { img: '/info-cart2.png', label: 'Çoklu Metodoloji Seçeneği', desc: 'Lateral Flow, ELISA veya PCR... Numune matrisinize ve tesisinize en uygun doğrulama metodolojisine ulaşın.' },
                            { img: '/info-cart3.png', label: 'Objektif Uzman Yönlendirmesi', desc: 'Sadece ürün tedarik etmiyor; prosesiniz için en doğru, hızlı ve maliyet-etkin çözümü belirlemenize rehberlik ediyoruz.' },
                            { img: '/info-cart4.png', label: 'For-Labs Stok ve Destek Güvencesi', desc: 'Üretiminizin aksamaması için güçlü lojistik ağı, sürekli stok bulunabilirliği ve Protek Analitik teknik desteği.' },
                        ].map((item, i) => (
                            <div
                                key={item.label}
                                className="group flex flex-col items-center text-center cursor-default"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Floating illustration */}
                                <div className="relative mb-5 w-[160px] h-[135px] flex items-center justify-center">
                                    <img
                                        src={item.img}
                                        alt={item.label}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 drop-shadow-md"
                                        draggable={false}
                                    />
                                </div>

                                {/* Accent underline on hover */}
                                <div className="w-8 h-[2.5px] rounded-full mb-3 transition-all duration-400 ease-out opacity-0 group-hover:opacity-100 group-hover:w-12"
                                    style={{ background: 'linear-gradient(90deg, #e8612c, #f5a023)' }} />

                                {/* Text */}
                                <p className="text-[14px] font-bold text-slate-700 leading-snug mb-2 transition-colors duration-300 group-hover:text-orange-600">{item.label}</p>
                                <p className="text-[12px] text-slate-400 leading-relaxed max-w-[220px]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Products — Floating cloud cards ── */}
            <section className="py-12 lg:py-20">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="pebble-card h-[380px] animate-pulse !bg-ocean-50/20" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 4).map((product) => (
                                <div key={product.id} className="group flex flex-col pebble-card overflow-hidden">
                                    <Link
                                        to={`/urunler/${product.slug}`}
                                        className="aspect-square bg-gradient-to-br from-mint-50/40 to-ocean-50/20 p-10 flex items-center justify-center overflow-hidden relative"
                                    >
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                                            {Boolean(product.is_featured) && (
                                                <div className="bg-ocean-50/80 backdrop-blur-md text-ocean-600 border border-ocean-200/30 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                                                    Popüler
                                                </div>
                                            )}
                                            {product.brand && (
                                                <div className="bg-white/70 backdrop-blur-md text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                                                    {product.brand}
                                                </div>
                                            )}
                                        </div>
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
                                        />
                                    </Link>
                                    <div className="p-7 flex flex-col flex-1 justify-between gap-5">
                                        <div>
                                            <Link to={`/urunler/${product.slug}`}>
                                                <h3 className="text-[15px] font-semibold text-slate-600 line-clamp-2 group-hover:text-ocean-600 transition-colors duration-300 leading-snug">
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            {product.model_number && (
                                                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                                                    Model: <span className="text-slate-500">{product.model_number}</span>
                                                </p>
                                            )}
                                            {product.description && (
                                                <p className="text-[12px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setQuoteProduct({ id: product.id, title: product.title, image_url: product.image_url, brand: product.brand, model_number: product.model_number, description: product.description, price: product.price, currency: product.currency, sku: product.sku })}
                                            className="btn-warm w-full !text-[13px] !py-3"
                                        >
                                            Bu Ürün İçin Teklif Al
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

            {/* ── Latest Research — Rich Pebble Grid ── */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-transparent via-mint-50/30 to-transparent">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

                    {/* Section header */}
                    <div className="flex items-end justify-between mb-14">
                        <div>
                            <span className="text-[11px] font-semibold text-ocean-500 uppercase tracking-[0.2em]">Bilgi Portalı</span>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight">Son Araştırmalar</h2>
                            <p className="mt-3 text-slate-400 max-w-lg leading-relaxed font-light">
                                Gıda güvenliği ve alerjen yönetimi üzerine güncel bilimsel içerikler ve rehberler.
                            </p>
                        </div>
                        <Link
                            to="/arastirmalar"
                            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                        >
                            Tümünü Oku <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Article grid */}
                    {articles.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[380px] pebble-card animate-pulse !bg-ocean-50/20" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {articles.slice(0, 3).map((article) => (
                                <Link
                                    key={article.id}
                                    to={`/arastirmalar/${article.slug}`}
                                    className="group flex flex-col pebble-card overflow-hidden transition-all duration-400 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1)]"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-ocean-50 to-mint-50 flex items-center justify-center">
                                                <Leaf className="w-10 h-10 text-ocean-200" />
                                            </div>
                                        )}
                                        {/* Category Badge overlaying the image */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <div className="bg-white/80 backdrop-blur-md text-ocean-600 px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm">
                                                Makale
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-7 flex flex-col flex-1">
                                        <h3 className="text-[16px] font-bold text-slate-700 leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors duration-300">
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className="mt-2.5 text-[12.5px] text-slate-500 leading-relaxed line-clamp-3">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        {/* Meta Footer */}
                                        <div className="mt-auto pt-6 flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-ocean-500 group-hover:gap-2 transition-all duration-300">
                                                Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Mobile CTA */}
                    <div className="mt-10 sm:hidden flex justify-center">
                        <Link
                            to="/arastirmalar"
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                        >
                            Tümünü Oku <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
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
                    product={quoteProduct!}
                />
            )}
        </>
    )
}
