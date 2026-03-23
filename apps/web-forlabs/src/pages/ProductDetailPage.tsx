import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ChevronRight, ShoppingBag, Check, ArrowLeft, Tag,
    Shield, Award, Barcode, Truck, Heart,
    Beaker, Layers, FileText, Phone, Minus, Plus
} from 'lucide-react'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { useCart } from '@/lib/cart'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useMemberAuth } from '@/lib/auth'
import { getImageUrl } from '@/lib/utils'
import type { Product } from '@forlabs/shared'

// ─── Helper: Parse JSON-like strings ───
function parseField(value: string | null): string[] {
    if (!value) return []
    try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
            return parsed.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item !== null) {
                    if ('key' in item && 'value' in item) {
                        return item.key ? `${item.key}: ${item.value}` : item.value;
                    }
                    return item.value || JSON.stringify(item);
                }
                return String(item);
            }).filter(Boolean)
        }
        // If it's an object, ignore — handled by parseSpecsObject
    } catch {
        // Not JSON — split by commas or newlines
    }
    return value.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
}

// ─── Helper: Parse specs (JSON object → [{key, value}], HTML, or plain text) ───
type SpecsMode = 'table' | 'html' | 'text'
function detectSpecsMode(specs: string): SpecsMode {
    if (!specs) return 'text'
    try {
        const parsed = JSON.parse(specs)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return 'table'
    } catch { /* not JSON */ }
    if (/<[a-z][\s\S]*>/i.test(specs)) return 'html'
    return 'text'
}
function parseSpecsObject(specs: string): Array<{ key: string; value: string }> {
    try {
        const parsed = JSON.parse(specs)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return Object.entries(parsed).map(([key, val]) => ({
                key: key.replace(/_/g, ' '),
                value: String(val),
            }))
        }
    } catch { /* not JSON */ }
    return []
}

// ─── Gallery ───
function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
    const [active, setActive] = useState(0)

    if (images.length === 0) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-slate-50 text-slate-200">
                <ShoppingBag className="h-24 w-24" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8">
                <img
                    src={images[active]}
                    alt={alt}
                    className="h-full w-full object-contain transition-all duration-500"
                />
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-2 transition-all ${i === active
                                ? 'border-brand-500 ring-2 ring-brand-100'
                                : 'border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <img src={img} alt="" className="h-full w-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Spec Card ───
function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3 transition-colors hover:border-slate-200 hover:bg-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-slate-500 shadow-sm ring-1 ring-slate-100/50">
                {icon}
            </div>
            <div className="flex min-w-0 flex-col justify-center">
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="truncate text-[13px] font-semibold text-slate-800">{value}</p>
            </div>
        </div>
    )
}

// ─── Tab Content ───
function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={`relative px-5 py-3 text-[13px] font-semibold transition-colors ${active
                ? 'text-brand-700'
                : 'text-slate-500 hover:text-slate-700'
                }`}
        >
            {children}
            {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-600" />
            )}
        </button>
    )
}

// ─── Related Product Card ───
function RelatedCard({ product }: { product: Product }) {
    const { lang } = useLanguage()
    const navigate = useNavigate()
    const { member, toggleFavoriteProduct } = useMemberAuth()
    const title = localizedField(product, 'title', lang)

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

    return (
        <Link
            to={`/urunler/${product.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5"
        >
            {/* Favorite Button */}
            <button
                onClick={handleToggleFavorite}
                className={`absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
            >
                <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <div className="flex h-44 items-center justify-center bg-slate-50 p-4">
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={title}
                        className="h-full w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <ShoppingBag className="h-10 w-10 text-slate-200" />
                )}
            </div>
            <div className="p-4">
                {product.brand && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                        {product.brand}
                    </span>
                )}
                <h4 className="mt-1 text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-brand-700">
                    {title}
                </h4>
                {product.price && (
                    <p className="mt-2 text-base font-bold text-slate-900">
                        {new Intl.NumberFormat('tr-TR').format(product.price)}
                        <span className="ml-1 text-xs font-medium text-slate-400">{product.currency}</span>
                    </p>
                )}
            </div>
        </Link>
    )
}

