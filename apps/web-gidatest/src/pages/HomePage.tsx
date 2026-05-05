import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts, useArticles, useServices } from '@forlabs/core'
import type { Product, Article, Service } from '@forlabs/shared'
import {
    ArrowUpRight, ArrowRight, Calendar,
    Quote, Play, FlaskConical, BookOpen,
} from 'lucide-react'
import { getImageUrl, formatPrice } from '@/lib/utils'
import QuoteModal, { type QuoteProduct } from '@/components/QuoteModal'

export default function HomePage() {
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)

    const { data: productsRes, isLoading: loadingProducts } = useProducts()
    const { data: articlesRes, isLoading: loadingArticles } = useArticles()
    const { data: servicesRes, isLoading: loadingServices } = useServices()

    const products = (productsRes?.data ?? []) as Product[]
    const articles = (articlesRes?.data ?? []) as Article[]
    const services = (servicesRes?.data ?? []) as Service[]

    const featuredProducts = products.slice(0, 5)
    const featuredArticles = articles.slice(0, 3)
    const featuredServices = services.slice(0, 3)

    const openQuote = (p: Product) => {
        setQuoteProduct({
            id: p.id,
            title: p.title,
            image_url: p.image_url,
            brand: p.brand,
            model_number: p.model_number,
            description: p.description,
            price: p.price,
            currency: p.currency,
            sku: p.sku,
        })
        setQuoteOpen(true)
    }

    return (
        <>
            <title>GıdaTest — Gıda Analiz Cihazları & Test Kitleri</title>
            {/* ════════════════════════════════════════════════════════
                HERO — Editorial Magazine Cover
                ════════════════════════════════════════════════════════ */}
            <section className="relative pt-2 lg:pt-4 pb-16 lg:pb-24 overflow-hidden">
                {/* Soft gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-oat-50 via-oat-100 to-harvest-50/40 pointer-events-none" />
                <div className="glow-sage" style={{ width: 720, height: 720, top: '-25%', left: '-15%' }} />
                <div className="glow-harvest" style={{ width: 560, height: 560, bottom: '-20%', right: '-10%' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ─── EDITORIAL GRID: 12 cols ─── */}
                    <div className="grid grid-cols-12 gap-x-4 lg:gap-x-8 gap-y-8 items-center">
                        {/* LEFT — Oversized headline */}
                        <div className="col-span-12 lg:col-span-7 relative">
                            <h1 className="relative heading-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-forest-900">
                                Tarladan laboratuvara,<br />
                                <span className="italic text-sage-700">hassas analiz</span> ve<br />
                                <span className="italic text-harvest-600">saf güven.</span>
                            </h1>

                            <div className="mt-10 max-w-xl">
                                <p className="text-stone-600 text-base lg:text-lg leading-relaxed mb-8">
                                    Gıda endüstrisi ve tarım laboratuvarları için hassas analiz cihazları, hızlı test kitleri ve akredite uzman hizmetleri.
                                </p>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Link to="/urunler" className="btn-organic">
                                        Test Ekipmanlarını İncele <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link to="/bilgi-bankasi" className="btn-ghost-sage">
                                        Bilgi Bankasını Keşfet
                                    </Link>
                                </div>

                                {/* Mini meta info */}
                                <div className="mt-8 flex items-center gap-6 text-[11px] tracking-[0.1em] uppercase text-stone-500 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                                        ISO 17025 Uyumluluk
                                    </div>
                                    <span className="w-px h-4 bg-stone-300" />
                                    <div className="text-forest-800">Sektörel Uzmanlık</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Editorial showcase: büyük pastel blob + dekupe lab cihazı + bitki öğeleri */}
                        <div className="col-span-12 lg:col-span-5 relative flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-[520px] aspect-[4/5]">
                                {/* Ana pastel blob zemin */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-sage-100 via-oat-100 to-harvest-100 shadow-[0_32px_60px_-20px_rgba(26,51,32,0.2)]"
                                    style={{ borderRadius: '58% 42% 60% 40% / 50% 58% 42% 50%' }}
                                />
                                <div
                                    className="absolute inset-0 noise-grain opacity-[0.06] mix-blend-multiply pointer-events-none"
                                    style={{ borderRadius: '58% 42% 60% 40% / 50% 58% 42% 50%' }}
                                />

                                <img
                                    src="/images/hero-composition.png"
                                    alt="Gıda Analiz Ekosistemi"
                                    className="absolute inset-0 m-auto w-[90%] max-h-[85%] object-contain mix-blend-multiply animate-organic-float drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                ECOSYSTEM BANNER — ince tipografik bant
                ════════════════════════════════════════════════════════ */}
            <section className="relative py-12 lg:py-16 bg-transparent overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-oat-50/50 border border-stone-200 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-10"
                        style={{ borderTopLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}>
                        <div className="max-w-xl text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage-100 text-sage-800 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-sage-600" /> For-Labs Ecosystem
                            </div>
                            <h2 className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-forest-900 leading-tight mb-4 text-balance">
                                Gıda güvenliği standartlarını <span className="italic text-sage-700">teknolojiyle</span> yükseltiyoruz.
                            </h2>
                            <p className="text-stone-600 text-base leading-relaxed">
                                Türkiye'nin önde gelen laboratuvar ekosistemi olarak, analiz cihazlarından akredite test hizmetlerine kadar her aşamada uçtan uca çözümler sunuyoruz.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 sm:gap-y-10 gap-x-12 lg:gap-x-16 shrink-0 items-center justify-items-center lg:justify-items-end">
                            {[
                                { name: 'For-Labs', logo: '/ecosystem/for-labs.svg', className: 'h-5 sm:h-6' },
                                { 
                                    name: 'Atago TR', 
                                    isText: true,
                                    type: 'atago'
                                },
                                { 
                                    name: 'Gıda Kimya', 
                                    isText: true,
                                    type: 'gidakimya'
                                },
                                { name: 'Lab Kurulum', logo: '/ecosystem/lab-kurulum.svg', className: 'h-6 sm:h-7' },
                                { name: 'Alerjen', logo: '/ecosystem/alerjen.png', className: 'h-6 sm:h-7' },
                                { name: 'Hijyen Kontrol', logo: '/ecosystem/hijyen-kontrol.svg', className: 'h-9 sm:h-10' }
                            ].map((site) => (
                                site.isText ? (
                                    site.type === 'atago' ? (
                                        <div key={site.name} className="flex items-baseline opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 scale-90 sm:scale-100 cursor-default select-none">
                                            <span className="font-black text-base sm:text-lg tracking-[-0.05em] text-[#00398f]" style={{ fontFamily: 'Arial Black, Inter, sans-serif' }}>ATAGO</span>
                                            <span className="font-extrabold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-br from-[#0052cc] to-[#0ea5e9] ml-px" style={{ fontFamily: 'Inter, sans-serif' }}>TR</span>
                                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#f97316] ml-1 mb-0.5 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                        </div>
                                    ) : (
                                        <div key={site.name} className="flex items-center opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 scale-90 sm:scale-100 cursor-default select-none">
                                            <span className="text-base sm:text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600">Gıda</span>
                                            <span className="text-base sm:text-lg font-medium text-slate-400 mx-0.5">/</span>
                                            <span className="text-base sm:text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#0284c7] to-[#38bdf8]">Kimya</span>
                                        </div>
                                    )
                                ) : (
                                    <img 
                                        key={site.name} 
                                        src={site.logo} 
                                        alt={site.name} 
                                        className={`${site.className} object-contain opacity-60 hover:opacity-100 transition-all duration-300 mix-blend-multiply grayscale hover:grayscale-0`} 
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                FEATURED PRODUCTS — Editorial asymmetric product spread
                ════════════════════════════════════════════════════════ */}
            <section className="relative py-20 lg:py-28 overflow-hidden bg-oat-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Magazine spread header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14 lg:mb-20">
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-12 h-px bg-forest-900" />
                                <span className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-forest-900">Analitik Cihazlar</span>
                            </div>
                            <h2 className="heading-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-forest-900 max-w-2xl text-balance">
                                Laboratuvarınızda <span className="italic text-sage-700">teknolojik</span> bir temel inşa edin.
                            </h2>
                        </div>
                        <Link
                            to="/urunler"
                            className="group inline-flex items-center gap-3 text-forest-900 font-bold text-sm hover:text-sage-700 transition-colors"
                        >
                            <span className="border-b-2 border-forest-900 group-hover:border-sage-700 pb-1">Tüm Cihazlar &amp; Kitler</span>
                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-[420px] animate-pulse bg-oat-200" style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }} />
                            ))}
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-[420px] animate-pulse bg-sage-100/50" style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {featuredProducts.map((p) => (
                                <ProductCard key={p.id} product={p} onQuote={() => openQuote(p)} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                EDITORIAL QUOTE STRIP
                ════════════════════════════════════════════════════════ */}
            <section className="group relative py-16 lg:py-20 bg-white overflow-hidden border-y border-stone-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                        {/* Quote Content */}
                        <div className="max-w-2xl relative">
                            {/* Subtle Background Quote Mark */}
                            <div className="absolute -top-12 -left-8 text-sage-100/40 select-none pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                                <Quote size={110} strokeWidth={0.6} />
                            </div>
                            
                            <div className="relative z-10">
                                <p className="heading-serif text-2xl sm:text-3xl lg:text-4xl leading-[1.15] text-forest-900 tracking-tight">
                                    “Güvenilir sonuç,
                                    <span className="italic text-sage-700"> doğru yöntemle</span> başlar;
                                    bilimsel raporla <span className="text-harvest-600 font-medium">sona erer.</span>”
                                </p>
                                
                                <div className="mt-8 flex items-center gap-4">
                                    <span className="w-8 h-px bg-harvest-400" />
                                    <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-400">
                                        GıdaTest Analitik Vizyon
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Visual — No Card Frame */}
                        <div className="relative w-full max-w-[320px] lg:max-w-[400px]">
                            <img 
                                src="/images/quote-section.png" 
                                alt="Analitik Görsel" 
                                className="w-full h-auto object-contain mix-blend-multiply opacity-90 transition-all duration-1000 ease-out group-hover:scale-105 group-hover:-translate-y-2" 
                            />
                            {/* Minimal Swiss Accent */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b border-r border-harvest-400/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                SERVICES — Editorial "Bölümler"
                ════════════════════════════════════════════════════════ */}
            <section className="relative py-20 lg:py-28 bg-oat-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-12 gap-6 lg:gap-8 mb-14 lg:mb-20">
                        <div className="col-span-12 lg:col-span-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-12 h-px bg-forest-900" />
                                <span className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-forest-900">Uzman Hizmetleri</span>
                            </div>
                            <h2 className="heading-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-forest-900 text-balance">
                                Gıda analizi için uzman ekip danışmanlığı.
                            </h2>
                        </div>
                        <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex items-end">
                            <p className="text-stone-600 text-base lg:text-lg leading-relaxed">
                                Akredite laboratuvarımızda mikrobiyolojik, kimyasal ve fizikokimyasal analizler, kalibrasyon ve mevzuat danışmanlığı ile uzman ekibimizden tam destek.
                            </p>
                        </div>
                    </div>

                    {loadingServices ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-64 animate-pulse bg-oat-200" style={{ borderRadius: i % 2 === 0 ? '3rem 0 3rem 0' : '0 3rem 0 3rem' }} />
                            ))}
                        </div>
                    ) : featuredServices.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-64 animate-pulse bg-sage-100/50" style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {featuredServices.map((s, i) => (
                                <EditorialServiceCard key={s.id} service={s} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                ARTICLES — Bilgi Bankası / Editorial
                ════════════════════════════════════════════════════════ */}
            <section className="relative py-20 lg:py-28 bg-oat-100 overflow-hidden border-t border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-12 h-px bg-forest-900" />
                                <span className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-forest-900">Bilgi Bankası</span>
                            </div>
                            <h2 className="heading-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-forest-900 max-w-2xl text-balance">
                                Bilgi Bankası
                            </h2>
                        </div>
                        <Link to="/bilgi-bankasi" className="group inline-flex items-center gap-3 text-forest-900 font-bold text-sm hover:text-sage-700 transition-colors">
                            <span className="border-b-2 border-forest-900 group-hover:border-sage-700 pb-1">Arşivi Gezin</span>
                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {loadingArticles ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse bg-oat-200 rounded-[2rem_0_2rem_0]" />)}
                        </div>
                    ) : featuredArticles.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-80 animate-pulse bg-sage-100/50" style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {featuredArticles.map((a, i) => (
                                <EditorialArticleCard key={a.id} article={a} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                FINAL CTA — Issue back cover
                ════════════════════════════════════════════════════════ */}
            <section className="relative py-20 lg:py-28 overflow-hidden bg-oat-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-sage-700 p-12 lg:p-20"
                        style={{ borderTopLeftRadius: '4rem', borderBottomRightRadius: '4rem' }}
                    >
                        <div className="absolute inset-0 opacity-[0.03] noise-grain pointer-events-none" />

                        <div className="relative z-10 max-w-3xl">
                            <p className="label-eyebrow !text-harvest-300 mb-5">Hemen Başla</p>
                            <h2 className="heading-serif text-4xl sm:text-5xl lg:text-6xl !text-white mb-7 leading-[0.95] text-balance">
                                Laboratuvar Analizi Başlatın.
                            </h2>
                            <p className="text-white/90 text-lg leading-relaxed mb-10 max-w-2xl">
                                Uzman ekibimiz talebinizi 24 saat içinde değerlendirir; size özel teklif ve zaman planıyla dönüş yapar.
                            </p>
                            <div className="flex flex-wrap items-center gap-5">
                                <Link to="/iletisim" className="btn-harvest !py-4 !px-8">
                                    Sipariş Oluştur <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/hizmetler" className="inline-flex items-center gap-2 text-oat-100 font-semibold text-sm hover:text-harvest-300 transition-colors">
                                    <span className="w-9 h-9 bg-oat-100/10 border border-oat-100/20 flex items-center justify-center" style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                        <Play className="w-3 h-3" />
                                    </span>
                                    Hizmetleri Keşfet
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {quoteProduct && (
                <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} product={quoteProduct} />
            )}
        </>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT CARD — Clean, image-centered design
