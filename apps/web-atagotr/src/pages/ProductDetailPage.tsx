import { useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProduct, useCart, useMemberAuth, parseFavoriteIds, type CartItem } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Product } from '@forlabs/shared'
import {
    ShoppingCart,
    Truck,
    ShieldCheck,
    Award,
    ChevronRight,
    Minus,
    Plus,
    Check,
    Heart,
    Share2,
    Package,
    ArrowLeft,
    FlaskConical,
    Microscope,
    BadgeCheck,
    Cog,
    RefreshCcw,
    Headphones,
    MapPin,
} from 'lucide-react'

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useProduct(slug ?? '')
    const { addItem, removeItem, isInCart } = useCart()
    const { member, toggleFavoriteProduct } = useMemberAuth()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)
    const [addedToCart, setAddedToCart] = useState(false)
    const [copied, setCopied] = useState(false)

    const product = data?.data as Product | undefined

    // ── All derived values — safe with optional chaining when product is undefined ──
    const alreadyInCart = isInCart(product?.id ?? -1)
    const isFavorite = useMemo(() => {
        if (!product?.id) return false
        return parseFavoriteIds(member?.favorite_products).includes(product.id)
    }, [member?.favorite_products, product?.id])

    const handleToggleFavorite = useCallback(() => {
        if (!product) return
        if (!member) { navigate('/giris'); return }
        toggleFavoriteProduct(product.id)
    }, [product?.id, member, navigate, toggleFavoriteProduct])

    const handleShare = useCallback(async () => {
        if (!product) return
        const url = window.location.href
        if (navigator.share) {
            try { await navigator.share({ title: product.title, url }) } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [product?.title])

    const handleAddToCart = useCallback(() => {
        if (!product) return
        if (alreadyInCart) {
            removeItem(product.id)
            return
        }
        const cartItem: Omit<CartItem, 'quantity'> = {
            id: product.id,
            slug: product.slug,
            title: product.title,
            image_url: product.image_url,
            price: product.price ?? 0,
            currency: product.currency ?? 'TRY',
            brand: product.brand,
        }
        addItem(cartItem, quantity)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2500)
    }, [product?.id, alreadyInCart, quantity, addItem, removeItem])

    // ── Early returns AFTER all hooks ──
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse" />
                        <div className="h-10 bg-slate-100 rounded w-2/3 animate-pulse" />
                        <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                        <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                        <div className="h-12 bg-slate-100 rounded w-1/3 animate-pulse mt-8" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Ürün Bulunamadı</h1>
                <p className="text-slate-500 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/urunler" className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                    <ArrowLeft className="w-4 h-4" /> Ürünlere Dön
                </Link>
            </div>
        )
    }

    // ── Derived data — product is guaranteed non-null below this point ──
    const gallery: string[] = []
    if (product.image_url) gallery.push(product.image_url)
    try {
        const parsed = JSON.parse(product.gallery || '[]')
        if (Array.isArray(parsed)) {
            parsed.forEach((img: string) => {
                if (img && !gallery.includes(img)) gallery.push(img)
            })
        }
    } catch { /* ignore */ }
    if (gallery.length === 0) gallery.push('')

    let features: Array<{ key: string; value: string }> = []
    try {
        const parsed = JSON.parse(product.features || '[]')
        if (Array.isArray(parsed)) features = parsed
    } catch { /* ignore */ }

    let specsEntries: Array<[string, string]> = []
    let specsHtml: string | null = null
    if (product.specs) {
        try {
            const parsed: unknown = JSON.parse(product.specs)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                specsEntries = Object.entries(parsed as Record<string, unknown>).map(
                    ([k, v]) => [k, String(v)]
                )
            } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                specsEntries = (parsed as Array<{ key: string; value: string }>)
                    .filter(e => e.key)
                    .map(e => [e.key, e.value])
            } else {
                specsHtml = product.specs
            }
        } catch {
            specsHtml = product.specs
        }
    }

    let applicationAreas: string[] = []
    try {
        const parsed = JSON.parse(product.application_areas || '[]')
        if (Array.isArray(parsed)) applicationAreas = parsed
    } catch { /* ignore */ }

    let analysisTypes: string[] = []
    try {
        const parsed = JSON.parse(product.analysis_types || '[]')
        if (Array.isArray(parsed)) analysisTypes = parsed
    } catch { /* ignore */ }

    let complianceTags: string[] = []
    try {
        const parsed = JSON.parse(product.compliance_tags || '[]')
        if (Array.isArray(parsed)) complianceTags = parsed
    } catch { /* ignore */ }

    const automationLevel = product.automation_level
    const automationLabelMap: Record<string, string> = {
        'manual': 'Manuel',
        'semi-auto': 'Yarı Otomatik',
        'full-auto': 'Tam Otomatik',
    }

    const hasIntelligenceData = applicationAreas.length > 0 || analysisTypes.length > 0 || complianceTags.length > 0 || !!automationLevel

    const discount = product.compare_price && product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                <Link to="/" className="hover:text-primary-600 transition-colors">Ana Sayfa</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/urunler" className="hover:text-primary-600 transition-colors">Ürünler</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                {/* LEFT — Gallery */}
                <div>
                    <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl p-8 flex items-center justify-center overflow-hidden mb-4">
                        <img
                            src={getImageUrl(gallery[activeImage])}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                    {gallery.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {gallery.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-20 h-20 rounded-lg border-2 p-2 flex items-center justify-center shrink-0 transition-colors ${
                                        activeImage === i
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <img src={getImageUrl(img)} alt="" className="max-h-full max-w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT — Product Info */}
                <div>
                    {/* Brand & Campaign */}
                    <div className="flex items-center gap-3 mb-3">
                        {product.brand && (
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{product.brand}</span>
                        )}
                        {product.campaign_label && (
                            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                                {product.campaign_label}
                            </span>
                        )}
                        {discount && (
                            <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full">
                                %{discount} İndirim
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">{product.title}</h1>

                    {product.model_number && (
                        <p className="text-sm text-slate-400 mb-4">Model: {product.model_number} · SKU: {product.sku}</p>
                    )}

                    {product.description && (
                        <div
                            className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-a:text-primary-600 text-slate-600 mb-6"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {/* Price */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                        <div className="flex items-baseline gap-3 mb-1">
                            {product.price != null && (
                                <span className="text-3xl font-extrabold text-primary-700 tabular-nums">
                                    {product.price.toLocaleString('tr-TR')}
                                </span>
                            )}
                            <span className="text-sm text-slate-400 font-medium">{product.currency ?? 'TRY'}</span>
                            {product.compare_price != null && product.price != null && product.compare_price > product.price && (
                                <span className="text-lg text-slate-400 line-through tabular-nums">
                                    {product.compare_price.toLocaleString('tr-TR')}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">KDV dahildir. Kargo ücreti ödeme adımında hesaplanır.</p>
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="p-3 hover:bg-slate-50 transition-colors"
                            >
                                <Minus className="w-4 h-4 text-slate-500" />
                            </button>
                            <span className="w-12 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="p-3 hover:bg-slate-50 transition-colors"
                            >
                                <Plus className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={addedToCart && !alreadyInCart}
                            className={`flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
                                alreadyInCart
                                    ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                                    : addedToCart
                                        ? 'bg-green-500 text-white shadow-green-200'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 hover:shadow-lg'
                            }`}
                        >
                            {alreadyInCart ? (
                                <><Check className="w-5 h-5" /> Sepette</>
                            ) : addedToCart ? (
                                <><Check className="w-5 h-5" /> Sepete Eklendi!</>
                            ) : (
                                <><ShoppingCart className="w-5 h-5" /> Sepete Ekle</>
                            )}
                        </button>
                    </div>

                    {/* Secondary actions */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={handleToggleFavorite}
                            className={`flex items-center gap-2 text-sm transition-colors px-4 py-2 border rounded-lg ${
                                isFavorite
                                    ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                                    : 'text-slate-500 hover:text-primary-600 border-slate-200 hover:border-primary-200'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                            {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors px-4 py-2 border border-slate-200 rounded-lg hover:border-primary-200"
                        >
                            <Share2 className="w-4 h-4" />
                            {copied ? 'Bağlantı Kopyalandı!' : 'Paylaş'}
                        </button>
                        {alreadyInCart && !addedToCart && (
                            <Link to="/sepet" className="flex items-center gap-2 text-sm text-primary-600 font-medium px-4 py-2 border border-primary-200 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors">
                                <ShoppingCart className="w-4 h-4" /> Sepete Git
                            </Link>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Truck, label: 'Teslimat', desc: 'Stoğa Göre 1-3 Gün/4-6 Hafta' },
                            { icon: ShieldCheck, label: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme' },
                            { icon: Award, label: 'Distribütör Garantisi', desc: 'Resmi ATAGO garantisi' },
                        ].map((badge) => (
                            <div key={badge.label} className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <badge.icon className="w-5 h-5 text-primary-600 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-slate-700">{badge.label}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Specs — JSON key-value table or HTML fallback */}
            {(specsEntries.length > 0 || specsHtml) && (
                <section className="mt-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Teknik Detaylar</h2>
                    {specsEntries.length > 0 ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {specsEntries.map(([key, value], i) => (
                                <div key={key} className={`flex ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                    <div className="w-1/3 sm:w-1/4 px-5 py-3.5 text-sm font-medium text-slate-600 border-r border-slate-200 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </div>
                                    <div className="flex-1 px-5 py-3.5 text-sm text-slate-900">{value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary-600"
                            dangerouslySetInnerHTML={{ __html: specsHtml! }}
                        />
                    )}
                </section>
            )}

            {/* Features Table */}
            {features.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Teknik Özellikler</h2>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className={`flex ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                            >
                                <div className="w-1/3 sm:w-1/4 px-5 py-3.5 text-sm font-medium text-slate-600 border-r border-slate-200">
                                    {f.key}
                                </div>
                                <div className="flex-1 px-5 py-3.5 text-sm text-slate-900">{f.value}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Intelligence Platform — Uygulama ve Uyumluluk */}
            {hasIntelligenceData && (
                <section className="mt-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Uygulama ve Uyumluluk</h2>
                    <div className="border border-slate-200 rounded-xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {applicationAreas.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <FlaskConical className="w-4.5 h-4.5 text-primary-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">Uygulama Alanları & Sektörler</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {applicationAreas.map((area) => (
                                        <span
                                            key={area}
                                            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysisTypes.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Microscope className="w-4.5 h-4.5 text-indigo-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">Analiz Tipleri</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysisTypes.map((type) => (
                                        <span
                                            key={type}
                                            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {complianceTags.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <BadgeCheck className="w-4.5 h-4.5 text-emerald-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">Uyumluluk Standartları</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {complianceTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {automationLevel && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Cog className="w-4.5 h-4.5 text-amber-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">Otomasyon Seviyesi</h3>
                                </div>
                                <div>
                                    <span className="inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                        {automationLabelMap[automationLevel] ?? automationLevel}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Rich Content — no outer h2 since content HTML already has its own headings */}
            {product.content && (
                <section className="mt-16">
                    <div
                        className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary-600"
                        dangerouslySetInnerHTML={{ __html: product.content }}
                    />
                </section>
            )}
            {/* Trust & Guarantee Section */}
            <section className="mt-20 border-t border-slate-200 pt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-primary-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Protek Analitik Güvencesi</p>
                            <p className="text-xs text-slate-500 mt-0.5">Tüm ürünler Atago Türkiye resmi temsilcisi Protek Analitik tarafından temin edilir</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <RefreshCcw className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Kolay İade</p>
                            <p className="text-xs text-slate-500 mt-0.5">14 gün içinde sorunsuz iade ve değişim</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Headphones className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Teknik Destek</p>
                            <p className="text-xs text-slate-500 mt-0.5">Protek Analitik güvenceli satış sonrası teknik destek ve kalibrasyon hizmeti</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Yerli Servis Ağı</p>
                            <p className="text-xs text-slate-500 mt-0.5">Türkiye genelinde kalibrasyonlu servis</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 py-6 px-8 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-500">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-semibold">Güvenli Ödeme</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-slate-200 mx-2" />
                    {/* Iyzico */}
                    <div className="flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-200 transition-colors">
                        <span className="text-sm font-extrabold tracking-tight" style={{color:'#1A1446'}}>iyzico</span>
                    </div>
                    {/* Visa */}
                    <div className="flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-200 transition-colors">
                        <span className="text-base font-black italic" style={{color:'#1A1F71'}}>VISA</span>
                    </div>
                    {/* Mastercard */}
                    <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-200 transition-colors">
                        <div className="flex -space-x-2">
                            <span className="w-5 h-5 rounded-full inline-block" style={{background:'#EB001B'}} />
                            <span className="w-5 h-5 rounded-full inline-block" style={{background:'#F79E1B', opacity: 0.9}} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 ml-1">Mastercard</span>
                    </div>
                    {/* Troy */}
                    <div className="flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-200 transition-colors">
                        <span className="text-sm font-black tracking-widest" style={{color:'#003087'}}>TROY</span>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-slate-200 mx-2" />
                    <span className="text-sm font-medium text-slate-500">256-bit SSL şifreleme</span>
                </div>
            </section>
        </div>
    )
}
