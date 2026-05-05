import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, FlaskConical, ArrowRight, Filter, Sparkles } from 'lucide-react'
import { useProducts, useCategories } from '@forlabs/core'
import type { Product, Category } from '@forlabs/shared'
import { getImageUrl, formatPrice } from '@/lib/utils'

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState<number | null>(null)

    const { data: productsRes, isLoading } = useProducts()
    const { data: categoriesRes } = useCategories()

    const products = (productsRes?.data ?? []) as Product[]
    const categories = (categoriesRes?.data ?? []) as Category[]

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return products.filter((p) => {
            if (categoryId !== null && p.category_id !== categoryId) return false
            if (!q) return true
            return (
                p.title.toLowerCase().includes(q) ||
                (p.brand?.toLowerCase().includes(q) ?? false) ||
                (p.description?.toLowerCase().includes(q) ?? false)
            )
        })
    }, [products, search, categoryId])

    return (
        <>
            <title>Ürünler | HijyenKontrol</title>
            <meta name="description" content="ATP luminometreler, yüzey swab kitleri ve hızlı patojen test çözümlerinin tam katalog görünümü." />

            {/* Header */}
            <section className="relative overflow-hidden">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 pb-10 lg:pt-20 lg:pb-12">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-uv-700 tracking-wide mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-uv-500" />
                        ÜRÜN KATALOĞU
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">Hijyen Test Çözümleri</h1>
                    <p className="text-slate-500 max-w-2xl leading-relaxed">
                        Saniyeler içinde sonuç veren ATP luminometrelerden steril swab kitlerine, klinik standartta hijyen denetimi için tasarlanmış araçlar.
                    </p>
                </div>
            </section>

            {/* Body */}
            <section className="relative pb-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid lg:grid-cols-[280px_1fr] gap-10">
                        {/* Filter Sidebar */}
                        <aside className="lg:sticky lg:top-24 self-start space-y-5">
                            {/* Search */}
                            <div className="glass-card-tight p-4">
                                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-2.5">Ara</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Ürün, marka, açıklama..."
                                        className="input-soft !pl-10"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="glass-card-tight p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter className="w-3.5 h-3.5 text-uv-500" />
                                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-[0.18em]">Kategoriler</span>
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setCategoryId(null)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                            categoryId === null
                                                ? 'bg-uv-50 text-uv-700'
                                                : 'text-slate-500 hover:bg-uv-50/50 hover:text-uv-600'
                                        }`}
                                    >
                                        Tüm Ürünler
                                        <span className="float-right text-[11px] text-slate-400">{products.length}</span>
                                    </button>
                                    {categories.map((c) => {
                                        const count = products.filter((p) => p.category_id === c.id).length
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => setCategoryId(c.id)}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                                                    categoryId === c.id
                                                        ? 'bg-uv-50 text-uv-700'
                                                        : 'text-slate-500 hover:bg-uv-50/50 hover:text-uv-600'
                                                }`}
                                            >
                                                {c.name}
                                                <span className="float-right text-[11px] text-slate-400">{count}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[13px] text-slate-500">
                                    <span className="font-bold text-slate-700">{filtered.length}</span> ürün listeleniyor
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="glass-card-tight aspect-[4/5] animate-pulse" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="glass-card p-16 text-center">
                                    <FlaskConical className="w-12 h-12 text-uv-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Ürün bulunamadı</h3>
                                    <p className="text-sm text-slate-500">Arama veya kategori filtresini değiştirmeyi deneyin.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {filtered.map((p) => (
                                        <Link key={p.id} to={`/urunler/${p.slug}`} className="glass-card p-5 group flex flex-col">
                                            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-uv-50/70 via-white to-clean-50/40 flex items-center justify-center overflow-hidden mb-4">
                                                {p.image_url ? (
                                                    <img
                                                        src={getImageUrl(p.image_url) || ''}
                                                        alt={p.title}
                                                        className="max-h-[80%] max-w-[80%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <FlaskConical className="w-12 h-12 text-uv-200" />
                                                )}
                                            </div>
                                            {p.brand && (
                                                <span className="text-[10px] font-bold text-uv-600 uppercase tracking-[0.18em] mb-1.5">{p.brand}</span>
                                            )}
                                            <h3 className="text-[14.5px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-uv-700 transition-colors line-clamp-2">{p.title}</h3>
                                            {p.description && (
                                                <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                                            )}
                                            <div className="mt-auto pt-3 border-t border-uv-100/50 flex items-center justify-between">
                                                {p.price ? (
                                                    <span className="text-[13.5px] font-bold text-uv-600">{formatPrice(p.price, p.currency)}</span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 font-medium">Teklif İste</span>
                                                )}
                                                <ArrowRight className="w-4 h-4 text-uv-400 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
