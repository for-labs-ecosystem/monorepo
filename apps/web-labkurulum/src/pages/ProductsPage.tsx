import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories } from '@forlabs/core'
import { Search, Grid3X3, List, ArrowRight } from 'lucide-react'
import { getImageUrl, stripHtml } from '@/lib/utils'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface Product {
    id: number
    slug: string
    title: string
    short_description: string | null
    image_url: string | null
    brand: string | null
    model: string | null
    price: number | null
    currency: string | null
    sku: string | null
}

interface Category {
    id: number
    name: string
    slug: string
    type: string | null
}

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const searchQ = searchParams.get('q') || ''
    const categoryId = searchParams.get('category') || ''

    const { data: productsRes, isLoading } = useQuery({
        queryKey: ['products', SITE_ID, searchQ, categoryId],
        queryFn: () => getProducts({ q: searchQ || undefined, category_id: categoryId || undefined }),
        staleTime: 2 * 60 * 1000,
    })

    const { data: categoriesRes } = useQuery({
        queryKey: ['categories', SITE_ID, 'product'],
        queryFn: () => getCategories({ type: 'product' }),
        staleTime: 5 * 60 * 1000,
    })

    const products = (productsRes?.data ?? []) as Product[]
    const categories = (categoriesRes?.data ?? []) as Category[]

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const q = (fd.get('q') as string).trim()
        const params = new URLSearchParams(searchParams)
        if (q) params.set('q', q); else params.delete('q')
        setSearchParams(params)
    }

    function handleCategoryFilter(catId: string) {
        const params = new URLSearchParams(searchParams)
        if (catId) params.set('category', catId); else params.delete('category')
        setSearchParams(params)
    }

    return (
        <>
            <title>Ekipman Kataloğu — Lab Kurulum</title>
            <meta name="description" content="Laboratuvar ekipmanları, analitik cihazlar ve sarf malzemeleri kataloğu." />

            {/* Page header */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">// Ekipman</span>
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">Ekipman Kataloğu</h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl">
                        Proje ihtiyaçlarınıza uygun laboratuvar cihazlarını keşfedin. Toplu tedarik ve kurulum teklifi alabilirsiniz.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="q"
                            defaultValue={searchQ}
                            placeholder="Ürün veya model ara..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                        />
                    </form>

                    <div className="flex items-center gap-3">
                        {/* Category filter */}
                        <select
                            value={categoryId}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            className="text-sm border border-slate-200 rounded-sm px-3 py-2.5 bg-white focus:outline-none focus:border-brand-400"
                        >
                            <option value="">Tüm Kategoriler</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                            ))}
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden">
                            <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && products.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-slate-400">Ürün bulunamadı.</p>
                        <p className="text-xs text-slate-300 mt-1">Farklı arama kriterleri deneyin.</p>
                    </div>
                )}

                {/* Grid view */}
                {!isLoading && products.length > 0 && view === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/urunler/${product.slug}`}
                                className="group border border-slate-200 rounded-md bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                            >
                                <div className="aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                                    <img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.title}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-4 border-t border-slate-100">
                                    {product.brand && (
                                        <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1">{product.brand}</p>
                                    )}
                                    <h3 className="text-sm font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                        {product.title}
                                    </h3>
                                    {product.sku && (
                                        <p className="text-[10px] font-mono text-slate-400 mt-1">SKU: {product.sku}</p>
                                    )}
                                    <div className="mt-3 flex items-center justify-between">
                                        {product.price != null ? (
                                            <span className="text-sm font-bold text-brand-700 font-mono">
                                                {product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-accent-600">Teklif İste</span>
                                        )}
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* List view */}
                {!isLoading && products.length > 0 && view === 'list' && (
                    <div className="space-y-3">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/urunler/${product.slug}`}
                                className="group flex items-center gap-5 border border-slate-200 rounded-md bg-white p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-sm overflow-hidden flex items-center justify-center shrink-0 p-2">
                                    <img src={getImageUrl(product.image_url)} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {product.brand && (
                                        <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">{product.brand}</p>
                                    )}
                                    <h3 className="text-sm font-bold text-brand-900 group-hover:text-brand-600 transition-colors truncate">{product.title}</h3>
                                    {product.short_description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{stripHtml(product.short_description)}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    {product.price != null ? (
                                        <span className="text-sm font-bold text-brand-700 font-mono">{product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}</span>
                                    ) : (
                                        <span className="text-xs font-medium text-accent-600">Teklif İste</span>
                                    )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
