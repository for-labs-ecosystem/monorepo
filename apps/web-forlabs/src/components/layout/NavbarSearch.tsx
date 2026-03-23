import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Package, ArrowRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useLanguage, localizedField } from '@/lib/i18n'
import { getImageUrl } from '@/lib/utils'
import type { Product } from '@forlabs/shared'

export function NavbarSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const { lang } = useLanguage()
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const { data: allProductsData } = useProducts()
    const products = allProductsData?.data || []

    // close on clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        if (isOpen) window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const handleOpen = () => {
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const trQuery = query.toLowerCase().trim()
    const filteredProducts = query.trim() ? products.filter((p: Product) => {
        const title = localizedField(p, 'title', lang)?.toLowerCase() || ''
        const brand = p.brand?.toLowerCase() || ''
        const model = p.model_number?.toLowerCase() || ''
        const desc = localizedField(p, 'description', lang)?.toLowerCase() || ''
        return title.includes(trQuery) || brand.includes(trQuery) || model.includes(trQuery) || desc.includes(trQuery)
    }).slice(0, 6) : []

    const formatPrice = (price: number, currency: string) =>
        new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: currency || 'TRY' }).format(price)

    return (
        <div ref={containerRef} className="relative flex items-center">
            {/* The expanding input container */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center bg-slate-100 rounded-full ${isOpen ? 'w-[200px] sm:w-[280px] lg:w-[320px] opacity-100 px-3 py-1.5' : 'w-0 opacity-0 px-0 py-1.5'
                    }`}
            >
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === 'tr' ? 'Ürün ara...' : 'Search products...'}
                    className="w-full border-none bg-transparent px-3 text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.trim()) {
                            navigate(`/urunler?search=${encodeURIComponent(query)}`)
                            setIsOpen(false)
                        }
                    }}
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* The trigger button (only visible when closed, but we can also hide it with width to avoid layout jumps) */}
            <button
                onClick={() => {
                    if (isOpen) {
                        setIsOpen(false)
                        setQuery('')
                    } else {
                        handleOpen()
                    }
                }}
                className={`flex items-center justify-center rounded-full p-2.5 transition-all
                    ${isOpen ? 'ml-1 bg-slate-100 text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
            >
                {isOpen ? <X className="h-[17px] w-[17px]" strokeWidth={1.75} /> : <Search className="h-[17px] w-[17px]" strokeWidth={1.75} />}
            </button>


            {/* The dropdown */}
            {isOpen && query.trim() && (
                <div className="absolute top-full right-0 lg:right-auto lg:left-0 mt-3 w-[min(100vw-48px,350px)] sm:w-[400px] lg:w-[480px] rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 z-50">
                    {filteredProducts.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-2">
                                {lang === 'tr' ? 'Sonuçlar' : 'Results'} ({filteredProducts.length})
                            </h3>
                            {filteredProducts.map((p: Product) => {
                                const title = localizedField(p, 'title', lang)
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            navigate(`/urunler/${p.slug}`)
                                            setIsOpen(false)
                                            setQuery('')
                                        }}
                                        className="group flex items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-slate-50"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm overflow-hidden p-1.5">
                                            {p.image_url ? (
                                                <img src={getImageUrl(p.image_url)} alt={title} className="h-full w-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <Package className="h-5 w-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col min-w-0">
                                            <span className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-brand-700">
                                                {title}
                                            </span>
                                            {p.price ? (
                                                <span className="mt-0.5 text-xs font-bold text-slate-900">
                                                    {formatPrice(p.price, p.currency)}
                                                </span>
                                            ) : (
                                                <span className="mt-0.5 text-[10px] uppercase font-bold text-brand-600">
                                                    {lang === 'tr' ? 'Fiyat Sorunuz' : 'Contact for Price'}
                                                </span>
                                            )}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                                    </button>
                                )
                            })}

                            <div className="mt-2 flex justify-center border-t border-slate-100 pt-3">
                                <button
                                    onClick={() => {
                                        navigate(`/urunler?search=${encodeURIComponent(query)}`)
                                        setIsOpen(false)
                                        setQuery('')
                                    }}
                                    className="rounded-xl w-full bg-slate-50 px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                >
                                    {lang === 'tr' ? 'Tüm sonuçları gör' : 'View all results'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Search className="mb-3 h-8 w-8 text-slate-200" />
                            <p className="text-sm font-medium text-slate-800">
                                {lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-[250px] mx-auto">
                                {lang === 'tr' ? 'Aramanızla eşleşen ürün bulamadık. Lütfen farklı veya daha kısa bir kelimeyle tekrar deneyin.' : 'We couldn\'t find any products matching your search. Please try again with a different or shorter keyword.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