// ═══════════════════════════════════════════════════════════════════════
function ProductCard({ product, onQuote }: { product: Product; onQuote: () => void }) {
    return (
        <div
            className="group relative bg-white border border-stone-200/60 overflow-hidden flex flex-col shadow-[0_2px_12px_-6px_rgba(26,51,32,0.06)] hover:shadow-[0_20px_50px_-16px_rgba(26,51,32,0.14)] hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
        >
            {/* Image Area */}
            <Link to={`/urunler/${product.slug}`} className="relative h-[280px] bg-gradient-to-br from-sage-50/50 via-oat-50 to-harvest-50/30 flex items-center justify-center p-8 overflow-hidden">
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url) || ''}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-20 h-20 bg-sage-100 flex items-center justify-center" style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                        <ArrowUpRight className="w-8 h-8 text-sage-300" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.brand && (
                        <span
                            className="text-[9px] font-bold tracking-[0.2em] uppercase bg-white/90 backdrop-blur-sm border border-stone-200/50 text-sage-800 px-2.5 py-1 shadow-sm"
                            style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                        >
                            {product.brand}
                        </span>
                    )}
                    {product.campaign_label && (
                        <span
                            className="text-[9px] font-bold tracking-[0.2em] uppercase bg-harvest-400 text-forest-900 px-2.5 py-1 shadow-sm"
                            style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                        >
                            {product.campaign_label}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6 lg:p-7">
                <Link to={`/urunler/${product.slug}`} className="block mb-3">
                    <h3 className="heading-serif text-xl lg:text-2xl text-forest-900 leading-tight tracking-tight group-hover:text-sage-700 transition-colors line-clamp-2">
                        {product.title}
                    </h3>
                </Link>

                {product.description && (
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-5">{product.description}</p>
                )}

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
                    <div>
                        {product.price ? (
                            <span className="text-lg font-extrabold text-forest-900">{formatPrice(product.price, product.currency)}</span>
                        ) : (
                            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Fiyat İçin Arayın</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onQuote}
                            className="btn-organic !py-2 !px-4 !text-[11px]"
                        >
                            Sipariş Oluştur
                        </button>
                        <Link
                            to={`/urunler/${product.slug}`}
                            className="w-9 h-9 flex items-center justify-center border border-stone-200 hover:border-sage-400 hover:bg-sage-50 text-stone-500 hover:text-sage-700 transition-all"
                            style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICE CARD — Clean, no SVG decorations
// ═══════════════════════════════════════════════════════════════════════
function EditorialServiceCard({ service, index }: { service: Service; index: number }) {
    const bgs = [
        'bg-gradient-to-br from-harvest-50 via-oat-50 to-white',
        'bg-gradient-to-br from-sage-50 via-oat-50 to-white',
        'bg-gradient-to-br from-oat-100 via-oat-50 to-white',
    ]

    return (
        <Link
            to={`/hizmetler/${service.slug}`}
            className={`group relative ${bgs[index % bgs.length]} border border-stone-200/60 p-8 lg:p-10 min-h-[320px] flex flex-col overflow-hidden shadow-[0_2px_12px_-6px_rgba(26,51,32,0.06)] hover:shadow-[0_20px_50px_-16px_rgba(26,51,32,0.14)] hover:-translate-y-1.5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]`}
            style={index % 2 === 0
                ? { borderTopLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }
                : { borderTopRightRadius: '2.5rem', borderBottomLeftRadius: '2.5rem' }
            }
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="w-10 h-10 bg-sage-100 flex items-center justify-center mb-6" style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                    <span className="text-sage-600 text-lg font-bold heading-serif">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="heading-serif text-2xl lg:text-3xl text-forest-900 leading-[1] group-hover:text-sage-700 transition-colors mb-5 tracking-tight">
                    {service.title}
                </h3>
                {service.description && (
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-6">{service.description}</p>
                )}
                <span className="mt-auto inline-flex items-center gap-2 text-[12px] font-bold text-forest-900 group-hover:text-harvest-600 transition-all">
                    Detaylı Bilgi <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// EDITORIAL ARTICLE CARD
// ═══════════════════════════════════════════════════════════════════════
function EditorialArticleCard({ article, index }: { article: Article; index: number }) {
    const radius = index % 2 === 0
        ? { borderTopLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }
        : { borderTopRightRadius: '2.5rem', borderBottomLeftRadius: '2.5rem' }

    return (
        <Link
            to={`/bilgi-bankasi/${article.slug}`}
            className="group relative bg-white border border-stone-200/80 overflow-hidden flex flex-col shadow-[0_4px_20px_-10px_rgba(26,51,32,0.06)] hover:shadow-[0_24px_54px_-16px_rgba(26,51,32,0.16)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5"
            style={radius}
        >
            <div className="noise-grain absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" />
            
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-sage-100 via-oat-50 to-harvest-100">
                {article.cover_image_url ? (
                    <img
                        src={getImageUrl(article.cover_image_url) || ''}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        {/* Geometric accent circles */}
                        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-sage-200/30 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-harvest-200/25 pointer-events-none" />
                        {/* Icon placeholder */}
                        <div
                            className="relative z-10 w-16 h-16 bg-white/70 backdrop-blur-sm border border-sage-200/60 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-700"
                            style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}
                        >
                            <BookOpen className="w-7 h-7 text-sage-500" />
                        </div>
                        <span className="relative z-10 text-[9px] font-bold tracking-[0.3em] uppercase text-sage-600/70">Makale</span>
                    </div>
                )}
                <div
                    className="absolute top-5 left-5 bg-white/90 backdrop-blur border border-stone-200/60 px-3 py-1.5 text-[9px] font-bold tracking-[0.25em] uppercase text-sage-800 shadow-sm"
                    style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                >
                    Makale İncelemesi
                </div>
            </div>

            <div className="p-8 lg:p-9 flex-1 flex flex-col">
                <div className="flex items-center gap-2.5 text-[11px] text-stone-400 font-medium mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.created_at && new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {article.author && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-stone-200" />
                            <span className="text-stone-500 italic">{article.author}</span>
                        </>
                    )}
                </div>
                <h3 className="heading-serif text-2xl lg:text-3xl text-forest-900 leading-[1.05] group-hover:text-forest-950 transition-colors line-clamp-3 mb-5 tracking-tight">
                    {article.title}
                </h3>
                {article.excerpt && (
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-7 opacity-90">{article.excerpt}</p>
                )}
                <span className="mt-auto inline-flex items-center gap-2.5 text-[12.5px] font-bold text-forest-900 group-hover:text-harvest-600 transition-all">
                    Yazıyı Oku <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
            </div>
        </Link>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════
export function EmptyState({ title, message }: { title: string; message: string }) {
    return (
        <div
            className="relative bg-oat-50 border border-dashed border-stone-300 p-12 lg:p-16 text-center overflow-hidden"
            style={{ borderTopLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}
        >
            {/* Geometric decorative accents */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-sage-100/40 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-harvest-100/30 pointer-events-none" />
            <div className="relative z-10 max-w-lg mx-auto">
                <div
                    className="w-14 h-14 bg-sage-100 flex items-center justify-center mx-auto mb-5"
                    style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                >
                    <FlaskConical className="w-6 h-6 text-sage-500" />
                </div>
                <p className="label-eyebrow mb-3">Boş Bölüm</p>
                <h3 className="heading-serif text-2xl lg:text-3xl mb-3">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{message}</p>
            </div>
        </div>
    )
}
