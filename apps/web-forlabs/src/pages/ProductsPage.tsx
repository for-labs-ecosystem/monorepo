import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
    Search, SlidersHorizontal, X, ChevronDown, ShoppingBag,
    Check, ArrowRight, ArrowUpRight, Tag, Sparkles, ChevronLeft, ChevronRight, Heart, Box
} from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCart } from '@/lib/cart'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useMemberAuth, parseFavoriteIds } from '@/lib/auth'
import { getImageUrl, stripHtml } from '@/lib/utils'
import type { Product, Category } from '@forlabs/shared'

// ─── Build category tree ───
interface CategoryNode extends Category {
    children: CategoryNode[]
}

function buildTree(categories: Category[]): CategoryNode[] {
    const map = new Map<number, CategoryNode>()
    const roots: CategoryNode[] = []
    categories.forEach(c => map.set(c.id, { ...c, children: [] }))
    categories.forEach(c => {
        const node = map.get(c.id)!
        if (c.parent_id && map.has(c.parent_id)) {
            map.get(c.parent_id)!.children.push(node)
        } else {
            roots.push(node)
        }
    })
    return roots
}

// Collect all descendant IDs of a category (for filtering with children)
function collectIds(node: CategoryNode): number[] {
    const ids = [node.id]
    node.children.forEach(c => ids.push(...collectIds(c)))
    return ids
}

