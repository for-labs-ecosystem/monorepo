import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, ChevronRight, X, SlidersHorizontal } from 'lucide-react'
import { useProducts, useCategories } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import QuoteModal from '@/components/QuoteModal'
import type { Product, Category } from '@forlabs/shared'

function buildCategoryTree(categories: Category[]) {
    const idSet = new Set(categories.map((c) => c.id))
    const roots: Category[] = []
    const childMap = new Map<number, Category[]>()
    for (const cat of categories) {
        if (cat.parent_id == null || !idSet.has(cat.parent_id)) {
            roots.push(cat)
        } else {
            if (!childMap.has(cat.parent_id)) childMap.set(cat.parent_id, [])
            childMap.get(cat.parent_id)!.push(cat)
        }
    }
    return { roots, childMap }
}

function hasDescendantSelected(catId: number, childMap: Map<number, Category[]>, selectedId: string): boolean {
    const children = childMap.get(catId) ?? []
    for (const child of children) {
        if (String(child.id) === selectedId) return true
        if (hasDescendantSelected(child.id, childMap, selectedId)) return true
    }
    return false
}

function CategoryNode({
    cat, childMap, selectedId, onSelect, depth = 0,
}: {
    cat: Category; childMap: Map<number, Category[]>; selectedId: string; onSelect: (id: string) => void; depth?: number
}) {
    const children = childMap.get(cat.id) ?? []
    const hasChildren = children.length > 0
    const isSelected = selectedId === String(cat.id)
    const descendantSelected = hasChildren && hasDescendantSelected(cat.id, childMap, selectedId)
    const [open, setOpen] = useState(true)

    return (
        <div>
            <div
                className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected
                        ? 'bg-ocean-500 text-white shadow-md shadow-ocean-500/15'
                        : descendantSelected
                            ? 'bg-ocean-50/50 text-ocean-700'
                            : 'text-slate-500 hover:bg-ocean-50/40 hover:text-slate-600'
                }`}
                style={{ paddingLeft: `${16 + depth * 16}px` }}
                onClick={() => {
                    onSelect(isSelected ? '' : String(cat.id))
                    if (hasChildren && !open) setOpen(true)
                }}
            >
                <span className={`text-[13px] truncate ${isSelected ? 'font-semibold text-white' : hasChildren ? 'font-semibold' : 'font-medium'}`}>
                    {cat.name}
                </span>
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
                        className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    >
                        <ChevronDown className={`w-3.5 h-3.5 ${isSelected ? 'text-white/60' : 'text-slate-300'}`} />
                    </button>
                )}
            </div>
            {hasChildren && open && (
                <div className="mt-0.5 space-y-0.5">
                    {children.map((child) => (
                        <CategoryNode key={child.id} cat={child} childMap={childMap} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ProductCard({ product, onQuote }: { product: Product; onQuote: (p: { id: number; name: string }) => void }) {
    return (
        <div className="group flex flex-col pebble-card overflow-hidden">
            <Link to={`/urunler/${product.slug}`} className="aspect-square bg-gradient-to-br from-mint-50/40 to-ocean-50/20 p-10 flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
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
                    onClick={() => onQuote({ id: product.id, name: product.title })}
                    className="btn-warm w-full !text-[13px] !py-3"
                >
                    Bu Ürün İçin Teklif Al
                </button>
            </div>
        </div>
    )
}

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sortOption, setSortOption] = useState('default')
    const [quoteProduct, setQuoteProduct] = useState<{ id: number; name: string } | null>(null)

    const params: Record<string, string | number | undefined> = {}
    if (search) params.q = search
    if (categoryId) params.category_id = categoryId

    const { data: productsData, isLoading } = useProducts(params)
    const { data: categoriesData } = useCategories({ type: 'product' })

    const rawProducts = (productsData?.data ?? []) as Product[]
    const categories = (categoriesData?.data ?? []) as Category[]
    const count = productsData?.count ?? rawProducts.length

    const products = useMemo(() => {
        const arr = [...rawProducts]
        switch (sortOption) {
            case 'newest':
                return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            case 'name_asc':
                return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            default:
                return arr
        }
    }, [rawProducts, sortOption])

    const { roots, childMap } = useMemo(() => buildCategoryTree(categories), [categories])
    const selectedCategory = categories.find((c) => String(c.id) === categoryId)

    return (
        <div className="min-h-screen">
            <title>Ürünler — Alerjen Test Kitleri</title>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16">

                {/* Page Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-4">
                        <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-500">Ürünler</span>
                        {selectedCategory && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-slate-500">{selectedCategory.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight">
                        {selectedCategory ? selectedCategory.name : 'Tüm Test Kitleri'}
                    </h1>
                    <p className="text-slate-400 mt-3 text-base leading-relaxed font-light">
                        {selectedCategory?.description ?? 'Gıda güvenliği için alerjen, glüten, mikotoksin ve kontaminasyon hızlı test kitleri'}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Test kiti adı veya marka ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-soft w-full !pl-12"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors duration-300">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center gap-2 px-5 py-3.5 pebble-card text-[13px] font-medium text-slate-500 hover:text-slate-600 transition-all duration-300"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtrele
                    </button>
                </div>

                <div className="flex gap-10">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-5">
                        <div className="pebble-card px-5 py-3 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sonuç</span>
                            <span className="text-[13px] font-bold text-ocean-600">{count} Ürün</span>
                        </div>
                        <div className="pebble-card overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-ocean-100/20">
                                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategoriler</h3>
                            </div>
                            <div className="p-2.5 space-y-0.5">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                                        categoryId === '' ? 'bg-ocean-500 text-white shadow-md shadow-ocean-500/15' : 'text-slate-500 hover:bg-ocean-50/40'
                                    }`}
                                    onClick={() => setCategoryId('')}
                                >
                                    <span className={`text-[13px] font-medium ${categoryId === '' ? 'text-white' : ''}`}>Tüm Ürünler</span>
                                </div>
                                {roots.map((cat) => (
                                    <CategoryNode key={cat.id} cat={cat} childMap={childMap} selectedId={categoryId} onSelect={setCategoryId} />
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {(categoryId || search) && (
                            <div className="flex flex-wrap items-center gap-2 mb-8">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Aktif Filtreler:</span>
                                {categoryId && selectedCategory && (
                                    <button onClick={() => setCategoryId('')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-ocean-500 text-white rounded-full text-[11px] font-semibold shadow-sm hover:bg-ocean-600 transition-colors duration-300">
                                        {selectedCategory.name} <X className="w-3 h-3" />
                                    </button>
                                )}
                                {search && (
                                    <button onClick={() => setSearch('')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-500 text-white rounded-full text-[11px] font-semibold shadow-sm hover:bg-slate-600 transition-colors duration-300">
                                        &quot;{search}&quot; <X className="w-3 h-3" />
                                    </button>
                                )}
                                <button onClick={() => { setCategoryId(''); setSearch('') }} className="text-[11px] font-medium text-slate-400 hover:text-coral-500 underline underline-offset-2 transition-colors duration-300 ml-1">
                                    Tümünü Temizle
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <p className="text-[13px] font-medium text-slate-400">
                                <span className="font-semibold text-slate-600">{count}</span> ürün bulundu
                            </p>
                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="appearance-none pebble-card !rounded-xl text-slate-500 text-[13px] font-medium pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-ocean-400/20 cursor-pointer hover:text-slate-600 transition-colors duration-300"
                                >
                                    <option value="default">Önerilen Sıralama</option>
                                    <option value="newest">En Yeniler</option>
                                    <option value="name_asc">Ürün Adı (A-Z)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="pebble-card h-[440px] animate-pulse !bg-ocean-50/20" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-28 text-center">
                                <div className="w-16 h-16 rounded-full bg-ocean-50/50 flex items-center justify-center mb-5">
                                    <Search className="w-7 h-7 text-ocean-200" />
                                </div>
                                <p className="text-lg font-semibold text-slate-400">Ürün bulunamadı</p>
                                <p className="text-sm text-slate-400 mt-1.5">Farklı arama kriterleri deneyin</p>
                                <button onClick={() => { setCategoryId(''); setSearch('') }} className="mt-6 btn-ocean">
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} onQuote={setQuoteProduct} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white/90 backdrop-blur-xl z-50 shadow-2xl overflow-y-auto lg:hidden rounded-r-[32px]">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-ocean-100/20">
                            <h3 className="text-base font-semibold text-slate-600">Filtreler</h3>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-ocean-50/50 text-slate-400 transition-all duration-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="pebble-card overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-ocean-100/20">
                                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategoriler</h3>
                                </div>
                                <div className="p-2.5 space-y-0.5">
                                    <div
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${categoryId === '' ? 'bg-ocean-500 text-white' : 'text-slate-500 hover:bg-ocean-50/40'}`}
                                        onClick={() => { setCategoryId(''); setSidebarOpen(false) }}
                                    >
                                        <span className={`text-[13px] font-medium ${categoryId === '' ? 'text-white' : ''}`}>Tüm Ürünler</span>
                                    </div>
                                    {roots.map((cat) => (
                                        <CategoryNode
                                            key={cat.id}
                                            cat={cat}
                                            childMap={childMap}
                                            selectedId={categoryId}
                                            onSelect={(id) => { setCategoryId(id); setSidebarOpen(false) }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Quote Modal */}
            {quoteProduct && (
                <QuoteModal
                    open={!!quoteProduct}
                    onClose={() => setQuoteProduct(null)}
                    productId={quoteProduct.id}
                    productName={quoteProduct.name}
                />
            )}
        </div>
    )
}
