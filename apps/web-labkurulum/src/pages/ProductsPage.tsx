import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getCategories } from '@forlabs/core'
import { Search, Grid3X3, List, ArrowRight, ChevronDown, SlidersHorizontal, Check } from 'lucide-react'
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
    created_at: string
}

interface Category {
    id: number
    name: string
    slug: string
    type: string | null
    parent_id: number | null
}

// Click outside hook for custom dropdowns
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return
            }
            handler(event)
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
    const [view, setView] = useState<'grid' | 'list'>('grid')
    
    // Sort and Category Dropdown state
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
    
    // Apply client-side sorting
    if (sortParam === 'price-asc') {
        products = [...products].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortParam === 'price-desc') {
        products = [...products].sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortParam === 'newest') {
        products = [...products].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    }

    const parentCategories = categories.filter(c => !c.parent_id)
    const getSubCategories = (parentId: number) => categories.filter(c => c.parent_id === parentId)

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const q = (fd.get('q') as string).trim()
        const params = new URLSearchParams(searchParams)
        if (q) params.set('q', q); else params.delete('q')
        setSearchParams(params)
    }

    function toggleCategory(catId: string) {
        const params = new URLSearchParams(searchParams)
        let currentIds = [...categoryIds]
        if (currentIds.includes(catId)) {
            currentIds = currentIds.filter(id => id !== catId)
        } else {
            currentIds.push(catId)
        }
        
        if (currentIds.length > 0) {
            params.set('category', currentIds.join(','))
        } else {
            params.delete('category')
        }
        setSearchParams(params)
    }
    
    function setSort(val: string) {
        const params = new URLSearchParams(searchParams)
        if (val && val !== 'default') {
            params.set('sort', val)
        } else {
            params.delete('sort')
        }
        setSearchParams(params)
    }
    
    function clearFilters() {
        const params = new URLSearchParams()
        if (searchQ) params.set('q', searchQ) // preserve search
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
                {/* ADVANCED TOOLBAR */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative w-full lg:w-96 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="q"
                                defaultValue={searchQ}
                                placeholder="Ürün, marka veya model ara..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 transition-colors"
                            />
                        </form>

                        {/* Filters & Actions */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            
                            {/* Categories Dropdown */}
                            <div className="relative" ref={categoryRef}>
                                <button 
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-md transition-all ${isCategoryOpen || categoryIds.length > 0 ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span className="font-medium">Kategoriler</span>
                                    {categoryIds.length > 0 && (
                                        <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                            {categoryIds.length}
                                        </span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isCategoryOpen && (
                                    <div className="absolute top-full mt-2 left-0 w-[300px] sm:w-[400px] bg-white border border-slate-200 shadow-xl rounded-lg z-50 overflow-hidden flex flex-col max-h-[70vh]">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">Filtrele</span>
                                            {categoryIds.length > 0 && (
                                                <button onClick={clearFilters} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                                                    Temizle
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-4 overflow-y-auto">
                                            <div className="space-y-6">
                                                {parentCategories.map(parent => (
                                                    <div key={parent.id}>
                                                        <label className="flex items-start gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center mt-0.5">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={categoryIds.includes(String(parent.id))} 
                                                                    onChange={() => toggleCategory(String(parent.id))} 
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-4 h-4 rounded-[4px] border border-slate-300 bg-white peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-colors" />
                                                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                                                                {parent.name}
                                                            </span>
                                                        </label>
                                                        
                                                        {/* Sub-categories */}
                                                        <div className="ml-7 mt-3 grid grid-cols-1 gap-2.5">
                                                            {getSubCategories(parent.id).map(child => (
                                                                <label key={child.id} className="flex items-start gap-3 cursor-pointer group">
                                                                    <div className="relative flex items-center mt-0.5">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={categoryIds.includes(String(child.id))} 
                                                                            onChange={() => toggleCategory(String(child.id))} 
                                                                            className="peer sr-only"
                                                                        />
                                                                        <div className="w-4 h-4 rounded-[4px] border border-slate-300 bg-white peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-colors" />
                                                                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                                    </div>
                                                                    <span className="text-sm text-slate-600 group-hover:text-brand-600 transition-colors">
                                                                        {child.name}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {categories.length === 0 && (
                                                    <p className="text-sm text-slate-400 text-center py-4">Kategori bulunamadı.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="relative shrink-0">
                                <select
                                    value={sortParam}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm font-medium border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 cursor-pointer"
                                >
                                    <option value="default">Sıralama: Önerilen</option>
                                    <option value="newest">En Yeniler</option>
                                    <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                                    <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />

                            {/* View toggles */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-md shrink-0">
                                <button 
                                    onClick={() => setView('grid')} 
                                    className={`p-1.5 rounded-[4px] transition-all ${view === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Izgara Görünümü"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setView('list')} 
                                    className={`p-1.5 rounded-[4px] transition-all ${view === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Liste Görünümü"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            
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
                    <div className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-lg">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-base font-bold text-slate-700">Eşleşen ürün bulunamadı.</p>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                            Arama kriterlerinizi değiştirerek veya farklı kategoriler seçerek tekrar deneyebilirsiniz.
                        </p>
                        {(searchQ || categoryIds.length > 0) && (
                            <button onClick={clearFilters} className="mt-6 px-4 py-2 bg-brand-50 text-brand-600 font-bold text-sm rounded-md hover:bg-brand-100 transition-colors">
                                Filtreleri Temizle
                            </button>
                        )}
                    </div>
                )}

                {/* Grid view */}
                {!isLoading && products.length > 0 && view === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/urunler/${product.slug}`}
                                className="group border border-slate-200 rounded-lg bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-md"
                            >
                                <div className="aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-6 relative">
                                    <img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.title}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-brand-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 border-t border-slate-100">
                                    {product.brand && (
                                        <p className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-wider mb-2">{product.brand}</p>
                                    )}
                                    <h3 className="text-sm font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                        {product.title}
                                    </h3>
                                    {product.sku && (
                                        <p className="text-[11px] font-mono font-medium text-slate-400 mt-2">SKU: {product.sku}</p>
                                    )}
                                    <div className="mt-4 flex items-center justify-between">
                                        {product.price != null ? (
                                            <span className="text-sm font-black text-slate-800 font-mono tracking-tight">
                                                {product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-accent-600 tracking-wide uppercase">Teklif İste</span>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* List view */}
                {!isLoading && products.length > 0 && view === 'list' && (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/urunler/${product.slug}`}
                                className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-6 border border-slate-200 rounded-lg bg-white p-5 transition-all duration-300 hover:border-brand-300 hover:shadow-md"
                            >
                                <div className="w-full sm:w-28 h-28 bg-slate-50 rounded-md overflow-hidden flex items-center justify-center shrink-0 p-3">
                                    <img src={getImageUrl(product.image_url)} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {product.brand && (
                                        <p className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-wider mb-1">{product.brand}</p>
                                    )}
                                    <h3 className="text-base font-bold text-brand-900 group-hover:text-brand-600 transition-colors">{product.title}</h3>
                                    {product.short_description && (
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{stripHtml(product.short_description)}</p>
                                    )}
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 sm:pl-6 sm:border-l border-slate-100">
                                    {product.price != null ? (
                                        <div className="text-right">
                                            <span className="text-lg font-black text-slate-800 font-mono tracking-tight block">{product.price.toLocaleString('tr-TR')} {product.currency || 'TRY'}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">KDV Dahil</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-accent-600 tracking-wide uppercase px-3 py-1 bg-accent-50 rounded-full">Teklif İste</span>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                                        Detayları İncele <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
