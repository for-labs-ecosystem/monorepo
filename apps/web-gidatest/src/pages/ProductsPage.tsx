import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories } from '@forlabs/core'
import type { Product } from '@forlabs/shared'
import {
    Search, ArrowUpRight, SlidersHorizontal,
    ChevronDown, Check, FlaskConical, X,
} from 'lucide-react'
import { getImageUrl, formatPrice } from '@/lib/utils'
import QuoteModal, { type QuoteProduct } from '@/components/QuoteModal'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface Category {
    id: number
    name: string
    slug: string
    type: string | null
    parent_id: number | null
}

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
    useEffect(() => {
        const listener = (e: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(e.target as Node)) return
            handler()
        }
        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)
        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, handler])
}

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const categoryRef = useRef<HTMLDivElement>(null)
    useOnClickOutside(categoryRef, () => setIsCategoryOpen(false))

    const searchQ = searchParams.get('q') || ''
    const categoryIdsStr = searchParams.get('category') || ''
    const categoryIds = categoryIdsStr ? categoryIdsStr.split(',') : []
    const sortParam = searchParams.get('sort') || 'default'

    const { data: productsRes, isLoading } = useQuery({
        queryKey: ['products', SITE_ID, searchQ, categoryIdsStr],
        queryFn: () => getProducts({ q: searchQ || undefined, category_id: categoryIdsStr || undefined }),
        staleTime: 2 * 60 * 1000,
    })

    const { data: categoriesRes } = useQuery({
        queryKey: ['categories', SITE_ID, 'product'],
        queryFn: () => getCategories({ type: 'product' }),
        staleTime: 5 * 60 * 1000,
    })

    let products = (productsRes?.data ?? []) as Product[]
    const categories = (categoriesRes?.data ?? []) as Category[]

    if (sortParam === 'price-asc') {
        products = [...products].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortParam === 'price-desc') {
        products = [...products].sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortParam === 'newest') {
        products = [...products].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    }

    const parentCategories = categories.filter(c => !c.parent_id)
    const getChildren = (pid: number) => categories.filter(c => c.parent_id === pid)

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const q = (fd.get('q') as string).trim()
        const params = new URLSearchParams(searchParams)
        if (q) params.set('q', q); else params.delete('q')
        setSearchParams(params)
    }

    function toggleCategory(id: string) {
        const params = new URLSearchParams(searchParams)
        let ids = [...categoryIds]
        ids = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
        if (ids.length > 0) params.set('category', ids.join(',')); else params.delete('category')
        setSearchParams(params)
    }

    function setSort(val: string) {
        const params = new URLSearchParams(searchParams)
        if (val && val !== 'default') params.set('sort', val); else params.delete('sort')
        setSearchParams(params)
    }

    function clearFilters() {
        const params = new URLSearchParams()
        if (searchQ) params.set('q', searchQ)
        setSearchParams(params)
    }

    const openQuote = (p: Product) => {
        setQuoteProduct({
            id: p.id, title: p.title, image_url: p.image_url,
            brand: p.brand, model_number: p.model_number,
            description: p.description, price: p.price,
            currency: p.currency, sku: p.sku,
        })
        setQuoteOpen(true)
    }

    const hasActiveFilters = categoryIds.length > 0 || sortParam !== 'default'

    return (
        <>
            <title>Ürün Kataloğu — GıdaTest</title>
            <meta name="description" content="Gıda, tarım ve laboratuvar sektörü için analiz cihazları ve test kitleri kataloğu." />

            <div className="relative py-16 lg:py-24 min-h-screen">
                {/* Soft bg glows */}
                <div className="absolute inset-0 bg-gradient-to-b from-oat-100 via-oat-50 to-white pointer-events-none" />
                <div className="glow-sage" style={{ width: 500, height: 500, top: '-10%', right: '-10%', opacity: 0.5 }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Page header ── */}
                    <div className="mb-12 max-w-2xl">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="w-10 h-px bg-sage-500" />
                            <span className="label-eyebrow">Ürün Kataloğu</span>
                        </div>
                        <h1 className="heading-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5">
                            Analiz cihazları &{' '}
                            <span className="italic text-sage-700">test kitleri</span>
                        </h1>
                        <p className="text-stone-600 text-lg leading-relaxed">
                            Gıda, tarım ve laboratuvar sektörü için profesyonel cihaz ve kit çözümleri.
                        </p>
                    </div>

                    {/* ── Toolbar ── */}
                    <div
                        className="relative z-20 bg-white/80 backdrop-blur-sm border border-stone-200/70 p-4 mb-10 shadow-[0_2px_12px_-4px_rgba(26,51,32,0.08)] overflow-visible"
                        style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                    >
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">

                            {/* Search */}
                            <form onSubmit={handleSearch} className="relative w-full lg:w-96 shrink-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    name="q"
                                    defaultValue={searchQ}
                                    placeholder="Ürün, marka veya model ara..."
                                    className="input-organic !pl-11 w-full"
                                />
                            </form>

                            <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">

                                {/* Categories dropdown */}
                                <div className="relative" ref={categoryRef}>
                                    <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border transition-all duration-200
                                            ${isCategoryOpen || categoryIds.length > 0
                                                ? 'bg-sage-50 border-sage-300 text-sage-800'
                                                : 'bg-white border-stone-200 text-stone-700 hover:border-sage-300 hover:bg-sage-50/50'
                                            }`}
                                        style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        <span>Kategoriler</span>
                                        {categoryIds.length > 0 && (
                                            <span className="bg-sage-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {categoryIds.length}
                                            </span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCategoryOpen && (
                                        <div
                                            className="absolute top-full mt-2 right-0 w-[300px] sm:w-[380px] bg-white border border-stone-200 shadow-[0_20px_50px_-16px_rgba(26,51,32,0.18)] z-[100] overflow-hidden flex flex-col max-h-[70vh]"
                                            style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                                        >
                                            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                                                <span className="text-sm font-bold text-forest-900">Kategoriye Göre Filtrele</span>
                                                {categoryIds.length > 0 && (
                                                    <button onClick={clearFilters} className="text-xs font-semibold text-sage-600 hover:text-sage-800 transition-colors">
                                                        Temizle
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-4 overflow-y-auto space-y-5">
                                                {parentCategories.map(parent => (
                                                    <div key={parent.id}>
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={categoryIds.includes(String(parent.id))}
                                                                    onChange={() => toggleCategory(String(parent.id))}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-4 h-4 rounded-[4px] border border-stone-300 bg-white peer-checked:bg-sage-600 peer-checked:border-sage-600 transition-colors" />
                                                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                            </div>
                                                            <span className="text-sm font-bold text-forest-900 group-hover:text-sage-700 transition-colors">
                                                                {parent.name}
                                                            </span>
                                                        </label>
                                                        {getChildren(parent.id).length > 0 && (
                                                            <div className="ml-7 mt-3 space-y-2.5">
                                                                {getChildren(parent.id).map(child => (
                                                                    <label key={child.id} className="flex items-center gap-3 cursor-pointer group">
                                                                        <div className="relative flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={categoryIds.includes(String(child.id))}
                                                                                onChange={() => toggleCategory(String(child.id))}
                                                                                className="peer sr-only"
                                                                            />
                                                                            <div className="w-4 h-4 rounded-[4px] border border-stone-300 bg-white peer-checked:bg-sage-500 peer-checked:border-sage-500 transition-colors" />
                                                                            <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                                        </div>
                                                                        <span className="text-sm text-stone-600 group-hover:text-sage-700 transition-colors">
                                                                            {child.name}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {categories.length === 0 && (
                                                    <p className="text-sm text-stone-400 text-center py-4">Kategori bulunamadı.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sort */}
                                <div className="relative shrink-0">
                                    <select
                                        value={sortParam}
                                        onChange={e => setSort(e.target.value)}
                                        className="appearance-none pl-4 pr-9 py-2.5 text-sm font-semibold border border-stone-200 bg-white text-stone-700 focus:outline-none focus:border-sage-400 cursor-pointer transition-colors hover:border-sage-300"
                                        style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                                    >
                                        <option value="default">Sıralama: Önerilen</option>
                                        <option value="newest">En Yeniler</option>
                                        <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                                        <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                                </div>

                                {/* Active filter tags */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-500 border border-stone-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                        style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                                    >
                                        <X className="w-3.5 h-3.5" /> Filtreleri Sıfırla
                                    </button>
                                )}

                                {/* Result count */}
                                {!isLoading && (
                                    <span className="ml-auto text-xs text-stone-400 font-medium shrink-0">
                                        {products.length} ürün
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Loading ── */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[420px] animate-pulse bg-oat-200"
                                    style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Empty ── */}
                    {!isLoading && products.length === 0 && (
                        <div
                            className="text-center py-24 bg-white border border-dashed border-stone-300"
                            style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
                        >
                            <div className="w-14 h-14 bg-sage-100 flex items-center justify-center mx-auto mb-4"
                                style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                                <FlaskConical className="w-6 h-6 text-sage-500" />
                            </div>
                            <p className="heading-serif text-xl text-forest-900 mb-2">Ürün bulunamadı</p>
                            <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                                Arama kriterlerinizi değiştirerek veya farklı kategoriler seçerek tekrar deneyebilirsiniz.
                            </p>
                            {(searchQ || categoryIds.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="btn-ghost-sage !py-2 !px-5 !text-sm"
                                >
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Grid ── */}
                    {!isLoading && products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} onQuote={() => openQuote(p)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {quoteProduct && (
                <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} product={quoteProduct} />
            )}
        </>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT CARD — Anasayfayla aynı organik tasarım
// ═══════════════════════════════════════════════════════════════════════
function ProductCard({ product, onQuote }: { product: Product; onQuote: () => void }) {
    return (
        <div
            className="group relative bg-white border border-stone-200/60 overflow-hidden flex flex-col shadow-[0_2px_12px_-6px_rgba(26,51,32,0.06)] hover:shadow-[0_20px_50px_-16px_rgba(26,51,32,0.14)] hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ borderTopLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}
        >
            {/* Image */}
            <Link
                to={`/urunler/${product.slug}`}
                className="relative h-[280px] bg-gradient-to-br from-sage-50/50 via-oat-50 to-harvest-50/30 flex items-center justify-center p-8 overflow-hidden"
            >
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url) || ''}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div
                        className="w-20 h-20 bg-sage-100 flex items-center justify-center"
                        style={{ borderTopLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                    >
                        <FlaskConical className="w-8 h-8 text-sage-300" />
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
                        <button onClick={onQuote} className="btn-organic !py-2 !px-4 !text-[11px]">
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
