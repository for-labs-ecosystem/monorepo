import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, ChevronDown, ChevronRight, X, SlidersHorizontal, Check } from 'lucide-react'
import { useProducts, useCategories, useCart, useMemberAuth, parseFavoriteIds } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category } from '@forlabs/shared'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function hasDescendantSelected(catId: number, childMap: Map<number, Category[]>, selectedId: string): boolean {
    const children = childMap.get(catId) ?? []
    for (const child of children) {
        if (String(child.id) === selectedId) return true
        if (hasDescendantSelected(child.id, childMap, selectedId)) return true
    }
    return false
}

function CategoryNode({
    cat,
    childMap,
    selectedId,
    onSelect,
    depth = 0,
}: {
    cat: Category
    childMap: Map<number, Category[]>
    selectedId: string
    onSelect: (id: string) => void
    depth?: number
}) {
    const children = childMap.get(cat.id) ?? []
    const hasChildren = children.length > 0
    const isSelected = selectedId === String(cat.id)
    const descendantSelected = hasChildren && hasDescendantSelected(cat.id, childMap, selectedId)
    const [open, setOpen] = useState(true)

    return (
        <div>
            <div
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 group ${
                    isSelected
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : descendantSelected
                            ? 'bg-primary-50 text-primary-800'
                            : 'text-slate-700 hover:bg-slate-100'
                }`}
                style={{ paddingLeft: `${12 + depth * 16}px` }}
                onClick={() => {
                    onSelect(isSelected ? '' : String(cat.id))
                    if (hasChildren && !open) setOpen(true)
                }}
            >
                <span className={`text-sm truncate ${
                    isSelected ? 'font-bold text-white'
                    : hasChildren ? 'font-bold' : 'font-semibold'
                }`}>
                    {cat.name}
                </span>
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
                        className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    >
                        <ChevronDown className={`w-4 h-4 ${isSelected ? 'text-white/70' : 'text-slate-400'}`} />
                    </button>
                )}
            </div>
            {hasChildren && open && (
                <div className="mt-0.5 space-y-0.5">
                    {children.map((child) => (
                        <CategoryNode
                            key={child.id}
                            cat={child}
                            childMap={childMap}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function ProductCard({ product }: { product: Product }) {
    const { addItem, removeItem, isInCart } = useCart()
    const { member, toggleFavoriteProduct } = useMemberAuth()
    const navigate = useNavigate()
    const favorited = parseFavoriteIds(member?.favorite_products).includes(product.id)
    const inCart = isInCart(product.id)

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!member) { navigate('/giris'); return }
        toggleFavoriteProduct(product.id)
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (inCart) {
            removeItem(product.id)
            return
        }
        if (product.price == null) return
        addItem({
            id: product.id,
            slug: product.slug,
            title: product.title,
            image_url: product.image_url ?? null,
            price: product.price,
            currency: product.currency ?? 'TRY',
            brand: product.brand ?? null,
        })
    }

    return (
        <div className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.10)] hover:-translate-y-1.5 transition-all duration-300 relative">
            {/* Favorite */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute top-4 right-4 z-20 w-9 h-9 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center transition-all duration-300 group/fav ${
                    favorited
                        ? 'bg-red-50 text-red-500 shadow-red-100'
                        : 'bg-white/80 text-slate-400 hover:text-red-500'
                }`}
            >
                <Heart className={`w-4 h-4 transition-all duration-300 ${favorited ? 'fill-red-500 text-red-500' : 'group-hover/fav:fill-red-500'}`} strokeWidth={2} />
            </button>

            <Link to={`/urunler/${product.slug}`} className="aspect-square bg-slate-50/50 p-8 flex items-center justify-center overflow-hidden relative">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {Boolean(product.is_featured) && (
                        <div className="bg-green-500/10 text-green-700 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                            Stokta
                        </div>
                    )}
                    {product.campaign_label && (
                        <div className="bg-orange-500/10 text-orange-700 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                            {product.campaign_label}
                        </div>
                    )}
                    {product.brand && (
                        <div className="bg-white/80 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                            {product.brand}
                        </div>
                    )}
                </div>
                <img
                    src={getImageUrl(product.image_url)}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
            </Link>

            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                    <Link to={`/urunler/${product.slug}`}>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug">
                            {product.title}
                        </h3>
                    </Link>
                    {product.model_number && (
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">
                            Model: <span className="text-slate-600">{product.model_number}</span>
                        </p>
                    )}
                    {product.description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {product.price != null ? (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fiyat</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-primary-900 tabular-nums tracking-tight">
                                    {product.price.toLocaleString('tr-TR')}
                                </span>
                                <span className="text-xs font-bold text-primary-600/70">{product.currency}</span>
                            </div>
                            {product.compare_price != null && product.compare_price > product.price && (
                                <span className="text-xs text-slate-400 line-through tabular-nums">
                                    {product.compare_price.toLocaleString('tr-TR')} {product.currency}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-slate-400">Fiyat sorunuz</span>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={product.price == null}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ${
                            inCart
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30'
                                : product.price == null
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none hover:translate-y-0'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30'
                        }`}
                    >
                        {inCart ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Sepette</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">{product.price == null ? 'Fiyat Sorunuz' : 'Sepete Ekle'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sortOption, setSortOption] = useState('default')

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
            case 'price_asc':
                return arr.sort((a, b) => {
                    if (a.price == null && b.price == null) return 0
                    if (a.price == null) return 1
                    if (b.price == null) return -1
                    return a.price - b.price
                })
            case 'price_desc':
                return arr.sort((a, b) => {
                    if (a.price == null && b.price == null) return 0
                    if (a.price == null) return 1
                    if (b.price == null) return -1
                    return b.price - a.price
                })
            case 'newest':
                return arr.sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })
            case 'name_asc':
                return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            case 'default':
            default:
                return arr
        }
    }, [rawProducts, sortOption])

    const { roots, childMap } = useMemo(() => buildCategoryTree(categories), [categories])

    const selectedCategory = categories.find((c) => String(c.id) === categoryId)

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-600">Ürünler</span>
                        {selectedCategory && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-slate-600">{selectedCategory.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        {selectedCategory ? selectedCategory.name : 'Tüm Ürünler'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-base">
                        {selectedCategory?.description ?? 'ATAGO dijital refraktometreler, polarimetreler ve laboratuvar ölçüm cihazları'}
                    </p>
                </div>

                {/* ── Search Bar (top) ── */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ürün adı, marka veya model ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 shadow-sm transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-300 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtrele
                        {categoryId && (
                            <span className="w-2 h-2 rounded-full bg-primary-600" />
                        )}
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* ── Sidebar (desktop) ── */}
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-4">
                        <FilterPanel
                            roots={roots}
                            childMap={childMap}
                            categories={categories}
                            categoryId={categoryId}
                            setCategoryId={setCategoryId}
                            search={search}
                            setSearch={setSearch}
                            count={count}
                            products={products}
                        />
                    </aside>

                    {/* ── Product Grid ── */}
                    <div className="flex-1 min-w-0">
                        {/* Active filter chips */}
                        {(categoryId || search) && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif Filtreler:</span>
                                {categoryId && selectedCategory && (
                                    <button
                                        onClick={() => setCategoryId('')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-full text-xs font-bold shadow-sm hover:bg-primary-700 transition-colors"
                                    >
                                        {selectedCategory.name}
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-full text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors"
                                    >
                                        "{search}"
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                <button
                                    onClick={() => { setCategoryId(''); setSearch('') }}
                                    className="text-xs font-semibold text-slate-400 hover:text-red-500 underline underline-offset-2 transition-colors ml-1"
                                >
                                    Tümünü Temizle
                                </button>
                            </div>
                        )}

                        {/* Count line & Sort */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <p className="text-sm font-medium text-slate-500">
                                <span className="font-bold text-slate-900">{count}</span> ürün bulundu
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-500 hidden sm:inline">Sırala:</span>
                                <div className="relative">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
                                    >
                                        <option value="default">Önerilen Sıralama</option>
                                        <option value="price_asc">En Düşük Fiyat</option>
                                        <option value="price_desc">En Yüksek Fiyat</option>
                                        <option value="newest">En Yeniler</option>
                                        <option value="name_asc">Ürün Adı (A-Z)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-[2rem] h-[420px] animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <Search className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-lg font-bold text-slate-400">Ürün bulunamadı</p>
                                <p className="text-sm text-slate-400 mt-1">Farklı arama kriterleri deneyin</p>
                                <button
                                    onClick={() => { setCategoryId(''); setSearch('') }}
                                    className="mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-primary-700 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Sidebar Drawer ── */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Filtreler</h3>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <FilterPanel
                                roots={roots}
                                childMap={childMap}
                                categories={categories}
                                categoryId={categoryId}
                                setCategoryId={(id) => { setCategoryId(id); setSidebarOpen(false) }}
                                search={search}
                                setSearch={setSearch}
                                count={count}
                                products={products}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// ─── Filter Panel (shared between desktop sidebar and mobile drawer) ──────────

function FilterPanel({
    roots,
    childMap,
    categories,
    categoryId,
    setCategoryId,
    count,
}: {
    roots: Category[]
    childMap: Map<number, Category[]>
    categories: Category[]
    categoryId: string
    setCategoryId: (id: string) => void
    search: string
    setSearch: (s: string) => void
    count: number
    products: Product[]
}) {
    return (
        <>
            {/* Result count card */}
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sonuç</span>
                <span className="text-sm font-black text-primary-700">{count} Ürün</span>
            </div>

            {/* Categories section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategoriler</h3>
                </div>
                <div className="p-2 space-y-0.5">
                    {/* All categories option */}
                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                            categoryId === ''
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => setCategoryId('')}
                    >
                        <span className={`text-sm font-semibold ${categoryId === '' ? 'text-white' : ''}`}>Tüm Ürünler</span>
                    </div>

                    {categories.length === 0 ? (
                        <div className="px-3 py-4 space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        roots.map((cat) => (
                            <CategoryNode
                                key={cat.id}
                                cat={cat}
                                childMap={childMap}
                                selectedId={categoryId}
                                onSelect={setCategoryId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Brand quick-filters could go here in the future */}
        </>
    )
}
