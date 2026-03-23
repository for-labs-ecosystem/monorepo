import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArticles } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'
import { ArrowRight, BookOpen, ChevronRight, Clock3, Search, Sparkles, Tag, X } from 'lucide-react'

function parseTags(tags: string | null): string[] {
    if (!tags) return []
    try {
        const parsed = JSON.parse(tags)
        if (Array.isArray(parsed)) {
            return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        }
    } catch {
        return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    }
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
}

function estimateReadTime(content: string | null): number {
    if (!content) return 2
    const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    return Math.max(2, Math.ceil(words / 220))
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ''
    try {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return ''
    }
}

function getArticleTimestamp(article: Article): number {
    const primaryDate = article.published_at || article.created_at
    const timestamp = primaryDate ? new Date(primaryDate).getTime() : 0
    return Number.isNaN(timestamp) ? 0 : timestamp
}

function ArticleCard({ article }: { article: Article }) {
    const tags = parseTags(article.tags)

    return (
        <Link
            to={`/bilgi-bankasi/${article.slug}`}
            className="group grid grid-cols-1 items-start gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-12px_rgba(0,82,204,0.18)] md:grid-cols-[280px_1fr] md:p-6"
        >
            <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 aspect-[16/10]">
                {article.cover_image_url ? (
                    <img
                        src={getImageUrl(article.cover_image_url)}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                        <BookOpen className="h-10 w-10" strokeWidth={1.5} />
                    </div>
                )}
                {article.is_featured && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-primary-600/25">
                        <Sparkles className="h-3 w-3" />
                        Öne Çıkan
                    </div>
                )}
            </div>

            <div className="flex min-h-full flex-col">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-primary-700">
                        <Clock3 className="h-3 w-3" />
                        {estimateReadTime(article.content)} dk okuma
                    </span>
                    <span className="h-3.5 w-px bg-slate-200" />
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                </div>

                <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-primary-700">
                    {article.title}
                </h2>

                {article.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                        {article.excerpt}
                    </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                    {tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"
                        >
                            <Tag className="h-3 w-3" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Bilgi Bankası</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">Detaylı içeriği inceleyin</p>
                    </div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default function KnowledgeBankPage() {
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState('')
    const { data, isLoading, isError, refetch } = useArticles()

    useEffect(() => {
        document.title = 'Bilgi Bankası | Atago TR'
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
            meta.setAttribute('content', 'Atago TR bilgi bankasında yayınlanan makaleler, uygulama notları ve uzman içeriklerini keşfedin.')
        }
    }, [])

    const articles = useMemo(
        () =>
            [...((data?.data ?? []) as Article[])].sort(
                (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a)
            ),
        [data]
    )

    const featuredArticles = useMemo(
        () => articles.filter((article) => Boolean(article.is_featured)).slice(0, 3),
        [articles]
    )

    const availableTags = useMemo(() => {
        const tagMap = new Map<string, number>()
        articles.forEach((article) => {
            parseTags(article.tags).forEach((tag) => {
                tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1)
            })
        })
        return [...tagMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([tag]) => tag)
    }, [articles])

    const filteredArticles = useMemo(() => {
        let result = articles
        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter((article) =>
                [article.title, article.excerpt, article.tags, article.keywords, article.author]
                    .filter(Boolean)
                    .some((value) => value?.toLowerCase().includes(q))
            )
        }
        if (activeTag) {
            result = result.filter((article) => parseTags(article.tags).some((tag) => tag.toLowerCase() === activeTag.toLowerCase()))
        }
        return result
    }, [activeTag, articles, search])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-56 rounded-[2rem] bg-slate-200" />
                        <div className="h-14 rounded-2xl bg-slate-200" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="h-72 rounded-[2rem] bg-slate-200" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <BookOpen className="h-7 w-7 text-slate-300" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Bilgi Bankası yüklenemedi</h1>
                    <p className="mt-2 text-sm text-slate-500">CMS tarafındaki makalelere şu anda erişilemiyor.</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-5 inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] bg-primary-900 text-white shadow-2xl shadow-primary-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.2),transparent_35%)]" />
                    <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-primary-100/70">
                            <Link to="/" className="transition-colors hover:text-white">Anasayfa</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-white">Bilgi Bankası</span>
                        </div>
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                            <div className="max-w-3xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary-100 backdrop-blur-md">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Uzman İçgörüleri
                                </span>
                                <h1 className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    <span
                                        className="relative inline-flex items-start pr-5"
                                        style={{ lineHeight: 0.9 }}
                                    >
                                        <span
                                            className="font-black text-[0.9em] leading-none tracking-[-0.065em] text-white"
                                            style={{ fontFamily: 'Arial Black, Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}
                                        >
                                            ATAGO
                                        </span>
                                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white text-[8px] font-black leading-none text-slate-900 shadow-[0_8px_18px_rgba(255,255,255,0.08)]">
                                            TR
                                        </span>
                                    </span>
                                    <span>Bilgi Bankası</span>
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-100/85 sm:text-base">
                                    Ölçüm doğruluğunu destekleyen pratik bilgiler, uygulama önerileri ve uzman içerikleri tek yerde keşfedin.
                                </p>
                            </div>

                            <div className="relative hidden h-[220px] lg:block">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative h-[200px] w-[360px]">
                                        {/* Arkaplan halkaları ve blurları - Daha ayrık */}
                                        <div className="absolute left-0 top-10 h-32 w-32 rounded-full border border-white/12 bg-white/6 blur-3xl animate-pulse" />
                                        <div className="absolute right-0 top-0 h-24 w-24 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-2xl animate-pulse" />

                                        {/* Sol odak halkası - Daha ufak ve daha sola yaslı */}
                                        <div className="absolute -left-6 top-10 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/6 backdrop-blur-sm transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.02]">
                                            <div className="absolute h-24 w-24 rounded-full border border-cyan-300/30 animate-[spin_18s_linear_infinite]" />
                                            <div className="absolute h-16 w-16 rounded-full border border-emerald-300/35 animate-[spin_14s_linear_infinite_reverse]" />
                                            <div className="absolute h-10 w-10 rounded-full bg-white/10 shadow-[0_0_40px_rgba(125,211,252,0.18)] animate-pulse" />
                                            <div className="relative h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(255,255,255,0.5)] animate-ping" />
                                        </div>

                                        {/* Üst bilgi kartı - Daha ufak, daha sağda ve üstte */}
                                        <div className="absolute right-2 top-0 w-52 rounded-[1.5rem] border border-white/12 bg-white/9 p-3.5 shadow-xl shadow-slate-950/15 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:bg-white/12">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200/90">Öne Çıkan İçgörü</p>
                                                    <p className="mt-1 text-xs font-bold leading-snug text-white">Doğru Ölçüm,<br />Hızlı Yorum</p>
                                                </div>
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12 text-cyan-100 transition-transform duration-300 group-hover:scale-105">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                            <div className="mt-3.5 space-y-1.5">
                                                <div className="h-1.5 rounded-full bg-white/10">
                                                    <div className="h-1.5 w-[74%] rounded-full bg-linear-to-r from-cyan-300 to-blue-200 transition-all duration-700 group-hover:w-[82%]" />
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/10">
                                                    <div className="h-1.5 w-[52%] rounded-full bg-linear-to-r from-emerald-300 to-cyan-200 transition-all duration-700 group-hover:w-[62%]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Alt uygulama kartı - Daha ufak, daha solda ve altta */}
                                        <div className="absolute bottom-2 left-16 z-10 w-48 rounded-[1.25rem] border border-white/10 bg-white/8 px-3.5 py-2.5 backdrop-blur-md shadow-lg shadow-slate-950/10 transition-all duration-500 group-hover:translate-y-0.5 group-hover:bg-white/12">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-emerald-300/15 text-emerald-200 transition-transform duration-300 group-hover:scale-105">
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                                        <path d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.26 9.26 0 0 0 12 2.75Zm4.46 7.48-5.02 5.02a.75.75 0 0 1-1.06 0l-2.84-2.84a.75.75 0 1 1 1.06-1.06l2.31 2.31 4.49-4.49a.75.75 0 0 1 1.06 1.06Z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200/90 truncate">Uygulama Rehberi</p>
                                                    <p className="mt-0.5 text-xs font-semibold text-white truncate">Pratik bilgi, net sonuç</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {featuredArticles.length > 0 && (
                <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
                    <div className="grid gap-5 lg:grid-cols-3">
                        {featuredArticles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/bilgi-bankasi/${article.slug}`}
                                className="group rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex gap-4">
                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-300">
                                                <BookOpen className="h-7 w-7" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">
                                                <Sparkles className="h-3 w-3" />
                                                Editör Seçimi
                                            </span>
                                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600" />
                                        </div>
                                        <h2 className="line-clamp-2 text-lg font-black leading-snug text-slate-900 transition-colors group-hover:text-primary-700">
                                            {article.title}
                                        </h2>
                                        {article.excerpt && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{article.excerpt}</p>
                                        )}
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                            <span>{formatDate(article.published_at || article.created_at)}</span>
                                            <span className="h-3.5 w-px bg-slate-200" />
                                            <span>{estimateReadTime(article.content)} dk</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Tüm Makaleler</h2>
                            <p className="mt-1 text-sm text-slate-500">{filteredArticles.length} içerik listeleniyor</p>
                        </div>
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Makale, etiket veya yazar ara..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/15"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {availableTags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTag('')}
                                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                                    activeTag === ''
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Tümü
                            </button>
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag((current) => current === tag ? '' : tag)}
                                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                                        activeTag === tag
                                            ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
                {filteredArticles.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Sonuç bulunamadı</h3>
                        <p className="mt-2 text-sm text-slate-500">Aramanızı veya aktif etiketi değiştirerek farklı içeriklere göz atın.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredArticles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
