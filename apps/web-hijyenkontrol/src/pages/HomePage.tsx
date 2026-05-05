import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, FlaskConical, Microscope, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useArticles, useCategories } from '@forlabs/core'
import type { Product, Article, Category } from '@forlabs/shared'
import { getImageUrl, formatPrice } from '@/lib/utils'
import QuoteModal, { type QuoteProduct } from '@/components/QuoteModal'
import {
    LuminometerIllustration, SwabIllustration, MicroscopeIllustration,
    PetriDishIllustration, WaterDropIllustration, ValidationShieldIllustration,
    resolveCategoryIllustration,
} from '@/components/CategoryIllustrations'

/* ─── Static fallback categories — only used if CMS returns none ─── */
const FALLBACK_CATEGORIES: Array<{ slug: string; name: string; illustration: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
    { slug: 'atp-luminometreler', name: 'ATP Luminometreler', illustration: LuminometerIllustration },
    { slug: 'yuzey-test-kitleri', name: 'Yüzey Test Kitleri', illustration: MicroscopeIllustration },
    { slug: 'allerjen-swaplari', name: 'Allerjen Swabları', illustration: SwabIllustration },
    { slug: 'patojen-testleri', name: 'Patojen Testleri', illustration: PetriDishIllustration },
    { slug: 'su-hijyen-kitleri', name: 'Su & Hijyen Kitleri', illustration: WaterDropIllustration },
    { slug: 'validasyon-kitleri', name: 'Validasyon Kitleri', illustration: ValidationShieldIllustration },
]

