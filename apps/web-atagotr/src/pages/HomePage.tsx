import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Cpu, Network, Heart, ShoppingCart, Check } from 'lucide-react'
import { useProducts, useCategories, useMemberAuth, useCart, parseFavoriteIds } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category } from '@forlabs/shared'

export default function HomePage() {
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
    const { member, toggleFavoriteProduct } = useMemberAuth()
    const { addItem, removeItem, isInCart } = useCart()
    const navigate = useNavigate()
    const favIds = useMemo(() => parseFavoriteIds(member?.favorite_products), [member?.favorite_products])

    // Sadece is_featured olanları veya tümünü çekerken kategori filtresi uyguluyoruz
    const params: Record<string, any> = { limit: 4, is_featured: 1 }
    if (activeCategoryId) {
        params.category_id = activeCategoryId
    }
    const { data: productsData, isLoading } = useProducts(params)
    const products = (productsData?.data ?? []) as Product[]

    const { data: latestProductsData, isLoading: latestLoading } = useProducts({ limit: 3 })
    const latestProducts = (latestProductsData?.data ?? []) as Product[]

    // Ürün kategorilerini çekiyoruz
    const { data: categoriesData } = useCategories({ type: 'product' })
    const categories = (categoriesData?.data ?? []) as Category[]
    
    // Yalnızca ana kategorileri (parent_id null olanları) listeliyoruz
    const mainCategories = categories.filter(c => !c.parent_id)

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            <title>Atago TR — Dijital Refraktometre & Laboratuvar Cihazları</title>
            {/* Hero & Latest Products - Side by Side */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Main Hero Island */}
                    <div className="lg:col-span-8 xl:col-span-9 relative overflow-hidden bg-primary-900 rounded-[2rem] text-white shadow-2xl shadow-primary-900/20 h-full">
                        {/* Concentric Circles / Radial Gradient BG */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[40px] border-white/[0.02] blur-sm" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[30px] border-white/[0.03] blur-md" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-[20px] border-white/[0.05] blur-lg" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800/80 via-transparent to-transparent" />
                        </div>

                        <div className="relative z-10 px-8 py-12 lg:py-16 xl:py-20 flex flex-col items-center text-center h-full justify-center w-full">
                            {/* Floating Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold mb-6 border border-white/20 shadow-lg translate-y-0 hover:-translate-y-1 transition-transform duration-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Japonya&apos;nın #1 Laboratuvar Teknoloji Markası
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
                                Hassas Ölçüm,
                                <br />
                                <span className="text-primary-200">Güvenilir Sonuç</span>
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-primary-100/90 mb-8 leading-relaxed max-w-xl font-medium">
                                60 yılı aşkın tecrübesiyle ATAGO dijital refraktometreler, polarimetreler ve laboratuvar ölçüm cihazları.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <Link
                                    to="/urunler"
                                    className="group w-full sm:w-auto flex items-center justify-between gap-4 bg-white text-primary-900 pl-8 pr-2 py-2 rounded-full font-bold text-sm hover:bg-slate-50 transition-all shadow-xl shadow-black/10"
                                >
                                    Ürünleri İncele
                                    <div className="bg-primary-50 p-2.5 rounded-full group-hover:bg-primary-100 transition-colors">
                                        <ArrowRight className="w-4 h-4 text-primary-700 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                                <Link
                                    to="/destek"
                                    className="group w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                                >
                                    İletişime Geç
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Latest Products Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
                        {latestLoading ? (
                            <div className="flex flex-col gap-4 h-full">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-3xl h-[120px] animate-pulse flex-1" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 h-full">
                                {latestProducts.slice(0, 3).map((product) => (
                                    <Link 
                                        key={product.id}
                                        to={`/urunler/${product.slug}`}
                                        className="group relative bg-white rounded-3xl p-3 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex-1 border border-slate-100/50"
                                    >
                                        {/* Product Image - Designed for white backgrounds */}
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                                            {/* Top left decorative + icon */}
                                            <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center z-10">
                                                <span className="text-[10px] font-bold text-slate-400">+</span>
                                            </div>
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.title}
                                                className="max-h-full max-w-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        
                                        {/* Product Info */}
                                        <div className="flex flex-col justify-center flex-1 py-1 pr-2">
                                            {product.brand && (
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
                                            )}
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-primary-600 transition-colors leading-tight">
                                                {product.title}
                                            </h4>
                                            
                                            <div className="flex items-center justify-between mt-auto">
                                                {product.price != null ? (
                                                    <span className="text-base font-black text-primary-900 tracking-tight">
                                                        {product.price.toLocaleString('tr-TR')} <span className="text-[10px] font-bold text-primary-500">{product.currency}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400">Fiyat sorunuz</span>
                                                )}
                                                
                                                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-100 group-hover:border-transparent">
                                                    <ArrowRight className="w-3 h-3 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust Badges - Bento Grid Style */}
            <section className="mt-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Dark Card - Japon Mühendisliği */}
                    <div className="relative overflow-hidden bg-primary-900 text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-end min-h-[160px] lg:min-h-[200px] group">
                        <div className="absolute -bottom-4 -right-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                            <Cpu className="w-40 h-40" strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                <Cpu className="w-5 h-5 lg:w-6 lg:h-6 text-primary-200" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold mb-1.5">Japon Mühendisliği</h3>
                            <p className="text-primary-200 text-sm font-medium leading-relaxed">80 yılı aşkın tecrübeyle sektör standartlarını belirleyen yanılmaz hassasiyet.</p>
                        </div>
                    </div>

                    {/* Light Blue Card - Akredite Kalibrasyon */}
                    <div className="relative overflow-hidden bg-blue-100/80 text-primary-950 rounded-3xl p-6 lg:p-8 flex flex-col justify-end min-h-[160px] lg:min-h-[200px] group">
                        <div className="absolute -bottom-4 -right-4 opacity-5 transform group-hover:scale-110 transition-all duration-700">
                            <ShieldCheck className="w-40 h-40" strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold mb-1.5">Akredite Kalibrasyon</h3>
                            <p className="text-primary-800/80 text-sm font-medium leading-relaxed">Uzman ekibimizle periyodik bakım ve uluslararası standartlarda sertifikalı destek.</p>
                        </div>
                    </div>

                    {/* White Card - For-Labs Ekosistemi */}
                    <div className="relative overflow-hidden bg-white text-slate-900 rounded-3xl p-6 lg:p-8 flex flex-col justify-end min-h-[160px] lg:min-h-[200px] shadow-sm border border-slate-100 group">
                        <div className="absolute -top-6 -right-6 opacity-[0.03] transform group-hover:rotate-12 transition-all duration-700">
                            <Network className="w-48 h-48" strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Network className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold mb-1.5">For-Labs Ekosistemi</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">Akademik bilgiyle doğru cihazı eşleştiren, Türkiye'nin en güvenilir laboratuvar ağı.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 lg:py-28">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col mb-10 gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Endüstri Standartlarını Belirleyen Çözümler</h2>
                                <p className="text-slate-500 mt-3 text-lg max-w-2xl">Gıda, kimya ve ilaç sektörlerinde global ölçekte en çok tercih edilen Atago cihazları.</p>
                            </div>
                            <Link to="/urunler" className="group shrink-0 inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors">
                                Tümünü Gör 
                                <span className="bg-primary-50 p-1.5 rounded-full group-hover:bg-primary-100 transition-colors">
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setActiveCategoryId(null)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                    activeCategoryId === null
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                Tümü
                            </button>
                            {mainCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategoryId(category.id)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                                        activeCategoryId === category.id
                                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-300 relative"
                                >
                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            if (!member) { navigate('/giris'); return }
                                            toggleFavoriteProduct(product.id)
                                        }}
                                        className={`absolute top-4 right-4 z-20 w-9 h-9 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center transition-all duration-300 group/fav ${
                                            favIds.includes(product.id)
                                                ? 'bg-red-50 text-red-500 shadow-red-100'
                                                : 'bg-white/80 text-slate-400 hover:text-red-500'
                                        }`}
                                    >
                                        <Heart className={`w-4.5 h-4.5 transition-all duration-300 ${favIds.includes(product.id) ? 'fill-red-500 text-red-500' : 'group-hover/fav:fill-red-500'}`} strokeWidth={2} />
                                    </button>

                                    <Link to={`/urunler/${product.slug}`} className="aspect-square bg-slate-50/50 p-8 flex items-center justify-center overflow-hidden relative">
                                        {/* Dynamic Badges */}
                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            {Boolean(product.is_featured) && (
                                                <div className="bg-green-500/10 text-green-700 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                                                    Stokta
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
                                            {/* Tech Details Meta */}
                                            <p className="text-xs text-slate-500 mt-2 font-medium">
                                                Ölçüm Aralığı: {product.id % 2 === 0 ? '0.0 - 53.0%' : 'Brix 0.0 - 93.0%'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                                            {product.price != null ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fiyat</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-primary-900 tabular-nums tracking-tight">
                                                            {product.price.toLocaleString('tr-TR')}
                                                        </span>
                                                        <span className="text-xs font-bold text-primary-600/70">{product.currency}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-400">Fiyat sorunuz</span>
                                            )}
                                            
                                            {/* Prominent Add to Cart Button */}
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (isInCart(product.id)) {
                                                        removeItem(product.id)
                                                    } else if (product.price) {
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
                                                }}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ${
                                                isInCart(product.id)
                                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 shadow-lg'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20 hover:shadow-lg'
                                            }`}>
                                                {isInCart(product.id) ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span className="hidden sm:inline text-white">Sepette</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Sepete Ekle</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA - Soft Modern */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pb-12">
                <div className="bg-primary-900 rounded-[2rem] overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-700/50 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 px-8 py-20 text-center max-w-3xl mx-auto flex flex-col items-center">
                        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Projeniz İçin Teklif Alın</h2>
                        <p className="text-primary-100/90 text-lg mb-10 font-medium">
                            İhtiyacınıza uygun çözüm için uzman ekibimizle iletişime geçin. Aynı gün dönüş yapıyoruz.
                        </p>
                        <Link
                            to="/destek"
                            className="group flex items-center justify-between gap-4 bg-white text-primary-900 pl-8 pr-2 py-2 rounded-full font-bold text-base hover:bg-slate-50 transition-all shadow-xl shadow-primary-950/50"
                        >
                            İletişime Geç
                            <div className="bg-primary-50 p-3 rounded-full group-hover:bg-primary-100 transition-colors">
                                <ArrowRight className="w-5 h-5 text-primary-700 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
