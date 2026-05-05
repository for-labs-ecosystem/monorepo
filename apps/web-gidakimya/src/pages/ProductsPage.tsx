import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Package, X, ChevronDown, ArrowUpRight, SlidersHorizontal, Check } from 'lucide-react'
import { useProducts, useCategories } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'
import type { QuoteProduct } from '@/components/QuoteModal'
import type { Product } from '@forlabs/shared'

interface Category {
    id: number
    name: string
    slug: string
    parent_id: number | null
}

/* ─── Sort Dropdown ─── */
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const options = [
        { value: 'default', label: 'Varsayılan Sıralama' },
        { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
        { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
        { value: 'name_asc', label: 'İsim: A → Z' },
        { value: 'newest', label: 'En Yeni Eklenenler' },
    ]
    const current = options.find(o => o.value === value) ?? options[0]

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-azure-300 hover:bg-azure-50/30"
            >
                {current.label}
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${value === opt.value ? 'bg-azure-50 font-semibold text-azure-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {value === opt.value && <Check className="h-3.5 w-3.5 text-azure-500" />}
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── Main Page ─── */
export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeCategoryId = searchParams.get('category_id')
    const searchQuery = searchParams.get('q') ?? ''
    const [localSearch, setLocalSearch] = useState(searchQuery)
    const [sort, setSort] = useState('default')
    const [brandFilter, setBrandFilter] = useState<string[]>([])
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const { data: productsData, isLoading } = useProducts({
        limit: 100,
    })
    const { data: categoriesData } = useCategories()

    const allProducts = useMemo(() => (productsData?.data ?? []) as Product[], [productsData])
    const categories = (categoriesData?.data ?? []) as Category[]
    const rootCategories = categories.filter((c) => !c.parent_id)

    const [quoteProduct, setQuoteProduct] = useState<QuoteProduct | null>(null)

    // Extract unique brands from products
    const brands = useMemo(() => {
        const set = new Set<string>()
        allProducts.forEach(p => { if (p.brand) set.add(p.brand) })
        return Array.from(set).sort()
    }, [allProducts])

    // Client-side filtering + sorting
    const filtered = useMemo(() => {
        let items = allProducts

        // Category filter
        if (activeCategoryId) {
            items = items.filter(p => String(p.category_id) === activeCategoryId)
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            items = items.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q)
            )
        }

        // Brand filter
        if (brandFilter.length > 0) {
            items = items.filter(p => p.brand && brandFilter.includes(p.brand))
        }

        // Sort
        const sorted = [...items]
        switch (sort) {
            case 'price_asc':
                sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
                break
            case 'price_desc':
                sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
                break
            case 'name_asc':
                sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
                break
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                break
            default:
                sorted.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        }

        return sorted
    }, [allProducts, activeCategoryId, searchQuery, brandFilter, sort])

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (localSearch.trim()) {
            params.set('q', localSearch.trim())
        } else {
            params.delete('q')
        }
        setSearchParams(params)
    }, [localSearch, searchParams, setSearchParams])

    const handleCategoryClick = useCallback((catId: number | null) => {
        const params = new URLSearchParams(searchParams)
        if (catId) {
            params.set('category_id', String(catId))
        } else {
            params.delete('category_id')
        }
        params.delete('q')
        setLocalSearch('')
        setSearchParams(params)
    }, [searchParams, setSearchParams])

    const toggleBrand = (b: string) => {
        setBrandFilter(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
    }

    const clearAllFilters = () => {
        setLocalSearch('')
        setBrandFilter([])
        setSort('default')
        setSearchParams({})
    }

    const activeCategory = useMemo(() =>
        categories.find((c) => String(c.id) === activeCategoryId),
        [categories, activeCategoryId]
    )

    const hasActiveFilters = !!(activeCategoryId || searchQuery || brandFilter.length > 0)

    /* ─── Filter Sidebar Content (shared between desktop & mobile) ─── */
    const filterContent = (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder="Ürün ara..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-[13px] text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-azure-400 focus:bg-white focus:ring-2 focus:ring-azure-100"
                        />
                        {localSearch && (
                            <button
                                type="button"
                                onClick={() => { setLocalSearch(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p) }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Categories */}
            <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Kategoriler</h3>
                <ul className="space-y-0.5">
                    <li>
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                !activeCategoryId ? 'bg-azure-50 text-azure-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            Tüm Ürünler
                        </button>
                    </li>
                    {rootCategories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                    activeCategoryId === String(cat.id) ? 'bg-azure-50 text-azure-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Markalar</h3>
                    <div className="space-y-0.5">
                        {brands.map(brand => {
                            const isSelected = brandFilter.includes(brand)
                            return (
                                <button
                                    key={brand}
                                    onClick={() => toggleBrand(brand)}
                                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                                        isSelected ? 'bg-azure-50 text-azure-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                                >
                                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                                        isSelected ? 'border-azure-500 bg-azure-500 text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                        {isSelected && <Check className="h-2.5 w-2.5" />}
                                    </div>
                                    {brand}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                    <X className="h-3.5 w-3.5" />
                    Filtreleri Temizle
                </button>
            )}
        </div>
    )

    return (
        <>
            <title>{activeCategory ? `${activeCategory.name} — GıdaKimya` : 'Ürünler — GıdaKimya'}</title>
            <meta name="description" content="Gıda sektörüne yönelik kalite kontrol ve analiz cihazları kataloğu." />

            <div className="mx-auto max-w-[1400px] px-5 lg:px-8 py-10 lg:py-14">
                {/* Page Header */}
                <div className="mb-8">
                    <span className="text-[10px] font-bold text-azure-500 uppercase tracking-[0.2em]">Ürün Kataloğu</span>
                    <h1 className="mt-2 text-3xl sm:text-[2.5rem] font-extrabold text-slate-900 tracking-[-0.03em]">
                        {activeCategory ? activeCategory.name : 'Tüm Ürünler'}
                    </h1>
                    <p className="mt-2 text-[14px] text-slate-400 max-w-xl leading-relaxed">
                        Gıda ve kimya endüstrisine yönelik analiz cihazları, reaktifler ve laboratuvar ekipmanları.
                    </p>
                </div>

                {/* Active Filter Tags + Sort Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    {/* Left: Active filter tags */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
                        {/* Result count */}
                        <span className="text-[13px] text-slate-400 mr-2">
                            {filtered.length} ürün
                        </span>

                        {activeCategory && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-azure-50 border border-azure-100 py-1 pl-3 pr-1.5 text-[11px] font-semibold text-azure-700">
                                {activeCategory.name}
                                <button onClick={() => handleCategoryClick(null)} className="rounded-full p-0.5 hover:bg-azure-200/50 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {brandFilter.map(b => (
                            <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 py-1 pl-3 pr-1.5 text-[11px] font-semibold text-slate-600">
                                {b}
                                <button onClick={() => toggleBrand(b)} className="rounded-full p-0.5 hover:bg-slate-300/50 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}

                        {searchQuery && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 py-1 pl-3 pr-1.5 text-[11px] font-semibold text-amber-700">
                                "{searchQuery}"
                                <button onClick={() => { setLocalSearch(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p) }} className="rounded-full p-0.5 hover:bg-amber-200/50 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors ml-1"
                            >
                                Tümünü temizle
                            </button>
                        )}
                    </div>

                    {/* Right: Sort + Mobile filter toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-azure-300"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtreler
                            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-azure-500" />}
                        </button>

                        <SortDropdown value={sort} onChange={setSort} />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block lg:w-64 shrink-0">
                        <div className="sticky top-32 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            {filterContent}
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {mobileFiltersOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 flex">
                            {/* Backdrop */}
                            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFiltersOpen(false)} />
                            {/* Panel */}
                            <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-left duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Filtreler</h2>
                                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                        <X className="h-5 w-5 text-slate-500" />
                                    </button>
                                </div>
                                {filterContent}
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="rounded-2xl border border-slate-100 h-[380px] animate-pulse bg-slate-50/50" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-2xl border border-slate-100 bg-white text-center py-24">
                                <Package className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-500 mb-2">Ürün Bulunamadı</h3>
                                <p className="text-sm text-slate-400 mb-6">Farklı bir kategori veya arama terimi deneyin.</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-azure-200 text-[13px] font-semibold text-azure-600 hover:bg-azure-50 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Filtreleri Temizle
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filtered.map((product) => (
                                    <div key={product.id} className="group flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden transition-all duration-300 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-1">
                                        <Link
                                            to={`/urunler/${product.slug}`}
                                            className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-azure-50/20 p-8 flex items-center justify-center overflow-hidden"
                                        >
                                            {/* Brand badge */}
                                            {product.brand && (
                                                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/90 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] shadow-sm">
                                                    {product.brand}
                                                </div>
                                            )}

                                            {/* Campaign badge */}
                                            {product.campaign_label && (
                                                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-amber-500 text-[9px] font-bold text-white uppercase tracking-wider">
                                                    {product.campaign_label}
                                                </div>
                                            )}

                                            {product.image_url ? (
                                                <img
                                                    src={getImageUrl(product.image_url)}
                                                    alt={product.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                                                />
                                            ) : (
                                                <Package className="w-16 h-16 text-slate-200" />
                                            )}
                                        </Link>

                                        <div className="p-5 flex flex-col flex-1 gap-3 border-t border-slate-50">
                                            <div className="flex-1">
                                                <Link to={`/urunler/${product.slug}`}>
                                                    <h3 className="text-[14px] font-bold text-slate-800 line-clamp-2 group-hover:text-azure-600 transition-colors duration-200 leading-snug">
                                                        {product.title}
                                                    </h3>
                                                </Link>
                                                {product.description && (
                                                    <p className="text-[12px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                                                )}
                                            </div>

                                            {/* Price + CTA row */}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                                                <div>
                                                    {product.price ? (
                                                        <div className="flex items-baseline gap-2">
                                                            {product.compare_price && product.compare_price > product.price && (
                                                                <span className="text-[11px] text-slate-400 line-through">
                                                                    ₺{product.compare_price.toLocaleString('tr-TR')}
                                                                </span>
                                                            )}
                                                            <span className="text-[16px] font-extrabold text-slate-800">
                                                                ₺{product.price.toLocaleString('tr-TR')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[12px] font-semibold text-slate-400">Fiyat için teklif alın</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setQuoteProduct({
                                                        id: product.id, title: product.title,
                                                        image_url: product.image_url, brand: product.brand,
                                                        model_number: product.model_number, description: product.description,
                                                        price: product.price, currency: product.currency, sku: product.sku,
                                                    })}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-azure-50/80 border border-azure-100/50 text-[11px] font-bold text-azure-600 hover:bg-azure-100 hover:border-azure-200 transition-all duration-200 group/cta"
                                                >
                                                    Sipariş Oluştur
                                                    <ArrowUpRight className="w-3 h-3 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {quoteProduct && (
                <QuoteModal open={!!quoteProduct} onClose={() => setQuoteProduct(null)} product={quoteProduct} />
            )}
        </>
    )
}