export default function HomePage() {
    const { data: productsRes } = useProducts({ limit: 12, is_featured: 1 })
    const { data: articlesRes } = useArticles({ limit: 3 })
    const { data: categoriesRes } = useCategories()

    const products = (productsRes?.data ?? []) as Product[]
    const articles = (articlesRes?.data ?? []) as Article[]
    const apiCategories = (categoriesRes?.data ?? []) as Category[]

    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)
    const [activeFilter, setActiveFilter] = useState<number | 'all'>('all')

    /* ─── Category tiles ─── */
    const categoryTiles = apiCategories.length > 0
        ? apiCategories.slice(0, 6).map((c) => ({ slug: c.slug, name: c.name, illustration: resolveCategoryIllustration(c.name), id: c.id }))
        : FALLBACK_CATEGORIES.map((c, i) => ({ ...c, id: -(i + 1) }))

    /* ─── Popular products filter ─── */
    const filterChips = useMemo(() => {
        const chips: Array<{ id: number | 'all'; label: string }> = [{ id: 'all', label: 'TÜMÜ' }]
        apiCategories.slice(0, 4).forEach((c) => chips.push({ id: c.id, label: c.name.toUpperCase() }))
        return chips
    }, [apiCategories])

    const filteredProducts = useMemo(() => {
        if (activeFilter === 'all') return products
        return products.filter((p) => p.category_id === activeFilter)
    }, [products, activeFilter])

    /* ─── Hero 3-card carousel — up to 6 featured products, center + side peeks ─── */
    const heroProducts = useMemo(() => products.slice(0, 6), [products])
    const heroCount = heroProducts.length
    const [heroIdx, setHeroIdx] = useState(0)
    const [heroPaused, setHeroPaused] = useState(false)

    useEffect(() => {
        if (heroCount <= 1 || heroPaused) return
        const id = window.setInterval(() => {
            setHeroIdx((i) => (i + 1) % heroCount)
        }, 5500)
        return () => window.clearInterval(id)
    }, [heroCount, heroPaused])

    const goPrev = () => setHeroIdx((i) => (i - 1 + heroCount) % heroCount)
    const goNext = () => setHeroIdx((i) => (i + 1) % heroCount)

    /** Determine slot role for each product relative to active index. */
    function getSlotRole(i: number): 'center' | 'left' | 'right' | 'hidden' {
        if (heroCount === 0) return 'hidden'
        const diff = ((i - heroIdx) + heroCount) % heroCount
        if (diff === 0) return 'center'
        if (diff === 1) return 'right'
        if (diff === heroCount - 1) return 'left'
        return 'hidden'
    }

    return (
        <>
            <title>HijyenKontrol | Yüzey Hijyen Test Kitleri & ATP Luminometreler</title>

            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-8 pb-20">
                {/* ════════════════════════════════════════════════════════════
                     HERO BANNER — big rounded card, centered copy, device on right
                   ════════════════════════════════════════════════════════════ */}
                <section className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-uv-100 via-white to-clean-100/80 border border-white/70 shadow-[0_28px_80px_-24px_rgba(6,182,212,0.32)]">
                    {/* ─── Layered rich background ─── */}
                    {/* L1 — soft radial spotlight, right side */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse 60% 70% at 75% 50%, rgba(6,182,212,0.18), transparent 70%)',
                        }}
                    />
                    {/* L2 — conic accent top-right */}
                    <div
                        className="pointer-events-none absolute -top-20 -right-20 w-[520px] h-[520px] opacity-55"
                        style={{
                            background: 'conic-gradient(from 120deg at 50% 50%, rgba(16,185,129,0.18), rgba(6,182,212,0.24), rgba(59,130,246,0.14), rgba(16,185,129,0.18))',
                            filter: 'blur(60px)',
                            borderRadius: '9999px',
                        }}
                    />
                    {/* L3 — uv blob top-left */}
                    <div className="pointer-events-none absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-uv-300/35 blur-3xl" />
                    {/* L4 — clean blob bottom-right */}
                    <div className="pointer-events-none absolute -bottom-40 -right-20 w-[540px] h-[540px] rounded-full bg-clean-300/35 blur-3xl" />
                    {/* L5 — central cool spotlight behind carousel */}
                    <div
                        className="pointer-events-none absolute top-1/2 right-[6%] -translate-y-1/2 w-[420px] h-[420px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.8), rgba(255,255,255,0) 65%)',
                            filter: 'blur(8px)',
                        }}
                    />

                    {/* L6 — atmospheric SVG dot/molecular pattern */}
                    <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.35]" aria-hidden="true">
                        <defs>
                            <pattern id="hk-hex-dots" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
                                <circle cx="22" cy="22" r="1.3" fill="currentColor" className="text-uv-500/60" />
                            </pattern>
                            <linearGradient id="hk-dot-mask" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="white" stopOpacity="0.0" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="white" stopOpacity="0.0" />
                            </linearGradient>
                            <mask id="hk-dots-fade">
                                <rect width="100%" height="100%" fill="url(#hk-dot-mask)" />
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hk-hex-dots)" mask="url(#hk-dots-fade)" />
                    </svg>

                    {/* L7 — diagonal light beam */}
                    <div
                        className="pointer-events-none absolute -inset-10 opacity-60"
                        style={{
                            background: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.55) 48%, transparent 60%)',
                            mixBlendMode: 'overlay',
                        }}
                    />

                    {/* L8 — ring atmosphere (decorative circles) */}
                    <div className="pointer-events-none absolute top-[14%] right-[20%] w-36 h-36 rounded-full border border-uv-300/25" />
                    <div className="pointer-events-none absolute bottom-[18%] right-[8%] w-24 h-24 rounded-full border border-clean-300/25" />

                    {/* L9 — fine micro-grid on top of everything */}
                    <div className="pointer-events-none absolute inset-0 micro-grid opacity-30" />

                    {/* ─── Hero content + carousel grid ─── */}
                    <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] gap-6 lg:gap-8 items-center">
                        {/* LEFT: concept copy */}
                        <div className="relative px-7 sm:px-12 lg:pl-16 lg:pr-0 py-14 sm:py-20 lg:py-24 max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-white/80 px-3.5 py-1.5 text-[10.5px] font-bold text-slate-600 tracking-[0.22em] uppercase mb-7 shadow-[0_2px_12px_-4px_rgba(6,182,212,0.2)]">
                                <span className="status-led !w-1.5 !h-1.5" />
                                SIFIR KONTAMİNASYON • TAM VALİDASYON
                            </span>

                            <h1 className="text-[34px] sm:text-[46px] lg:text-[58px] font-bold text-slate-900 leading-[1.04] tracking-tight mb-6">
                                <span className="whitespace-nowrap">Görünmeyeni Ölçün.</span> <br />
                                <span className="relative inline-block italic font-light text-slate-700">
                                    Riskleri Önleyin.
                                    <svg className="absolute -bottom-2 left-0 w-full h-2.5" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
                                        <path d="M2,6 Q50,2 100,5 T198,5" stroke="url(#hk-underline)" strokeWidth="2" fill="none" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="hk-underline" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#06b6d4" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-[15.5px] sm:text-[16.5px] text-slate-600 leading-relaxed max-w-lg mb-8">
                                ATP luminometreler, yüzey swab kitleri ve hızlı patojen testleriyle gıdadan medikale her tesiste klinik doğruluğunda hijyen denetimi.
                            </p>

                            {/* Trust strip */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-10">
                                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-uv-500 to-clean-500" />
                                    Global Markalar
                                </span>
                                <span className="h-3.5 w-px bg-slate-200" />
                                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-uv-500 to-clean-500" />
                                    Uluslararası Akreditasyon
                                </span>
                                <span className="h-3.5 w-px bg-slate-200" />
                                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-uv-500 to-clean-500" />
                                    Geniş Ürün Portföyü
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    to="/urunler"
                                    className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-uv-500 via-uv-600 to-clean-500 text-white pl-6 pr-2 py-2 text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_10px_28px_-8px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(6,182,212,0.75)]"
                                >
                                    Ürünleri Keşfet
                                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-uv-600" />
                                    </span>
                                </Link>
                                <Link
                                    to="/iletisim"
                                    className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-slate-700 px-5 py-3 text-[12.5px] font-semibold tracking-[0.08em] uppercase hover:bg-white hover:text-uv-700 transition-all duration-300"
                                >
                                    Demo talep et
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT: 3-card depth carousel */}
                        {heroCount > 0 && (
                            <div
                                className="relative px-4 pb-10 pt-4 sm:px-10 lg:pr-10 lg:pl-0 lg:py-16 select-none"
                                onMouseEnter={() => setHeroPaused(true)}
                                onMouseLeave={() => setHeroPaused(false)}
                            >
                                {/* Stage — fixed dimensions, overflow visible so side cards peek */}
                                <div className="relative h-[460px] sm:h-[480px] mx-auto" style={{ maxWidth: 480 }}>
                                    {heroProducts.map((p, i) => {
                                        const role = getSlotRole(i)
                                        const isCenter = role === 'center'

                                        // Transform & visual treatment per slot role
                                        let transform = 'translate(-50%, -50%) scale(0.55)'
                                        let opacityCls = 'opacity-0'
                                        let blurCls = ''
                                        let zCls = 'z-0'
                                        let pointerCls = 'pointer-events-none'

                                        if (role === 'center') {
                                            transform = 'translate(-50%, -50%) scale(1)'
                                            opacityCls = 'opacity-100'
                                            blurCls = ''
                                            zCls = 'z-30'
                                            pointerCls = ''
                                        } else if (role === 'left') {
                                            transform = 'translate(calc(-50% - 170px), -50%) scale(0.78) rotate(-6deg)'
                                            opacityCls = 'opacity-50'
                                            blurCls = 'blur-[2.5px]'
                                            zCls = 'z-10'
                                        } else if (role === 'right') {
                                            transform = 'translate(calc(-50% + 170px), -50%) scale(0.78) rotate(6deg)'
                                            opacityCls = 'opacity-50'
                                            blurCls = 'blur-[2.5px]'
                                            zCls = 'z-10'
                                        }

                                        return (
                                            <div
                                                key={p.id}
                                                className={`absolute top-1/2 left-1/2 w-[270px] sm:w-[290px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${opacityCls} ${blurCls} ${zCls} ${pointerCls}`}
                                                style={{ transform, transformOrigin: 'center' }}
                                                aria-hidden={!isCenter}
                                            >
                                                <div className={`rounded-[22px] overflow-hidden bg-white/90 backdrop-blur-xl border shadow-[0_18px_50px_-18px_rgba(6,182,212,0.35)] transition-all duration-500 ${
                                                    isCenter ? 'border-white' : 'border-white/70'
                                                }`}>
                                                    {/* Image zone — fixed height */}
                                                    <Link
                                                        to={`/urunler/${p.slug}`}
                                                        className="relative block h-[260px] flex items-center justify-center px-6 pt-6 pb-3"
                                                        aria-label={p.title}
                                                        tabIndex={isCenter ? 0 : -1}
                                                    >
                                                        <div className="absolute inset-0 micro-grid opacity-25" />
                                                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-32 rounded-full bg-gradient-to-br from-uv-100/60 via-white/0 to-clean-100/50 blur-3xl" />
                                                        {p.image_url ? (
                                                            <img
                                                                src={getImageUrl(p.image_url) || ''}
                                                                alt={p.title}
                                                                className="relative max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-[0_14px_28px_rgba(6,182,212,0.22)]"
                                                            />
                                                        ) : (
                                                            <FlaskConical className="relative w-16 h-16 text-uv-200" />
                                                        )}
                                                        {p.campaign_label && (
                                                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-uv-500 to-clean-500 text-white text-[9.5px] font-bold px-2.5 py-1 shadow-sm">
                                                                {p.campaign_label}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    {/* Info zone */}
                                                    <div className="px-5 pt-4 pb-5 border-t border-slate-100 bg-white flex flex-col min-h-[170px]">
                                                        {p.brand && (
                                                            <span className="text-[9.5px] font-bold text-uv-600 uppercase tracking-[0.2em] mb-1">
                                                                {p.brand}
                                                            </span>
                                                        )}
                                                        <h3 className="text-[14px] font-bold text-slate-900 leading-tight line-clamp-2 mb-3 min-h-[34px]">
                                                            {p.title}
                                                        </h3>
                                                        <div className="mt-auto flex items-center justify-between gap-2">
                                                            <Link
                                                                to={`/urunler/${p.slug}`}
                                                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-uv-600 text-white text-[10.5px] font-semibold tracking-[0.08em] uppercase px-3.5 py-2 transition-colors duration-300"
                                                                tabIndex={isCenter ? 0 : -1}
                                                            >
                                                                İncele
                                                                <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                            <button
                                                                onClick={() => setQuoteProduct({
                                                                    id: p.id, title: p.title, image_url: p.image_url, brand: p.brand,
                                                                    model_number: p.model_number, description: p.description,
                                                                    price: p.price, currency: p.currency, sku: p.sku,
                                                                })}
                                                                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-uv-700 hover:text-uv-900 transition-colors"
                                                                aria-label={`${p.title} sipariş oluştur`}
                                                                tabIndex={isCenter ? 0 : -1}
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                Sipariş Oluştur
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Prev / Next */}
                                    {heroCount > 1 && (
                                        <>
                                            <button
                                                onClick={goPrev}
                                                className="absolute top-1/2 -translate-y-1/2 left-0 z-40 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-[0_6px_18px_-4px_rgba(15,23,42,0.2)] flex items-center justify-center text-slate-600 hover:text-uv-700 hover:scale-105 transition-all duration-200"
                                                aria-label="Önceki ürün"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={goNext}
                                                className="absolute top-1/2 -translate-y-1/2 right-0 z-40 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-[0_6px_18px_-4px_rgba(15,23,42,0.2)] flex items-center justify-center text-slate-600 hover:text-uv-700 hover:scale-105 transition-all duration-200"
                                                aria-label="Sonraki ürün"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Dots */}
                                {heroCount > 1 && (
                                    <div className="relative z-40 flex items-center justify-center gap-2 mt-4">
                                        {heroProducts.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setHeroIdx(i)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    i === heroIdx ? 'w-7 bg-gradient-to-r from-uv-500 to-clean-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                                                }`}
                                                aria-label={`Slayt ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                     BENTO — two CTA cards (Teklif / Bilgi Bankası)
                   ════════════════════════════════════════════════════════════ */}
                <section className="grid md:grid-cols-2 gap-5 mt-5">
                    {/* CTA A — Teklif İste (UV tone) */}
                    <Link
                        to="/teklif"
                        className="group relative rounded-[28px] overflow-hidden bg-gradient-to-br from-uv-100 via-uv-50 to-uv-100/60 border border-uv-200/60 p-8 lg:p-9 min-h-[190px] flex items-center justify-between gap-6 transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(6,182,212,0.45)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 micro-grid opacity-40 pointer-events-none" />
                        <div className="relative flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-uv-700 uppercase tracking-[0.22em] mb-3">
                                <span className="status-led !w-1.5 !h-1.5" />
                                Uzman Destek
                            </span>
                            <h3 className="text-2xl lg:text-[28px] font-bold text-slate-900 leading-[1.15] tracking-tight mb-4 max-w-[260px]">
                                Tesisinize özel hijyen paketi
                            </h3>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-white/70 px-4 py-2 text-[11.5px] font-semibold text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300">
                                Teklif İste
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="relative shrink-0 w-36 sm:w-44 lg:w-52 aspect-square flex items-center justify-center">
                            <LuminometerIllustration className="relative w-28 h-28 sm:w-36 sm:h-36 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </Link>

                    {/* CTA B — Bilgi Bankası (Clean tone) */}
                    <Link
                        to="/bilgi-bankasi"
                        className="group relative rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-100 via-clean-50 to-slate-100/60 border border-slate-200 p-8 lg:p-9 min-h-[190px] flex items-center justify-between gap-6 transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 micro-grid opacity-35 pointer-events-none" />
                        <div className="relative flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-clean-700 uppercase tracking-[0.22em] mb-3">
                                <Microscope className="w-3 h-3" />
                                Araştırma
                            </span>
                            <h3 className="text-2xl lg:text-[28px] font-bold text-slate-900 leading-[1.15] tracking-tight mb-4 max-w-[260px]">
                                Hijyen araştırmaları &amp; rehberler
                            </h3>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-white/70 px-4 py-2 text-[11.5px] font-semibold text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300">
                                Bilgi Bankası
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="relative shrink-0 w-36 sm:w-44 lg:w-52 aspect-square flex items-center justify-center">
                            <PetriDishIllustration className="relative w-28 h-28 sm:w-36 sm:h-36 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500" />
                        </div>
                    </Link>
                </section>

                {/* ════════════════════════════════════════════════════════════
                     BROWSE BY CATEGORIES — row of soft tiles
                   ════════════════════════════════════════════════════════════ */}
                <section className="mt-20">
                    <div className="flex items-end justify-between mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Kategoriye göre keşfet
                        </h2>
                        <Link to="/urunler" className="hidden sm:inline-flex items-center gap-1 text-[12.5px] font-semibold text-slate-500 hover:text-uv-700 transition-colors">
                            Tüm Katalog <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {categoryTiles.map((cat) => {
                            const Illustration = cat.illustration
                            return (
                                <Link
                                    key={cat.slug}
                                    to={`/urunler?kategori=${encodeURIComponent(cat.slug)}`}
                                    className="group relative rounded-2xl bg-white border border-slate-200 overflow-hidden p-4 sm:p-5 min-h-[140px] sm:min-h-[150px] flex flex-col justify-between transition-all duration-300 hover:border-uv-400 hover:shadow-[0_20px_40px_-12px_rgba(6,182,212,0.25)] hover:-translate-y-1"
                                >
                                    {/* Subtle texture */}
                                    <div className="absolute inset-0 micro-grid opacity-30 pointer-events-none" />

                                    {/* Watermark illustration — bottom right, low opacity */}
                                    <Illustration className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 opacity-20 group-hover:opacity-35 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 pointer-events-none" />

                                    {/* Name (dominant) */}
                                    <h3 className="relative text-[14px] sm:text-[15px] font-bold text-slate-800 leading-tight tracking-tight group-hover:text-uv-700 transition-colors mt-1 mb-2 max-w-[85%]">
                                        {cat.name}
                                    </h3>

                                    {/* Bottom arrow indicator */}
                                    <span className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-uv-600 transition-colors">
                                        Ürünleri Keşfet
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                     POPULAR PRODUCTS — filter pills + product grid
                   ════════════════════════════════════════════════════════════ */}
                {products.length > 0 && (
                    <section className="mt-20">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Popüler ürünler
                            </h2>
                            {filterChips.length > 1 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {filterChips.map((chip) => {
                                        const active = activeFilter === chip.id
                                        return (
                                            <button
                                                key={String(chip.id)}
                                                onClick={() => setActiveFilter(chip.id)}
                                                className={`rounded-full px-4 py-2 text-[10.5px] font-bold tracking-[0.12em] transition-all duration-300 ${
                                                    active
                                                        ? 'bg-slate-900 text-white shadow-[0_6px_18px_-6px_rgba(15,23,42,0.45)]'
                                                        : 'bg-white/70 backdrop-blur-md text-slate-600 border border-slate-200 hover:border-slate-900 hover:text-slate-900'
                                                }`}
                                            >
                                                {chip.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                            {filteredProducts.slice(0, 8).map((p) => (
                                <div key={p.id} className="group relative">
                                    <Link
                                        to={`/urunler/${p.slug}`}
                                        className="glass-card p-5 flex flex-col h-full"
                                    >
                                        {/* Image area — fixed aspect, image always object-contain inside */}
                                        <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-uv-50/70 via-white to-clean-50/40 flex items-center justify-center overflow-hidden mb-4">
                                            <div className="absolute inset-0 micro-grid opacity-40 pointer-events-none" />
                                            {/* Interactive corner ticks (kept) */}
                                            <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-uv-300/60 rounded-tl" />
                                            <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-uv-300/60 rounded-tr" />
                                            <span className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-uv-300/60 rounded-bl" />
                                            <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-uv-300/60 rounded-br" />

                                            {p.image_url ? (
                                                <img
                                                    src={getImageUrl(p.image_url) || ''}
                                                    alt={p.title}
                                                    className="relative max-h-[80%] max-w-[80%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <FlaskConical className="w-12 h-12 text-uv-200" />
                                            )}

                                            {/* Campaign chip (kept as interactive accent) */}
                                            {p.campaign_label && (
                                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-uv-500 to-clean-500 text-white text-[9.5px] font-bold px-2.5 py-1 shadow-sm">
                                                    {p.campaign_label}
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand kicker */}
                                        {p.brand && (
                                            <span className="text-[10px] font-bold text-uv-600 uppercase tracking-[0.18em] mb-1.5">{p.brand}</span>
                                        )}

                                        {/* Title */}
                                        <h3 className="text-[14.5px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-uv-700 transition-colors line-clamp-2">
                                            {p.title}
                                        </h3>

                                        {/* Description */}
                                        {p.description && (
                                            <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                                        )}

                                        {/* Footer: price + arrow */}
                                        <div className="mt-auto pt-3 border-t border-uv-100/50 flex items-center justify-between">
                                            {p.price ? (
                                                <span className="text-[13.5px] font-bold text-uv-600">{formatPrice(p.price, p.currency)}</span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-medium">Teklif İste</span>
                                            )}
                                            <ArrowRight className="w-4 h-4 text-uv-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>

                                    {/* Hover-only quick quote button (interactive accent) */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setQuoteProduct({
                                                id: p.id, title: p.title, image_url: p.image_url, brand: p.brand,
                                                model_number: p.model_number, description: p.description,
                                                price: p.price, currency: p.currency, sku: p.sku,
                                            })
                                        }}
                                        className="absolute top-7 left-7 inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-[10.5px] font-semibold px-3.5 py-2 shadow-[0_6px_18px_-4px_rgba(15,23,42,0.45)] opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-uv-600 z-10"
                                        aria-label={`${p.title} için sipariş oluştur`}
                                    >
                                        <Send className="w-3 h-3" />
                                        Sipariş Oluştur
                                    </button>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-md p-16 text-center">
                                <FlaskConical className="w-12 h-12 text-uv-200 mx-auto mb-4" />
                                <p className="text-sm text-slate-500">Bu kategoride henüz ürün bulunmuyor.</p>
                            </div>
                        )}

                        <div className="flex justify-center mt-8">
                            <Link
                                to="/urunler"
                                className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 text-[12.5px] font-semibold px-5 py-2.5 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300"
                            >
                                Tüm ürünleri gör <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════════════════════════
                     ARTICLES TEASER
                   ════════════════════════════════════════════════════════════ */}
                {articles.length > 0 && (
                    <section className="mt-20">
                        <div className="flex items-end justify-between mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Bilgi bankasından
                            </h2>
                            <Link to="/bilgi-bankasi" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-slate-500 hover:text-clean-700 transition-colors">
                                Tüm Makaleler <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {articles.slice(0, 3).map((a) => (
                                <Link
                                    key={a.id}
                                    to={`/bilgi-bankasi/${a.slug}`}
                                    className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200 flex flex-col transition-all duration-400 hover:border-clean-300 hover:shadow-[0_16px_40px_-12px_rgba(16,185,129,0.25)] hover:-translate-y-0.5"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-uv-50/60 to-clean-50/40 overflow-hidden">
                                        {a.cover_image_url ? (
                                            <img
                                                src={getImageUrl(a.cover_image_url) || ''}
                                                alt={a.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Microscope className="w-12 h-12 text-uv-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug mb-2 group-hover:text-clean-700 transition-colors line-clamp-2">{a.title}</h3>
                                        {a.excerpt && (
                                            <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-3">{a.excerpt}</p>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-clean-600 mt-auto">
                                            Devamını oku <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════════════════════════
                     CTA
                   ════════════════════════════════════════════════════════════ */}
                <section className="mt-20">
                    <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 lg:p-14 text-center">
                        <div className="absolute inset-0 micro-grid opacity-10 pointer-events-none" />
                        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-uv-500/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-clean-500/20 blur-3xl" />
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                                Tesisinize özel <span className="bg-gradient-to-r from-uv-300 to-clean-300 bg-clip-text text-transparent">hijyen paketi</span>
                            </h2>
                            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto mb-8">
                                Uzmanlarımız üretim hatlarınızı analiz edip size özel bir hijyen denetim paketi hazırlasın.
                            </p>
                            <Link
                                to="/teklif"
                                className="inline-flex items-center gap-3 rounded-full bg-white text-slate-900 pl-6 pr-2 py-2 text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:bg-uv-400 hover:text-white hover:-translate-y-0.5"
                            >
                                Teklif İste
                                <span className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* Quote modal — triggered by product card buttons */}
            {quoteProduct && (
                <QuoteModal
                    open={!!quoteProduct}
                    onClose={() => setQuoteProduct(null)}
                    product={quoteProduct}
                />
            )}
        </>
    )
}
