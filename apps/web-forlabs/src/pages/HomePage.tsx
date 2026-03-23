import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/cart'
import { useMemberAuth } from '@/lib/auth'
import {
  ArrowRight,
  FlaskConical,
  ShieldCheck,
  Puzzle,
  Globe,
  Microscope,
  CheckCircle2,
  Box,
  Layers,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { getImageUrl } from '@/lib/utils'
import type { Product } from '@forlabs/shared'

// ─── 1.1 HERO PRODUCTS SLIDER ───
import { ShoppingBag, Heart, Check } from 'lucide-react'
import { memo, useMemo, useRef } from 'react'

const HeroProductCard = memo(({ product }: { product: Product }) => {
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const { addItem, removeItem, isInCart } = useCart()
  const { member, toggleFavoriteProduct } = useMemberAuth()

  const isFav = useMemo(() => {
    if (!member?.favorite_products) return false
    try {
      const arr = JSON.parse(member.favorite_products)
      if (!Array.isArray(arr)) return false
      const ids = arr.map((item: unknown) => typeof item === 'object' && item !== null && 'id' in item ? Number((item as Record<string, unknown>).id) : Number(item))
      return ids.includes(product.id)
    } catch {
      return false
    }
  }, [member, product.id])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!member) {
      navigate('/giris-yap')
      return
    }
    await toggleFavoriteProduct(product.id)
  }

  const inCart = isInCart(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) {
      removeItem(product.id)
    } else if (product.price) {
      addItem({
        id: product.id,
        slug: product.slug,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
        currency: product.currency,
        brand: product.brand,
      })
    }
  }

  const hasDiscount = typeof product.compare_price === 'number' && typeof product.price === 'number' && product.compare_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price!) / product.compare_price!) * 100)
    : 0

  return (
    <div
      key={product.id}
      className="group relative flex w-65 shrink-0 snap-center snap-always flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:w-70"
    >
      {/* Image Canvas */}
      <Link
        to={`/urunler/${product.slug || product.id}`}
        className="relative flex h-52 w-full shrink-0 items-center justify-center bg-[#F8F9FA] p-6 transition-colors duration-500 group-hover:bg-[#F1F3F5]"
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute left-4 top-4 z-10 flex items-center rounded bg-brand-500 px-2 py-1 text-[10px] font-extrabold tracking-wider text-white shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Favorite Icon */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all duration-300 ${isFav ? 'text-red-500 shadow-md shadow-red-500/20' : 'text-slate-300 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 hover:shadow-md'}`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={localizedField(product, 'title', lang)}
            className="h-full w-full object-contain mix-blend-darken transition-transform duration-700 ease-out group-hover:scale-105"
            decoding="async"
            loading="lazy"
          />
        ) : (
          <Box className="h-10 w-10 text-slate-200 transition-transform duration-700 ease-out group-hover:scale-105" />
        )}
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta row: brand label + optional SKU chip */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {product.brand ?? '\u00A0'}
          </span>
          {product.sku && (
            <span className="shrink-0 rounded-md bg-slate-100/80 px-2 py-0.5 font-mono text-[9px] font-medium text-slate-500">
              {product.sku}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/urunler/${product.slug}`}
          className="mt-2.5 line-clamp-2 min-h-11 text-[15px] font-medium leading-snug text-slate-900 transition-colors group-hover:text-brand-600"
        >
          {localizedField(product, 'title', lang)}
        </Link>

        {/* Attribute pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {product.is_featured && (
            <span className="rounded bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-600">
              {lang === 'tr' ? 'Öne Çıkan' : 'Featured'}
            </span>
          )}
          {product.automation_level === 'full-auto' && (
            <span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
              {lang === 'tr' ? 'Tam Otomasyon' : 'Full Auto'}
            </span>
          )}
          {!product.is_featured && !product.automation_level && product.unit && (
            <span className="rounded border border-slate-200 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-slate-500">
              {product.unit}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 border-t border-slate-100" />
          
          {/* Footer: Price + Cart */}
          <div className="flex items-center justify-between">
            {/* Price block */}
            <div className="flex flex-col justify-center">
              {hasDiscount ? (
                <>
                  <span className="text-[11px] font-medium text-slate-400 line-through">
                    ₺{product.compare_price!.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-xl font-extrabold leading-none text-slate-900">
                    ₺{product.price!.toLocaleString('tr-TR')}
                  </span>
                </>
              ) : (
                <span className="text-xl font-extrabold leading-none text-slate-900">
                  {typeof product.price === 'number'
                    ? `₺${product.price.toLocaleString('tr-TR')}`
                    : t('products.contactForPrice', lang)}
                </span>
              )}
            </div>

            {/* Cart Button */}
            {product.price ? (
              <button
                onClick={handleAddToCart}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  inCart
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
                title={inCart ? t('products.inCart', lang) : t('products.addToCart', lang)}
              >
                {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              </button>
            ) : (
              <Link
                to={`/urunler/${product.slug || product.id}`}
                className="flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 transition-all duration-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

function HeroProductsSlider() {
  const { lang } = useLanguage()
  const { data: productsData, isLoading } = useProducts({ limit: 8 })
  const products = productsData?.data?.slice(0, 8) || []
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative mt-20 w-full animate-fade-in-up">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ── Layer 1: Editorial Banner Duo ── */}
      <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 sm:px-10 md:px-16 lg:px-24">

        {/* Banner A — Ürün Kataloğu */}
        <Link
          to="/urunler"
          className="group relative flex h-52 overflow-hidden rounded-2xl bg-slate-900 px-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/20 sm:h-56"
        >
          {/* BG gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(59,130,246,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(139,92,246,0.15),transparent_60%)]" />
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-size-[32px_32px]" />

          <div className="relative z-10 flex h-full w-full flex-col items-start justify-center pr-4 text-left sm:pr-8">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {lang === 'tr' ? 'Laboratuvar Ekipmanları' : 'Laboratory Equipment'}
            </span>
            <h4 className="mt-1.5 font-serif text-2xl leading-snug text-white sm:whitespace-nowrap sm:text-3xl">
              {lang === 'tr' ? 'Tüm Ürün Kataloğunu Keşfet' : 'Explore Full Catalogue'}
            </h4>
            <p className="mt-2 text-base leading-relaxed text-slate-300">
              {lang === 'tr'
                ? 'Analiz, ölçüm ve test cihazlarında binlerce ürün keşfedin'
                : 'Discover thousands of products in analysis, measurement & testing'}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-400 transition-all group-hover:gap-3">
              {lang === 'tr' ? 'Kataloğa Git' : 'Browse Catalogue'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

          {/* Decorative molecule icon cluster */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 transition-opacity duration-500 group-hover:opacity-20">
            <FlaskConical className="h-32 w-32 text-white" strokeWidth={0.8} />
          </div>
        </Link>

        {/* Banner B — Hizmetler */}
        <Link
          to="/hizmetler"
          className="group relative flex h-52 overflow-hidden rounded-2xl bg-slate-50 px-8 ring-1 ring-slate-200 transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 sm:h-56"
        >
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(59,130,246,0.06),transparent_60%)]" />

          <div className="relative z-10 flex h-full w-full flex-col items-start justify-center pr-4 text-left sm:pr-8">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
              {lang === 'tr' ? 'Profesyonel Destek' : 'Professional Support'}
            </span>
            <h4 className="mt-1.5 font-serif text-2xl leading-snug text-slate-900 sm:whitespace-nowrap sm:text-3xl">
              {lang === 'tr' ? 'Kurulum, Kalibrasyon & Eğitim' : 'Setup, Calibration & Training'}
            </h4>
            <p className="mt-2 text-base leading-relaxed text-slate-500">
              {lang === 'tr'
                ? 'Cihaz kurulumundan servis sözleşmesine tam destek'
                : 'Full support from device setup to service contracts'}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-all group-hover:gap-3 group-hover:text-slate-900">
              {lang === 'tr' ? 'Hizmetleri İncele' : 'View Services'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>

          {/* Decorative icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.12]">
            <ShieldCheck className="h-32 w-32 text-slate-900" strokeWidth={0.8} />
          </div>
        </Link>

      </div>

      {/* ── Layer 2: Section Header ── */}
      <div className="mt-10 flex items-center justify-between px-6 sm:px-10 md:px-16 lg:px-24">
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900/50">
          {lang === 'tr' ? 'Öne Çıkan Ürünler' : 'Featured Products'}
        </h3>
        <Link
          to="/urunler"
          className="group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
        >
          {lang === 'tr' ? 'Tümünü Gör' : 'View All'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Layer 3: Snap Scroll Product Cards ── */}
      {!isLoading && products.length > 0 && (
        <>
          <div 
            ref={scrollRef}
            className="hide-scrollbar mt-5 flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 px-6 pb-6 pt-1 sm:px-10 md:px-16 lg:px-24"
          >
            {products.map((p: Product) => (
              <HeroProductCard key={p.id} product={p} />
            ))}
            {/* End spacer */}
            <div className="min-w-px shrink-0" />
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-3 px-6 sm:px-10 md:px-16 lg:px-24 pb-8">
            <button
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              aria-label="Önceki ürünler"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              aria-label="Sonraki ürünler"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── 1. HERO SECTION: Abstract Scientific ───
function HeroSection() {
  const { lang } = useLanguage()
  return (
    <section className="relative z-10 min-h-[92vh] w-full bg-white selection:bg-brand-500/20">
      {/* Animated Background Elements Wrapped with Overflow Hidden to prevent shadow clipping */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top-right Blue Blob */}
        <div className="animate-blob absolute -right-[10%] -top-[10%] h-150 w-150 rounded-full bg-brand-100/40 mix-blend-multiply blur-[120px] filter" />
        {/* Bottom-left Purple Blob */}
        <div className="animate-blob animation-delay-2000 absolute -bottom-[20%] -left-[10%] h-150 w-150 rounded-full bg-purple-100/40 mix-blend-multiply blur-[120px] filter" />
        {/* Center Cyan Blob */}
        <div className="animate-blob animation-delay-4000 absolute left-[20%] top-[20%] h-125 w-125 rounded-full bg-cyan-50/50 mix-blend-multiply blur-[100px] filter" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full flex-col items-center justify-center pt-20 text-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          {/* Glass Badge */}
          <div className="animate-fade-in-up mb-6 flex items-center gap-3 rounded-full border border-white/40 bg-white/40 px-5 py-2 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
              {t('home.hero.badge', lang)}
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="animate-fade-in-up font-serif text-5xl font-medium leading-[1.1] tracking-tight text-slate-900 opacity-0 [animation-delay:200ms] sm:text-6xl lg:text-7xl">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-purple-600">{t('home.hero.titleLine1', lang)}</span>
            <br />
            <span className="text-slate-900">{t('home.hero.titleLine2', lang)}</span>
          </h1>

          <p className="animate-fade-in-up mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-600 opacity-0 [animation-delay:400ms] sm:text-xl">
            {t('home.hero.desc', lang)}{' '}
            <span className="mx-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-900">{t('home.hero.descHighlight', lang)}</span>{' '}
            {t('home.hero.descSuffix', lang)}
          </p>

          {/* CTA Group */}
          <div className="animate-fade-in-up mt-12 flex flex-col items-center gap-6 opacity-0 [animation-delay:600ms] sm:flex-row sm:gap-8">
            <Link
              to="/wizard"
              className="group relative flex h-14 w-full flex-shrink-0 items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 px-10 text-[13px] font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-2xl hover:shadow-brand-500/30 sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FlaskConical className="h-5 w-5" />
                {t('home.hero.ctaPrimary', lang)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:animate-shimmer" />
            </Link>

            <Link
              to="/iletisim"
              className="flex flex-shrink-0 items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
            >
              {t('home.hero.ctaSecondary', lang)}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Slider Section replaces Wizard Step Cards */}
        <HeroProductsSlider />
      </div>

      {/* Smooth Section Transition Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </section>
  )
}

// ─── 2. BENTO GRID: Problem & Solution ───
function BentoSection() {
  const { lang } = useLanguage()
  return (
    <section className="bg-slate-50 pt-8 pb-24 sm:pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl text-slate-900 sm:text-5xl">
            {t('home.bento.titlePre', lang)} <span className="italic text-brand-600">{t('home.bento.titleHighlight', lang)}</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 font-light">
            {t('home.bento.desc', lang)}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6 h-auto md:h-150">

          {/* Card 1: Large - Products */}
          <Link to="/urunler" className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl md:col-span-2">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-slate-50 blur-3xl transition-all group-hover:bg-brand-50/50" />

            <div className="relative z-10 grid h-full grid-cols-1 gap-6 p-8 sm:p-10 md:grid-cols-2 md:gap-8">
              <div className="flex flex-col justify-between min-h-70 md:min-h-0">
                <div>
                  <h3 className="font-serif text-3xl text-slate-900">{t('home.bento.productsTitle', lang)}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500">
                    {t('home.bento.productsDesc', lang)}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600">
                  {t('home.bento.productsCta', lang)} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Visual: Aggregation UI */}
              <div className="relative flex items-center justify-center min-h-70 md:min-h-0">
                <div className="w-full max-w-xs space-y-3.5 transition-transform duration-500 group-hover:-translate-y-2">
                  {/* Mock Item 1 */}
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm opacity-60 scale-95 origin-bottom-left transition-all group-hover:opacity-40">
                    <div className="h-10 w-10 rounded-lg bg-slate-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-24 rounded-full bg-slate-200" />
                      <div className="h-2 w-12 rounded-full bg-slate-100" />
                    </div>
                    <div className="text-xs font-bold text-slate-300">WAITING</div>
                  </div>
                  {/* Mock Item 2 (Active) */}
                  <div className="relative flex items-center gap-4 rounded-xl border border-brand-100 bg-white p-4 shadow-xl shadow-brand-900/5 ring-1 ring-brand-500/10 scale-105 transition-transform duration-300 group-hover:scale-110">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Box className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-2.5 w-32 rounded-full bg-slate-800" />
                      <div className="h-2 w-20 rounded-full bg-slate-200" />
                    </div>
                    <div className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600">
                      MATCHED
                    </div>
                    {/* Floating connecting line */}
                    <div className="absolute -right-12 top-1/2 h-px w-12 bg-brand-200 md:block hidden" />
                  </div>
                  {/* Mock Item 3 */}
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm opacity-60 scale-95 origin-top-left transition-all group-hover:opacity-40">
                    <div className="h-10 w-10 rounded-lg bg-slate-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-28 rounded-full bg-slate-200" />
                      <div className="h-2 w-16 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Vertical - Wizard Solution (Dark Theme) */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl transition-all hover:scale-[1.01] md:row-span-2">
            <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20">
                <FlaskConical className="h-6 w-6" />
              </div>

              <div className="my-10 space-y-4">
                <div className="mx-auto w-full max-w-50 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-transform duration-700 group-hover:scale-105">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-1.5 w-12 rounded-full bg-slate-600/50" />
                    <div className="h-1.5 w-8 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500" />
                    <div className="h-1.5 w-2/3 rounded-full bg-slate-700/50" />
                  </div>
                </div>
                <div className="mx-auto w-full max-w-45 scale-95 rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm opacity-50">
                  <div className="h-1.5 w-10 rounded-full bg-slate-600/50 mb-2" />
                  <div className="h-1.5 w-full rounded-full bg-purple-500/30" />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white">{t('home.bento.wizardTitle', lang)}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {t('home.bento.wizardDesc', lang)}
                </p>
                <Link to="/wizard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-slate-900">
                  {t('home.bento.wizardCta', lang)} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Small - Solutions */}
          <Link to="/hizmetler" className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-slate-900">{t('home.bento.solutionsTitle', lang)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {t('home.bento.solutionsDesc', lang)}
                </p>
              </div>

              {/* Visual: Project Roadmap */}
              <div className="mt-10">
                <div className="relative flex items-center justify-between px-2">
                  {/* Line */}
                  <div className="absolute top-4.5 left-2 right-2 h-0.5 bg-slate-100" />

                  {/* Steps */}
                  <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-9 w-9 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm transition-colors group-hover:border-purple-50 group-hover:bg-white">1</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-600/70 transition-colors">{t('home.bento.solutionsStep1', lang)}</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                    <div className="h-9 w-9 rounded-full border-4 border-purple-50 bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-purple-200 scale-110">2</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{t('home.bento.solutionsStep2', lang)}</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300 delay-150">
                    <div className="h-9 w-9 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm transition-colors group-hover:border-purple-50 group-hover:bg-white">3</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-600/70 transition-colors">{t('home.bento.solutionsStep3', lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 4: Small - Academy */}
          <Link to="/akademi" className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl">
            <div className="absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.05),transparent_70%)]" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl text-slate-900">{t('home.bento.academyTitle', lang)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {t('home.bento.academyDesc', lang)}
                </p>
              </div>

              {/* Visual: Document Stack */}
              <div className="mt-10 flex justify-center [perspective:500px]">
                <div className="relative top-2 transition-transform duration-500 group-hover:-translate-y-4 group-hover:[transform:rotateX(15deg)]">
                  {/* Back Paper */}
                  <div className="absolute top-0 left-4 h-24 w-20 -rotate-12 rounded-lg border border-slate-100 bg-white shadow-sm opacity-60 transition-transform duration-500 group-hover:-rotate-12 group-hover:-translate-x-2" />
                  {/* Middle Paper */}
                  <div className="absolute top-0 left-2 h-24 w-20 -rotate-6 rounded-lg border border-slate-100 bg-white shadow-sm opacity-80 transition-transform duration-500 group-hover:-rotate-6 group-hover:-translate-x-1" />
                  {/* Front Paper */}
                  <div className="relative h-24 w-20 rotate-0 rounded-lg border border-blue-100 bg-white p-3 shadow-lg ring-1 ring-blue-500/10 flex flex-col transition-all duration-500 group-hover:shadow-blue-500/20 group-hover:scale-105">
                    <div className="h-2 w-8 rounded-full bg-blue-100 mb-2" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-1 w-full rounded-full bg-slate-100" />
                      <div className="h-1 w-full rounded-full bg-slate-100" />
                      <div className="h-1 w-10 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="h-1.5 w-4 rounded-full bg-blue-200" />
                      <div className="h-4 w-4 rounded-full bg-blue-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}

// ─── 3. ECOSYSTEM SECTION: Orbital Animation ───
function EcosystemSection() {
  const { lang } = useLanguage()
  const SATELLITES: { name: string; domain: string; descKey: 'home.ecosystem.atagotr' | 'home.ecosystem.gidatest' | 'home.ecosystem.gidakimya' | 'home.ecosystem.alerjen' | 'home.ecosystem.hijyenkontrol' | 'home.ecosystem.labkurulum'; color: string; bgColor: string; borderColor: string; textColor: string; icon: typeof Microscope; angle: number }[] = [
    { name: 'atago·tr', domain: 'atagotr.com', descKey: 'home.ecosystem.atagotr', color: '#2563eb', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700', icon: Microscope, angle: 330 },
    { name: 'gıda·test', domain: 'gidatest.com', descKey: 'home.ecosystem.gidatest', color: '#16a34a', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700', icon: FlaskConical, angle: 30 },
    { name: 'gıda·kimya', domain: 'gidakimya.com', descKey: 'home.ecosystem.gidakimya', color: '#9333ea', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700', icon: Layers, angle: 110 },
    { name: 'alerjen·net', domain: 'alerjen.net', descKey: 'home.ecosystem.alerjen', color: '#ea580c', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-700', icon: ShieldCheck, angle: 210 },
    { name: 'hijyen·kontrol', domain: 'hijyenkontrol.com', descKey: 'home.ecosystem.hijyenkontrol', color: '#0891b2', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', textColor: 'text-cyan-700', icon: CheckCircle2, angle: 150 },
    { name: 'lab·kurulum', domain: 'labkurulum.com', descKey: 'home.ecosystem.labkurulum', color: '#475569', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', textColor: 'text-slate-700', icon: Puzzle, angle: 270 },
  ]

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t('home.ecosystem.badge', lang)}
          </span>
          <h2 className="mt-6 max-w-3xl font-serif text-3xl leading-tight text-slate-900 sm:text-5xl">
            {t('home.ecosystem.titlePre', lang)} <span className="text-brand-600">{t('home.ecosystem.titleHighlight', lang)}</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            {t('home.ecosystem.desc', lang)}
          </p>
        </div>

        {/* Orbital UI */}
        <div className="relative mx-auto mt-20 flex h-130 w-full max-w-2xl items-center justify-center">
          {/* Orbit rings */}
          <div className="absolute h-105 w-105 rounded-full border border-dashed border-slate-200 animate-[spin_60s_linear_infinite]" />
          <div className="absolute h-80 w-80 rounded-full border border-slate-100" />

          {/* Center Node */}
          <div className="group relative z-20 flex h-24 w-24 items-center justify-center rounded-full border border-slate-100 bg-white shadow-2xl shadow-brand-500/10 ring-4 ring-white">
            <img src="/forlabs-logo-blue.svg" alt="for-labs" className="absolute w-14 h-auto opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
            <img src="/forlabs-logo-blue-hover.svg" alt="for-labs-hover" className="absolute w-14 h-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* Pulse rings */}
            <div className="absolute h-24 w-24 animate-ping rounded-full bg-brand-500/10" style={{ animationDuration: '3s' }} />
          </div>

          {/* Satellite Nodes */}
          {SATELLITES.map((site) => {
            const rad = (site.angle * Math.PI) / 180
            const radius = 210
            const x = Math.cos(rad) * radius
            const y = Math.sin(rad) * radius
            const floatDelay = `${(site.angle / 60) * 0.4}s`
            const floatDur = `${5 + (site.angle / 60) * 0.3}s`

            return (
              <a
                key={site.name}
                href={`https://${site.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group absolute z-10"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    animation: `float ${floatDur} ease-in-out infinite`,
                    animationDelay: floatDelay,
                  }}
                >
                  {/* Connector line */}
                  <div
                    className="absolute top-1/2 left-1/2 origin-left bg-slate-100 transition-colors duration-300 group-hover:bg-slate-300"
                    style={{
                      width: `${radius - 48}px`,
                      height: '1px',
                      transform: `translateY(-50%) rotate(${site.angle + 180}deg)`,
                    }}
                  />

                  {/* Node pill */}
                  <div
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl border bg-white px-4 py-3 shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl ${site.borderColor}`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${site.bgColor}`}>
                      <site.icon className="h-4 w-4" style={{ color: site.color }} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wide text-slate-800">{site.name}</span>

                    {/* Tooltip */}
                    <div
                      className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[10px] font-semibold shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5 ${site.bgColor} ${site.borderColor} ${site.textColor}`}
                    >
                      {t(site.descKey, lang)}
                      <div className={`absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r ${site.borderColor} ${site.bgColor}`} />
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── 4. FOOTER CTA ───
function FooterCTA() {
  const { lang } = useLanguage()
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Left: Wizard CTA Card */}
          <Link
            to="/wizard"
            className="group relative overflow-hidden rounded-3xl bg-slate-900 p-10 transition-all hover:shadow-2xl hover:shadow-slate-900/20"
          >
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl transition-all duration-700 group-hover:bg-brand-600/30" />
            <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Bot className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-white sm:text-3xl">
                {t('home.cta.wizardTitle1', lang)} <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-400 to-purple-400">{t('home.cta.wizardTitle2', lang)}</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                {t('home.cta.wizardDesc', lang)}
              </p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-900 transition-transform duration-300 group-hover:scale-105">
                {t('home.cta.wizardBtn', lang)} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Right: Newsletter Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-10">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Globe className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-slate-900 sm:text-3xl">
                {t('home.cta.newsTitle1', lang)} <br />
                <span className="text-brand-600">{t('home.cta.newsTitle2', lang)}</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                {t('home.cta.newsDesc', lang)}
              </p>
            </div>

            <div className="mt-8">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  placeholder={t('home.cta.emailPlaceholder', lang)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10"
                />
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-600"
                >
                  {t('common.subscribe', lang)} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <p className="mt-3 text-[11px] text-slate-400">
                {t('home.cta.spamNote', lang)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BentoSection />
      <EcosystemSection />
      <FooterCTA />
    </>
  )
}