// ─── Featured Slider (Replaces Campaign Slider) ───
function FeaturedSlider({ products }: { products: Product[] }) {
    const { lang } = useLanguage()
    const featuredProducts = useMemo(
        () => products.filter(p => p.is_featured),
        [products]
    )
    const [current, setCurrent] = useState(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const resetAutoplay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % Math.max(featuredProducts.length, 1))
        }, 5000)
    }, [featuredProducts.length])

    useEffect(() => {
        resetAutoplay()
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [resetAutoplay])

    if (featuredProducts.length === 0) return null

    const slide = featuredProducts[current % featuredProducts.length]
    const title = localizedField(slide, 'title', lang)
    const hasDiscount = typeof slide.compare_price === 'number' && typeof slide.price === 'number' && slide.compare_price > slide.price

    return (
        <div className="relative h-104 sm:h-112 w-full overflow-hidden rounded-4xl bg-[#0B1120] shadow-2xl">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute -right-20 -top-20 h-120 w-120 rounded-full bg-brand-900/20 blur-[120px]" />
                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-900/20 blur-[80px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[32px_32px]" />
                <div className="absolute inset-0 bg-linear-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent" />
            </div>

            <div className="relative z-10 flex h-full w-full items-center px-6 sm:px-8 lg:px-10">
                <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2">
                    
                    {/* Left: Content */}
                    <div className="flex flex-col items-start justify-center pb-12 pt-8 text-left lg:pb-8 lg:pt-0">
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 backdrop-blur-md">
                            <Sparkles className="h-3 w-3 text-brand-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                                {lang === 'tr' ? 'Öne Çıkan' : 'Featured'}
                            </span>
                        </div>

                        <h2
                            className="line-clamp-2 font-serif text-3xl leading-snug text-white sm:text-4xl lg:text-5xl"
                            title={title}
                        >
                            {title}
                        </h2>

                        <div className="mt-4 flex items-center gap-3">
                            {slide.brand && (
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {slide.brand}
                                </span>
                            )}
                            {slide.sku && (
                                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                                    {slide.sku}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 flex items-end gap-3 sm:mt-8">
                            {hasDiscount ? (
                                <>
                                    <span className="text-lg font-medium text-slate-500 line-through">
                                        ₺{slide.compare_price!.toLocaleString('tr-TR')}
                                    </span>
                                    <span className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
                                        ₺{slide.price!.toLocaleString('tr-TR')}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
                                    {typeof slide.price === 'number' 
                                        ? `₺${slide.price.toLocaleString('tr-TR')}` 
                                        : t('products.contactForPrice', lang)}
                                </span>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Link
                                to={`/urunler/${slide.slug}`}
                                className="group flex h-11 items-center gap-2 rounded-full bg-brand-500 px-6 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            >
                                {t('common.detailedExplore', lang)}
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Product Image inside a white card */}
                    <div className="hidden lg:flex h-full items-center justify-end pr-4 pb-8">
                        {slide.image_url ? (
                            <div className="group/img relative flex h-64 w-64 shrink-0 items-center justify-center rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:-translate-y-2 xl:h-72 xl:w-72">
                                <img
                                    src={getImageUrl(slide.image_url)}
                                    alt={title}
                                    className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover/img:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] xl:h-72 xl:w-72">
                                <Box className="h-16 w-16 text-slate-300" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slider Controls: Centered at the bottom */}
            {featuredProducts.length > 1 && (
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6">
                    <button
                        onClick={() => { setCurrent(p => (p - 1 + featuredProducts.length) % featuredProducts.length); resetAutoplay() }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                        {featuredProducts.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrent(i); resetAutoplay() }}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    i === current % featuredProducts.length
                                        ? 'w-6 bg-brand-400'
                                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => { setCurrent(p => (p + 1) % featuredProducts.length); resetAutoplay() }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Product Card ───
function ProductCard({ product }: { product: Product }) {
    const { lang } = useLanguage()
    const navigate = useNavigate()
    const { addItem, removeItem, isInCart } = useCart()
    const { member, toggleFavoriteProduct } = useMemberAuth()

    const isFav = useMemo(() => {
        if (!member?.favorite_products) return false
        return parseFavoriteIds(member.favorite_products).includes(product.id)
    }, [member?.favorite_products, product.id])

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!member) {
            navigate('/giris-yap')
            return
        }
        await toggleFavoriteProduct(product.id)
    }

    const title = localizedField(product, 'title', lang)
    const description = localizedField(product, 'description', lang)
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

    return (
        <Link
            to={`/urunler/${product.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
        >
            {/* Campaign Badge */}
            {product.campaign_label && (
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1">
                    <Tag className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                        {product.campaign_label}
                    </span>
                </div>
            )}

            {/* Favorite Button */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
            >
                <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Image */}
            <div className="relative flex h-56 items-center justify-center bg-slate-50 p-6">
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={title}
                        className="h-full w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-200">
                        <ShoppingBag className="h-12 w-12" />
                    </div>
                )}
                {/* Quick Add overlay */}
                {product.price && (
                    <button
                        onClick={handleAddToCart}
                        className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider shadow-lg transition-all duration-300 ${inCart
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-700 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-slate-900 hover:text-white'
                            }`}
                    >
                        {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                        {inCart ? t('products.inCart', lang) : t('products.addToCart', lang)}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                {product.brand && (
                    <span className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-600">
                        {product.brand}
                    </span>
                )}
                <h3 className="font-serif text-lg font-medium leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-brand-700">
                    {title}
                </h3>
                {description && (
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-500 line-clamp-2">
                        {stripHtml(description)}
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                        <div>
                            {product.compare_price && product.compare_price > (product.price ?? 0) && (
                                <span className="block text-xs text-slate-400 line-through">
                                    {new Intl.NumberFormat('tr-TR').format(product.compare_price)} {product.currency}
                                </span>
                            )}
                            {product.price ? (
                                <span className="text-xl font-bold text-slate-900">
                                    {new Intl.NumberFormat('tr-TR').format(product.price)}
                                    <span className="ml-1 text-sm font-medium text-slate-400">{product.currency}</span>
                                </span>
                            ) : (
                                <span className="text-sm font-semibold text-slate-500">
                                    {t('products.contactForPrice', lang)}
                                </span>
                            )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-600" />
                    </div>
                </div>
            </div>
        </Link>
    )
}

// ─── Flyout Category Menu (cascade side panels, infinite depth) ───
function FlyoutCategoryItem({
    node,
    selectedCategories,
    onToggle,
    depth = 0,
}: {
    node: CategoryNode
    selectedCategories: string[]
    onToggle: (id: string) => void
    depth?: number
}) {
    const { lang } = useLanguage()
    const hasChildren = node.children.length > 0
    const isSelected = selectedCategories.includes(String(node.id))
    const isAncestor = hasChildren && node.children.some(c => collectIds(c).some(id => selectedCategories.includes(String(id))))

    const [isHovered, setIsHovered] = useState(false)
    const [rect, setRect] = useState<DOMRect | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    }, [])

    const handleItemEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovered(true)
        setRect(e.currentTarget.getBoundingClientRect())
    }

    const handlePortalEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsHovered(false), 150)
    }

    return (
        <div
            className="group/item relative"
            onMouseEnter={handleItemEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={() => onToggle(String(node.id))}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${isSelected
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                    : isHovered || isAncestor
                        ? 'bg-slate-100/80 text-slate-900 border-l-2 border-brand-500/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${isSelected ? 'border-white bg-white/20' : 'border-slate-300 bg-white shadow-sm'}`}>
                        {isSelected ? <Check className="h-3 w-3 text-white" /> : null}
                    </div>
                    <span className="truncate">{localizedField(node, 'name', lang)}</span>
                </div>
                {hasChildren && (
                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-colors ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                )}
            </button>

            {/* Flyout panel rendered globally via Portal so it escapes overflow:hidden */}
            {hasChildren && isHovered && rect && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: rect.top - 8,
                        left: rect.right + 10,
                        zIndex: 99999,
                    }}
                    onMouseEnter={handlePortalEnter}
                    onMouseLeave={handleMouseLeave}
                    className="animate-in fade-in slide-in-from-left-2 zoom-in-95 duration-200"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl min-w-[260px]">
                        {/* Subtle decorative line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500/10" />

                        <div className="relative space-y-1">
                            <div className="mb-2 px-3 py-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {localizedField(node, 'name', lang)}
                                </span>
                            </div>
                            {node.children.map(child => (
                                <FlyoutCategoryItem
                                    key={child.id}
                                    node={child}
                                    selectedCategories={selectedCategories}
                                    onToggle={onToggle}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

function FlyoutCategoryMenu({
    categoryTree,
    selectedCategories,
    onCategoryToggle,
}: {
    categoryTree: CategoryNode[]
    selectedCategories: string[]
    onCategoryToggle: (v: string) => void
}) {
    const { lang } = useLanguage()

    return (
        <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {t('products.filterCategory', lang)}
            </h4>
            <div className="space-y-0.5">
                {/* Category tree as flyout items */}
                {categoryTree.map(node => (
                    <FlyoutCategoryItem
                        key={node.id}
                        node={node}
                        selectedCategories={selectedCategories}
                        onToggle={onCategoryToggle}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Filter Sidebar ───
function FilterPanel({
    categoryTree,
    brands,
    categoryMap,
    selectedCategories,
    selectedBrands,
    onCategoryToggle,
    onBrandToggle,
    onClear,
    hasActiveFilters,
}: {
    categoryTree: CategoryNode[]
    brands: string[]
    categoryMap: Map<number, CategoryNode>
    selectedCategories: string[]
    selectedBrands: string[]
    onCategoryToggle: (v: string) => void
    onBrandToggle: (v: string) => void
    onClear: () => void
    hasActiveFilters: boolean
}) {
    const { lang } = useLanguage()

    return (
        <div className="space-y-6">
            {/* Active Filters Chips */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {selectedCategories.map(id => {
                        const node = categoryMap.get(Number(id))
                        if (!node) return null
                        return (
                            <span key={id} className="inline-flex items-center gap-1.5 rounded bg-brand-50 py-1 pl-2 pr-1 text-[11px] font-semibold text-brand-700">
                                {localizedField(node, 'name', lang)}
                                <button onClick={() => onCategoryToggle(id)} className="rounded-sm p-0.5 hover:bg-brand-200">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )
                    })}
                    {selectedBrands.map(b => (
                        <span key={b} className="inline-flex items-center gap-1.5 rounded bg-slate-100 py-1 pl-2 pr-1 text-[11px] font-semibold text-slate-700">
                            {b}
                            <button onClick={() => onBrandToggle(b)} className="rounded-sm p-0.5 hover:bg-slate-200">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Category Filter — flyout cascade */}
            <FlyoutCategoryMenu
                categoryTree={categoryTree}
                selectedCategories={selectedCategories}
                onCategoryToggle={onCategoryToggle}
            />

            {/* Brand Filter */}
            {brands.length > 0 && (
                <div>
                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {t('products.filterBrand', lang)}
                    </h4>
                    <div className="space-y-0.5">
                        {brands.map(brand => {
                            const isSelected = selectedBrands.includes(brand)
                            return (
                                <button
                                    key={brand}
                                    onClick={() => onBrandToggle(brand)}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${isSelected ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <Check className="h-3 w-3" />}
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
                    onClick={onClear}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[12px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                >
                    <X className="h-3.5 w-3.5" />
                    {t('products.clearFilters', lang)}
                </button>
            )}
        </div>
    )
}

// ─── Sort Dropdown ───
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const { lang } = useLanguage()
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
        { value: 'sort_order', label: t('products.sortDefault', lang) },
        { value: 'price_asc', label: t('products.sortPriceAsc', lang) },
        { value: 'price_desc', label: t('products.sortPriceDesc', lang) },
        { value: 'name_asc', label: t('products.sortNameAsc', lang) },
        { value: 'newest', label: t('products.sortNewest', lang) },
    ]
    const current = options.find(o => o.value === value) ?? options[0]

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-300"
            >
                {current.label}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${value === opt.value ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {value === opt.value && <Check className="h-3.5 w-3.5" />}
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Page ───
export default function ProductsPage() {
    const { lang } = useLanguage()
    const { data: productsData, isLoading: productsLoading } = useProducts()
    const { data: categoriesData } = useCategories()

    const [searchParams, setSearchParams] = useSearchParams()
    const search = searchParams.get('search') || ''

    const setSearch = useCallback((val: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev)
            if (val) {
                next.set('search', val)
            } else {
                next.delete('search')
            }
            return next
        }, { replace: true })
    }, [setSearchParams])

    const [categoryFilter, setCategoryFilter] = useState<string[]>([])
    const [brandFilter, setBrandFilter] = useState<string[]>([])
    const [sort, setSort] = useState('sort_order')
    const [mobileFilter, setMobileFilter] = useState(false)

    const allProducts = useMemo(() => (productsData?.data ?? []) as Product[], [productsData])
    const allCategories = useMemo(() => (categoriesData?.data ?? []) as Category[], [categoriesData])

    // Build category tree
    const categoryTree = useMemo(() => buildTree(allCategories), [allCategories])
    const categoryMap = useMemo(() => {
        const m = new Map<number, CategoryNode>()
        function walk(nodes: CategoryNode[]) {
            nodes.forEach(n => { m.set(n.id, n); walk(n.children) })
        }
        walk(categoryTree)
        return m
    }, [categoryTree])

    const toggleCategory = (id: string) => {
        setCategoryFilter(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    }
    const toggleBrand = (b: string) => {
        setBrandFilter(prev => prev.includes(b) ? prev.filter(c => c !== b) : [...prev, b])
    }

    // Extract brands from products
    const brands = useMemo(() => {
        const set = new Set<string>()
        allProducts.forEach(p => { if (p.brand) set.add(p.brand) })
        return Array.from(set).sort()
    }, [allProducts])

    // Filter & sort
    const filtered = useMemo(() => {
        let items = allProducts

        if (search) {
            const q = search.toLowerCase()
            items = items.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.title_en?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q)
            )
        }

        if (categoryFilter.length > 0) {
            // Find all allowed IDs including children of selected categories
            const allowedCategoryIds = new Set<number>()
            categoryFilter.forEach(catIdStr => {
                const node = categoryMap.get(Number(catIdStr))
                if (node) {
                    collectIds(node).forEach(id => allowedCategoryIds.add(id))
                } else {
                    allowedCategoryIds.add(Number(catIdStr))
                }
            })
            items = items.filter(p => p.category_id !== null && allowedCategoryIds.has(p.category_id))
        }

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
                sorted.sort((a, b) => a.sort_order - b.sort_order)
        }

        return sorted
    }, [allProducts, search, categoryFilter, brandFilter, sort, categoryMap])

    const hasActiveFilters = !!(search || categoryFilter.length > 0 || brandFilter.length > 0)
    const clearFilters = () => { setSearch(''); setCategoryFilter([]); setBrandFilter([]) }

    // Meta
    useEffect(() => {
        document.title = lang === 'tr'
            ? 'Ürünler | For Labs'
            : 'Products | For Labs'
    }, [lang])

    return (
        <div className="bg-white">
            {/* Featured Slider */}
            {!productsLoading && allProducts.some(p => p.is_featured) && (
                <section className="mx-auto max-w-350 px-6 pt-8 lg:px-10">
                    <FeaturedSlider products={allProducts} />
                </section>
            )}

            {/* Page Header */}
            <section className="mx-auto max-w-[1400px] px-6 pt-12 lg:px-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="font-serif text-4xl font-medium text-slate-900 sm:text-5xl">
                            {t('products.pageTitle', lang)}
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
                            {t('products.pageDesc', lang)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-slate-400">
                            {filtered.length} {t('products.productCount', lang)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Toolbar: Search + Sort + Mobile Filter Toggle */}
            <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('products.searchPlaceholder', lang)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile filter button */}
                        <button
                            onClick={() => setMobileFilter(!mobileFilter)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-300 lg:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {t('products.filters', lang)}
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                                    !
                                </span>
                            )}
                        </button>

                        <SortDropdown value={sort} onChange={setSort} />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-8 lg:px-10">
                <div className="flex gap-10">

                    {/* Desktop Sidebar — sticky + internal scroll */}
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <div className="sticky top-28 z-40 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-5 scrollbar-thin">
                            <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                {t('products.filters', lang)}
                            </h3>
                            <div>
                                <FilterPanel
                                    categoryTree={categoryTree}
                                    brands={brands}
                                    categoryMap={categoryMap}
                                    selectedCategories={categoryFilter}
                                    selectedBrands={brandFilter}
                                    onCategoryToggle={toggleCategory}
                                    onBrandToggle={toggleBrand}
                                    onClear={clearFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            </div>
                        </div>
                    </aside>


                    {/* Mobile Filter Overlay */}
                    {mobileFilter && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileFilter(false)} />
                            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">{t('products.filters', lang)}</h3>
                                    <button onClick={() => setMobileFilter(false)} className="rounded-full p-2 hover:bg-slate-100">
                                        <X className="h-5 w-5 text-slate-600" />
                                    </button>
                                </div>
                                <FilterPanel
                                    categoryTree={categoryTree}
                                    brands={brands}
                                    categoryMap={categoryMap}
                                    selectedCategories={categoryFilter}
                                    selectedBrands={brandFilter}
                                    onCategoryToggle={toggleCategory}
                                    onBrandToggle={toggleBrand}
                                    onClear={clearFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {productsLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white">
                                        <div className="h-56 rounded-t-2xl bg-slate-100" />
                                        <div className="space-y-3 p-5">
                                            <div className="h-3 w-16 rounded-full bg-slate-100" />
                                            <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                                            <div className="h-3 w-full rounded-full bg-slate-100" />
                                            <div className="h-5 w-24 rounded-full bg-slate-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                    <Search className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="mt-6 font-serif text-2xl text-slate-900">
                                    {t('products.noResults', lang)}
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-slate-500">
                                    {t('products.noResultsDesc', lang)}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-white hover:bg-slate-700"
                                    >
                                        {t('products.clearFilters', lang)}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filtered.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
