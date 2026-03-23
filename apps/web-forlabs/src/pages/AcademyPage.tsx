import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Loader2, AlertCircle, BookOpen, Clock, Calendar } from 'lucide-react'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useArticles } from '@/hooks/useArticles'
import type { Article } from '@forlabs/shared'

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

/** Estimate reading time from content length */
function estimateReadTime(content: string | null): number {
    if (!content) return 3
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(2, Math.ceil(words / 200))
}

/** Format date to "DD MMM YYYY" style */
function formatDate(dateStr: string | null, lang: string): string {
    if (!dateStr) return ''
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return ''
    }
}

/** Parse tags from JSON string or comma-separated */
function parseTags(tags: string | null): string[] {
    if (!tags) return []
    try {
        const parsed = JSON.parse(tags)
        if (Array.isArray(parsed)) return parsed
    } catch {
        // not JSON, try comma-separated
    }
    return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

const API_BASE = import.meta.env.VITE_API_URL as string

function resolveMediaUrl(url: string | null): string {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
}

/* Category pill definitions */
const CATEGORY_PILLS = [
    { key: 'all', labelKey: 'academy.allCategories' as const },
    { key: 'gida', labelKey: 'academy.catFood' as const },
    { key: 'kimya', labelKey: 'academy.catChemistry' as const },
    { key: 'akreditasyon', labelKey: 'academy.catAccreditation' as const },
    { key: 'cevre', labelKey: 'academy.catEnvironment' as const },
    { key: 'ilac', labelKey: 'academy.catPharma' as const },
    { key: 'mikrobiyoloji', labelKey: 'academy.catMicrobiology' as const },
]

/** Fallback dummy images for bento cards when no cover_image_url */
const BENTO_FALLBACK_IMAGES = [
    '/images/academy-bento-1.png',
    '/images/academy-bento-2.png',
    '/images/academy-bento-3.png',
]

/* ─────────────────────────────────────────────────────────────
   BENTO HERO — Asymmetric grid with featured + 2 editorial cards
   ───────────────────────────────────────────────────────────── */
function BentoHero({ articles }: { articles: Article[] }) {
    const { lang } = useLanguage()

    // Featured = first is_featured article or first article
    const featured = articles.find((a) => a.is_featured) || articles[0]
    const secondary = articles.filter((a) => a.id !== featured?.id).slice(0, 2)

    if (!featured) return null

    const featuredTitle = localizedField(featured, 'title', lang)
    const featuredExcerpt = localizedField(featured, 'excerpt', lang)
    const featuredContent = localizedField(featured, 'content', lang)

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-6 pt-10 pb-6 lg:px-8 lg:pt-16 lg:pb-10">
                {/* Badge */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 px-4 py-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {t('academy.badge', lang)}
                        </span>
                    </div>
                </div>

                {/* Title — "Akademi" + for-labs. logo */}
                <h1 className="mb-4 flex flex-wrap items-baseline gap-3 font-serif text-5xl font-medium leading-[1.08] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                    <span>{t('academy.heroTitle', lang)}</span>
                    <img
                        src="/forlabs-logo-blue.svg"
                        alt="for-labs."
                        className="inline-block h-[0.55em] w-auto translate-y-[-0.05em]"
                    />
                </h1>
                <p className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-slate-500 lg:mb-16 lg:text-xl">
                    {t('academy.heroSubtitle', lang)}
                </p>

                {/* Bento Grid — 3 cards: 1 featured (3col×2row) + 2 secondary */}
                <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:auto-rows-[300px]">
                    {/* Featured — spans 3 cols, 2 rows */}
                    <Link
                        to={`/akademi/${featured.slug}`}
                        className="group relative col-span-1 row-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:col-span-2 lg:col-span-3 transition-colors duration-300 hover:border-slate-300"
                    >
                        <img
                            src={resolveMediaUrl(featured.cover_image_url) || BENTO_FALLBACK_IMAGES[0]}
                            alt={featuredTitle}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Content */}
                        <div className="relative flex h-full flex-col justify-end p-8 lg:p-10">
                            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                                {t('academy.featured', lang)}
                            </span>
                            <h2 className="mb-3 max-w-xl font-serif text-3xl font-medium leading-[1.15] text-white md:text-4xl lg:text-[42px]">
                                {featuredTitle}
                            </h2>
                            {featuredExcerpt && (
                                <p className="mb-4 line-clamp-2 max-w-lg text-sm font-light leading-relaxed text-white/75">
                                    {featuredExcerpt}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {estimateReadTime(featuredContent)} {t('academy.readTime', lang)}
                                </span>
                                <span className="h-3 w-px bg-white/30" />
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(featured.published_at || featured.created_at, lang)}
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Secondary cards — image-based with overlay text */}
                    {secondary.map((article, i) => {
                        const title = localizedField(article, 'title', lang)
                        const content = localizedField(article, 'content', lang)
                        const tags = parseTags(article.tags)
                        const imgSrc = resolveMediaUrl(article.cover_image_url) || BENTO_FALLBACK_IMAGES[i + 1] || BENTO_FALLBACK_IMAGES[1]

                        return (
                            <Link
                                key={article.id}
                                to={`/akademi/${article.slug}`}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 transition-colors duration-300 hover:border-slate-300 md:col-span-2 lg:col-span-2"
                            >
                                {/* Background image */}
                                <img
                                    src={imgSrc}
                                    alt={title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                                {/* Content */}
                                <div className="relative flex h-full flex-col justify-end p-6 lg:p-7">
                                    {tags.length > 0 && (
                                        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
                                            {tags[0]}
                                        </span>
                                    )}
                                    <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-white md:text-[22px]">
                                        {title}
                                    </h3>
                                    <div className="mt-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {estimateReadTime(content)} {t('academy.readTime', lang)}
                                        </span>
                                        <span className="h-2.5 w-px bg-white/25" />
                                        <span>
                                            {formatDate(article.published_at || article.created_at, lang)}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow indicator */}
                                <ArrowRight
                                    className="absolute right-5 top-5 h-4 w-4 text-white/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5"
                                />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   SEARCH & FILTER BAR
   ───────────────────────────────────────────────────────────── */
function SearchFilterBar({
    search,
    onSearchChange,
    activeCategory,
    onCategoryChange,
    resultCount,
}: {
    search: string
    onSearchChange: (v: string) => void
    activeCategory: string
    onCategoryChange: (v: string) => void
    resultCount: number
}) {
    const { lang } = useLanguage()

    return (
        <section className="border-t border-b border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                    {/* Search input */}
                    <div className="relative max-w-md flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={t('academy.searchPlaceholder', lang)}
                            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-5 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-colors focus:border-slate-400"
                        />
                    </div>

                    {/* Category pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        {CATEGORY_PILLS.map((pill) => (
                            <button
                                key={pill.key}
                                onClick={() => onCategoryChange(pill.key)}
                                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 ${activeCategory === pill.key
                                    ? 'bg-slate-900 text-white'
                                    : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                {t(pill.labelKey, lang)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result count */}
                <div className="mt-5 flex items-center gap-2 border-t border-slate-50 pt-4 md:mt-6 md:pt-5">
                    <span className="text-[22px] font-serif font-medium text-slate-900">{resultCount}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {t('academy.articleCount', lang)}
                    </span>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   ARTICLE FEED — Clean, minimal cards
   ───────────────────────────────────────────────────────────── */
function ArticleFeed({ articles }: { articles: Article[] }) {
    const { lang } = useLanguage()

    if (articles.length === 0) {
        return (
            <section className="flex min-h-[30vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3 text-center">
                    <BookOpen className="h-8 w-8 text-slate-200" strokeWidth={1} />
                    <p className="text-sm text-slate-400">{t('academy.noResults', lang)}</p>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-white pb-24 lg:pb-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="divide-y divide-slate-100">
                    {articles.map((article) => {
                        const title = localizedField(article, 'title', lang)
                        const excerpt = localizedField(article, 'excerpt', lang)
                        const content = localizedField(article, 'content', lang)
                        const tags = parseTags(article.tags)

                        return (
                            <Link
                                key={article.id}
                                to={`/akademi/${article.slug}`}
                                className="group grid grid-cols-1 items-start gap-6 py-8 transition-colors md:grid-cols-12 md:gap-10 md:py-10 first:pt-8 lg:first:pt-10"
                            >
                                {/* Image / Thumbnail */}
                                <div className="md:col-span-3">
                                    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                        {article.cover_image_url ? (
                                            <img
                                                src={resolveMediaUrl(article.cover_image_url)}
                                                alt={title}
                                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Hide broken images gracefully if path is truly broken
                                                    (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = 'none'
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BookOpen className="h-8 w-8 text-slate-200" strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col md:col-span-7">
                                    {/* Meta row */}
                                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        {tags.length > 0 && (
                                            <>
                                                <span className="text-brand-600">{tags[0]}</span>
                                                <span className="h-3 w-px bg-slate-200" />
                                            </>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {estimateReadTime(content)} {t('academy.readTime', lang)}
                                        </span>
                                        <span className="h-3 w-px bg-slate-200" />
                                        <span>
                                            {formatDate(article.published_at || article.created_at, lang)}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl font-medium leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-brand-700 md:text-[26px]">
                                        {title}
                                    </h3>
                                    {excerpt && (
                                        <p className="mt-3 line-clamp-2 text-[14px] font-light leading-[1.8] text-slate-500">
                                            {excerpt}
                                        </p>
                                    )}

                                    {/* Author */}
                                    {article.author && (
                                        <span className="mt-4 text-[11px] font-medium tracking-wide text-slate-400">
                                            {article.author}
                                        </span>
                                    )}
                                </div>

                                {/* CTA arrow */}
                                <div className="hidden items-center justify-end md:col-span-2 md:flex md:self-center">
                                    <span className="inline-flex items-center justify-center rounded-full border border-slate-200 p-3 text-slate-300 transition-all duration-300 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   PAGE EXPORT
   ───────────────────────────────────────────────────────────── */
export default function AcademyPage() {
    const { lang } = useLanguage()
    const { data, isLoading, isError, refetch } = useArticles()

    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    // SEO meta
    useEffect(() => {
        document.title = `${t('academy.pageTitle', lang)} — For-Labs`
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', t('academy.metaDesc', lang))
    }, [lang])

    const allArticles: Article[] = useMemo(() => data?.data ?? [], [data])

    // Filter articles client-side
    const filteredArticles = useMemo(() => {
        let result = allArticles

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter((a) => {
                const title = localizedField(a, 'title', lang).toLowerCase()
                const excerpt = (localizedField(a, 'excerpt', lang) || '').toLowerCase()
                const tags = (a.tags || '').toLowerCase()
                return title.includes(q) || excerpt.includes(q) || tags.includes(q)
            })
        }

        // Category filter (match against tags)
        if (activeCategory !== 'all') {
            const catPill = CATEGORY_PILLS.find((p) => p.key === activeCategory)
            if (catPill) {
                // Match pill label in both languages against article tags
                const trLabel = t(catPill.labelKey, 'tr' as 'tr').toLowerCase()
                const enLabel = t(catPill.labelKey, 'en' as 'en').toLowerCase()
                result = result.filter((a) => {
                    const tags = (a.tags || '').toLowerCase()
                    const keywords = (a.keywords || '').toLowerCase()
                    return (
                        tags.includes(trLabel) ||
                        tags.includes(enLabel) ||
                        tags.includes(activeCategory) ||
                        keywords.includes(trLabel) ||
                        keywords.includes(enLabel)
                    )
                })
            }
        }

        return result
    }, [allArticles, search, activeCategory, lang])

    // Separate articles for bento hero vs feed — use unfiltered for hero
    const bentoArticles = allArticles.slice(0, 3)
    const feedArticles = filteredArticles

    // Loading
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <p className="text-sm text-slate-400">{t('academy.loading', lang)}</p>
                </div>
            </div>
        )
    }

    // Error
    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-6 w-6 text-slate-300" />
                    <p className="text-sm text-slate-500">{t('academy.error', lang)}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 rounded-full border border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        {t('academy.retry', lang)}
                    </button>
                </div>
            </div>
        )
    }

    // Empty state
    if (allArticles.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3 text-center">
                    <BookOpen className="h-8 w-8 text-slate-200" strokeWidth={1} />
                    <p className="text-sm text-slate-400">{t('academy.noArticles', lang)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <BentoHero articles={bentoArticles} />
            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                resultCount={feedArticles.length}
            />
            <ArticleFeed articles={feedArticles} />
        </div>
    )
}