// ─── Page ───
export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { lang } = useLanguage()
    const navigate = useNavigate()
    const { data: productData, isLoading } = useProduct(slug ?? '')
    const { data: allProductsData } = useProducts()
    const { addItem, isInCart, updateQuantity, items } = useCart()
    const { member, toggleFavoriteProduct } = useMemberAuth()

    const [tab, setTab] = useState<'description' | 'specs' | 'features'>('description')
    const [quantity, setQuantity] = useState(1)

    const product = productData?.data as Product | undefined
    const allProducts = (allProductsData?.data ?? []) as Product[]

    // Build gallery from image_url + gallery
    const galleryImages = useMemo(() => {
        if (!product) return []
        const imgs: string[] = []
        if (product.image_url) imgs.push(getImageUrl(product.image_url))
        if (product.gallery) {
            try {
                const parsed = JSON.parse(product.gallery)
                if (Array.isArray(parsed)) {
                    parsed.forEach((url: string) => {
                        if (url) {
                            const expanded = getImageUrl(url)
                            if (!imgs.includes(expanded)) imgs.push(expanded)
                        }
                    })
                }
            } catch {
                // gallery might be comma-separated
                product.gallery.split(',').forEach(url => {
                    const trimmed = url.trim()
                    if (trimmed) {
                        const expanded = getImageUrl(trimmed)
                        if (!imgs.includes(expanded)) imgs.push(expanded)
                    }
                })
            }
        }
        return imgs
    }, [product])

    const title = product ? localizedField(product, 'title', lang) : ''
    const description = product ? localizedField(product, 'description', lang) : ''
    const content = product ? localizedField(product, 'content', lang) : ''
    const specs = product ? localizedField(product, 'specs', lang) : ''
    const features = product ? parseField(localizedField(product, 'features', lang)) : []
    const applicationAreas = product ? parseField(localizedField(product, 'application_areas', lang)) : []
    const tags = product ? parseField(localizedField(product, 'tags', lang)) : []

    const inCart = product ? isInCart(product.id) : false
    const cartItem = product ? items.find(i => i.id === product.id) : undefined

    const isFav = useMemo(() => {
        if (!member?.favorite_products || !product?.id) return false
        try {
            const arr = JSON.parse(member.favorite_products)
            if (!Array.isArray(arr)) return false
            const ids = arr.map((item: unknown) => typeof item === 'object' && item !== null && 'id' in item ? Number((item as Record<string, unknown>).id) : Number(item))
            return ids.includes(product.id)
        } catch {
            return false
        }
    }, [member, product?.id])

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!product) return
        if (!member) {
            navigate('/giris-yap')
            return
        }
        await toggleFavoriteProduct(product.id)
    }

    // Related products (same category or same brand, exclude current)
    const relatedProducts = useMemo(() => {
        if (!product) return []
        return allProducts
            .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.brand === product.brand))
            .slice(0, 4)
    }, [product, allProducts])

    // SEO meta
    useEffect(() => {
        if (product) {
            document.title = product.meta_title || `${title} | For Labs`
            const meta = document.querySelector('meta[name="description"]')
            if (meta) meta.setAttribute('content', product.meta_description || description || '')
        }
    }, [product, title, description])

    const handleAddToCart = () => {
        if (!product || !product.price) return
        if (inCart) {
            navigate('/sepet')
        } else {
            addItem({
                id: product.id,
                slug: product.slug,
                title: product.title,
                image_url: product.image_url,
                price: product.price,
                currency: product.currency,
                brand: product.brand,
            }, quantity)
        }
    }

    const currentQty = inCart ? (cartItem?.quantity ?? 1) : quantity

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1400px] animate-pulse px-6 py-12 lg:px-10">
                <div className="mb-8 h-4 w-40 rounded-full bg-slate-200" />
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div className="aspect-square rounded-3xl bg-slate-100" />
                    <div className="space-y-6">
                        <div className="h-3 w-20 rounded-full bg-slate-200" />
                        <div className="h-8 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-4 w-full rounded-full bg-slate-100" />
                        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
                        <div className="h-10 w-40 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <ShoppingBag className="h-16 w-16 text-slate-200" />
                <h2 className="mt-6 font-serif text-2xl text-slate-900">
                    {t('products.noResults', lang)}
                </h2>
                <Link
                    to="/urunler"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-white hover:bg-slate-700"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('products.backToProducts', lang)}
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white">
            {/* Breadcrumb */}
            <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
                <nav className="flex items-center gap-2 text-[13px] text-slate-400">
                    <Link to="/" className="transition-colors hover:text-slate-700">
                        {t('common.home', lang)}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link to="/urunler" className="transition-colors hover:text-slate-700">
                        {t('common.products', lang)}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium text-slate-700 line-clamp-1">{title}</span>
                </nav>
            </section>

            {/* Main Content */}
            <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left: Gallery */}
                    <ProductGallery images={galleryImages} alt={title} />

                    {/* Right: Product Info */}
                    <div>
                        {/* Campaign Badge */}
                        {product.campaign_label && (
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5">
                                <Tag className="h-3.5 w-3.5 text-white" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                                    {product.campaign_label}
                                </span>
                            </div>
                        )}

                        {/* Brand */}
                        {product.brand && (
                            <p className="mb-2 text-[12px] font-bold uppercase tracking-widest text-brand-600">
                                {product.brand}
                            </p>
                        )}

                        {/* Title */}
                        <h1 className="font-serif text-3xl font-medium leading-tight text-slate-900 sm:text-4xl">
                            {title}
                        </h1>

                        {/* Short Description */}
                        {description && (
                            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                                {description}
                            </p>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Price Block */}
                        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <div className="flex items-end gap-3">
                                {product.compare_price && product.compare_price > (product.price ?? 0) && (
                                    <span className="text-lg text-slate-400 line-through">
                                        {new Intl.NumberFormat('tr-TR').format(product.compare_price)} {product.currency}
                                    </span>
                                )}
                                {product.price ? (
                                    <span className="text-3xl font-bold text-slate-900">
                                        {new Intl.NumberFormat('tr-TR').format(product.price)}
                                        <span className="ml-2 text-base font-medium text-slate-400">{product.currency}</span>
                                    </span>
                                ) : (
                                    <span className="text-lg font-semibold text-slate-500">
                                        {t('products.contactForPrice', lang)}
                                    </span>
                                )}
                                {product.unit && (
                                    <span className="text-sm text-slate-400">/ {product.unit}</span>
                                )}
                            </div>

                            {/* Quantity + Add to Cart */}
                            {product.price && (
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (inCart) {
                                                    updateQuantity(product.id, Math.max(1, currentQty - 1))
                                                } else {
                                                    setQuantity(q => Math.max(1, q - 1))
                                                }
                                            }}
                                            className="px-3 py-2.5 text-slate-400 transition-colors hover:text-slate-700"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="min-w-[3rem] text-center text-sm font-bold text-slate-900">
                                            {currentQty}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (inCart) {
                                                    updateQuantity(product.id, currentQty + 1)
                                                } else {
                                                    setQuantity(q => q + 1)
                                                }
                                            }}
                                            className="px-3 py-2.5 text-slate-400 transition-colors hover:text-slate-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3 text-[12px] font-bold uppercase tracking-widest transition-all ${inCart
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            : 'bg-slate-900 text-white hover:bg-slate-700 hover:shadow-lg'
                                            }`}
                                    >
                                        {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                                        {inCart ? t('products.inCart', lang) : t('products.addToCart', lang)}
                                    </button>
                                </div>
                            )}

                            {/* Favorites & Request Quote */}
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-6 text-[12px] font-bold uppercase tracking-widest transition-all ${isFav ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                                    {isFav ? (lang === 'tr' ? 'Favorilerde' : 'In Favorites') : (lang === 'tr' ? 'Favoriye Ekle' : 'Favorite')}
                                </button>

                                <Link
                                    to="/iletisim"
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-[12px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                                >
                                    <Phone className="h-4 w-4" />
                                    {t('common.getQuote', lang)}
                                </Link>
                            </div>
                        </div>

                        {/* Key Specs Quick View */}
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:gap-4">
                            {product.model_number && (
                                <SpecCard icon={<Layers className="h-4 w-4" />} label={t('product.modelNumber', lang)} value={product.model_number} />
                            )}
                            {product.sku && (
                                <SpecCard icon={<Barcode className="h-4 w-4" />} label="SKU" value={product.sku} />
                            )}
                            {product.warranty_period && (
                                <SpecCard icon={<Shield className="h-4 w-4" />} label={t('product.warranty', lang)} value={product.warranty_period} />
                            )}
                            <SpecCard
                                icon={<Truck className="h-4 w-4" />}
                                label={lang === 'tr' ? 'Teslimat' : 'Delivery'}
                                value={lang === 'tr' ? 'Stoğa Göre 1-3 Gün/4-6 Hafta' : 'In Stock: 1-3 Days/4-6 Weeks'}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs: Description / Specs / Features */}
            <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-10">
                <div className="border-b border-slate-200">
                    <div className="flex gap-1">
                        {content && (
                            <TabButton active={tab === 'description'} onClick={() => setTab('description')}>
                                {t('product.tabDescription', lang)}
                            </TabButton>
                        )}
                        {specs && (
                            <TabButton active={tab === 'specs'} onClick={() => setTab('specs')}>
                                {t('product.tabSpecs', lang)}
                            </TabButton>
                        )}
                        {(features.length > 0 || applicationAreas.length > 0) && (
                            <TabButton active={tab === 'features'} onClick={() => setTab('features')}>
                                {t('product.tabFeatures', lang)}
                            </TabButton>
                        )}
                    </div>
                </div>

                <div className="py-10">
                    {tab === 'description' && content && (
                        <div
                            className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-medium prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px]"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}

                    {tab === 'specs' && specs && (() => {
                        const mode = detectSpecsMode(specs)
                        if (mode === 'table') {
                            const rows = parseSpecsObject(specs)
                            return (
                                <div className="overflow-hidden rounded-2xl border border-slate-100">
                                    <table className="w-full">
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                                                >
                                                    <td className="w-2/5 border-b border-slate-100 px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-slate-500 capitalize">
                                                        {row.key}
                                                    </td>
                                                    <td className="border-b border-slate-100 px-5 py-3 text-sm font-medium text-slate-800">
                                                        {row.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                        if (mode === 'html') {
                            return (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                                    <div
                                        className="prose prose-slate max-w-none prose-table:w-full prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-[12px] prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-slate-500 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: specs }}
                                    />
                                </div>
                            )
                        }
                        // plain text
                        return (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{specs}</p>
                            </div>
                        )
                    })()}

                    {tab === 'features' && (
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                            {/* Features List */}
                            {features.length > 0 && (
                                <div>
                                    <h3 className="mb-6 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-500">
                                        <Award className="h-4 w-4" />
                                        {t('product.features', lang)}
                                    </h3>
                                    <ul className="space-y-3">
                                        {features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                                <span className="text-sm text-slate-700">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Application Areas */}
                            {applicationAreas.length > 0 && (
                                <div>
                                    <h3 className="mb-6 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-500">
                                        <Beaker className="h-4 w-4" />
                                        {t('product.applicationAreas', lang)}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {applicationAreas.map((area, i) => (
                                            <span
                                                key={i}
                                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Compliance Tags */}
                    {product.compliance_tags && (
                        <div className="mt-10 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                            <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                            <div>
                                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
                                    {t('product.compliance', lang)}
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-700">
                                    {parseField(product.compliance_tags).join(' · ')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="border-t border-slate-100 bg-slate-50/30">
                    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-serif text-2xl font-medium text-slate-900">
                                {t('product.relatedProducts', lang)}
                            </h2>
                            <Link
                                to="/urunler"
                                className="flex items-center gap-2 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-800"
                            >
                                {t('products.pageTitle', lang)}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {relatedProducts.map(p => (
                                <RelatedCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
