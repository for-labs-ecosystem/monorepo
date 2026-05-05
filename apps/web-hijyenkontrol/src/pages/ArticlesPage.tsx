import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { useArticles } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

export default function ArticlesPage() {
    const [search, setSearch] = useState('')
    const { data, isLoading } = useArticles()

    const articles = (data?.data ?? []) as Article[]

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return articles
        return articles.filter((a) =>
            a.title.toLowerCase().includes(q) ||
            (a.excerpt?.toLowerCase().includes(q) ?? false) ||
            (a.tags?.toLowerCase().includes(q) ?? false)
        )
    }, [articles, search])

    return (
        <>
            <title>Bilgi Bankası | HijyenKontrol</title>
            <meta name="description" content="Hijyen denetimi, sanitasyon ve gıda güvenliği konularında derinlemesine araştırma makaleleri." />

            <section className="relative">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 pb-10 lg:pt-20 lg:pb-12">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-clean-700 tracking-wide mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-clean-500" />
                        BİLGİ BANKASI
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4">Hijyen Araştırmaları</h1>
                    <p className="text-slate-500 max-w-2xl leading-relaxed mb-8">
                        Sanitasyon, gıda güvenliği, ATP testlerinde doğruluk ve sektörel uygulama notları. Klinik standartta hijyen denetimi için referans kaynak.
                    </p>

                    <div className="max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Makale ara..."
                            className="input-soft !pl-11"
                        />
                    </div>
                </div>
            </section>

            <section className="relative pb-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="glass-card-tight aspect-[4/5] animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <BookOpen className="w-12 h-12 text-clean-200 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Makale bulunamadı</h3>
                            <p className="text-sm text-slate-500">Aramanızı değiştirip tekrar deneyin.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((a) => (
                                <Link key={a.id} to={`/bilgi-bankasi/${a.slug}`} className="glass-card overflow-hidden group flex flex-col">
                                    <div className="aspect-[16/10] bg-gradient-to-br from-uv-50/60 to-clean-50/40 overflow-hidden">
                                        {a.cover_image_url ? (
                                            <img
                                                src={getImageUrl(a.cover_image_url) || ''}
                                                alt={a.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-uv-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        {a.author && (
                                            <span className="text-[10.5px] font-semibold text-clean-600 uppercase tracking-[0.18em] mb-2">{a.author}</span>
                                        )}
                                        <h3 className="text-[15.5px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-clean-700 transition-colors">{a.title}</h3>
                                        {a.excerpt && (
                                            <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-3 mb-4">{a.excerpt}</p>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-clean-600 mt-auto">
                                            Devamını oku <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
