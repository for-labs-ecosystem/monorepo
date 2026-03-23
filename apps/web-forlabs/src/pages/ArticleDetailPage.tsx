import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    AlertCircle,
    BookOpen,
    Clock,
    Calendar,
    User,
    Phone,
    Package,
} from 'lucide-react'
import { useLanguage, t, localizedField } from '@/lib/i18n'
import { useArticle, useArticles } from '@/hooks/useArticles'
import type { Article } from '@forlabs/shared'

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

function estimateReadTime(content: string | null): number {
    if (!content) return 3
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(2, Math.ceil(words / 200))
}

function formatDate(dateStr: string | null, lang: string): string {
    if (!dateStr) return ''
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return ''
    }
}

function parseTags(tags: string | null): string[] {
    if (!tags) return []
    try {
        const parsed = JSON.parse(tags)
        if (Array.isArray(parsed)) return parsed
    } catch {
        // not JSON
    }
    return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

function formatPrice(price: number | null, currency: string): string {
    if (price === null || price === undefined) return ''
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

const API_BASE = import.meta.env.VITE_API_URL as string

function resolveMediaUrl(url: string | null): string {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Relative paths like /api/media/serve/... need the API base
    return `${API_BASE}${url}`
}

/* ─────────────────────────────────────────────────────────────
   BREADCRUMB
   ───────────────────────────────────────────────────────────── */
function Breadcrumb({ title }: { title: string }) {
    const { lang } = useLanguage()
    return (
        <nav className="border-b border-slate-100 bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 lg:px-8">
                <Link
                    to="/akademi"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-700"
                >
                    <ArrowLeft className="h-3 w-3" />
                    {t('articleDetail.backToAcademy', lang)}
                </Link>
                <span className="text-slate-200">/</span>
                <span className="truncate text-[12px] font-medium text-slate-600">{title}</span>
            </div>
        </nav>
    )
}

/* ─────────────────────────────────────────────────────────────
   ARTICLE HEADER — Split layout: text left, image right
   ───────────────────────────────────────────────────────────── */
function ArticleHeader({ article }: { article: Article }) {
    const { lang } = useLanguage()
    const title = localizedField(article, 'title', lang)
    const excerpt = localizedField(article, 'excerpt', lang)
    const content = localizedField(article, 'content', lang)
    const tags = parseTags(article.tags)
    const hasImage = !!article.cover_image_url

    return (
        <header className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className={`grid grid-cols-1 items-center gap-10 py-12 lg:py-20 ${hasImage ? 'lg:grid-cols-2 lg:gap-16' : ''}`}>

                    {/* Left: Text content */}
                    <div>
                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="font-serif text-3xl font-medium leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-[44px]">
                            {title}
                        </h1>

                        {/* Excerpt */}
                        {excerpt && (
                            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-slate-500 sm:text-lg">
                                {excerpt}
                            </p>
                        )}

                        {/* Meta row */}
                        <div className="mt-8 flex flex-wrap items-center gap-6 text-[11px] font-medium uppercase tracking-widest text-slate-400">
                            {article.author && (
                                <span className="flex items-center gap-1.5">
                                    <User className="h-3 w-3" />
                                    {article.author}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(article.published_at || article.created_at, lang)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {estimateReadTime(content)} {t('articleDetail.readTime', lang)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Cover image — framed, compact */}
                    {hasImage && (
                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-2">
                                <div className="aspect-[16/10] overflow-hidden rounded-lg">
                                    <img
                                        src={resolveMediaUrl(article.cover_image_url)}
                                        alt={title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            // Hide broken images gracefully
                                            (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-b border-slate-100" />
            </div>
        </header>
    )
}

/* ─────────────────────────────────────────────────────────────
   MAIN CONTENT — Asymmetric grid: prose (8/9 cols) + sidebar (3/4 cols)
   ───────────────────────────────────────────────────────────── */
function ArticleBody({ article }: { article: Article }) {
    const { lang } = useLanguage()
    const content = localizedField(article, 'content', lang)
    const relatedProducts = article.relatedProducts ?? []

    return (
        <section className="bg-white py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* === LEFT: Reading column === */}
                    <article className="lg:col-span-8">
                        {content ? (
                            <div
                                className="
                                    prose prose-slate max-w-none
                                    prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight
                                    prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-[26px] prose-h2:leading-snug prose-h2:text-slate-900
                                    prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-xl prose-h3:text-slate-800
                                    prose-p:text-[16px] prose-p:font-light prose-p:leading-[1.9] prose-p:text-slate-600
                                    prose-li:text-[16px] prose-li:font-light prose-li:leading-[1.9] prose-li:text-slate-600
                                    prose-a:font-medium prose-a:text-brand-600 prose-a:no-underline hover:prose-a:text-brand-700
                                    prose-strong:font-semibold prose-strong:text-slate-800
                                    prose-img:rounded-xl prose-img:shadow-none prose-img:border prose-img:border-slate-100
                                    prose-blockquote:border-l-2 prose-blockquote:border-slate-200 prose-blockquote:pl-6 prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-slate-500
                                    prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:text-slate-700
                                    prose-hr:border-slate-100
                                    prose-figure:my-10
                                "
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <div className="flex min-h-[200px] items-center justify-center">
                                <BookOpen className="h-8 w-8 text-slate-200" strokeWidth={1} />
                            </div>
                        )}
                    </article>

                    {/* === RIGHT: Ecosystem sidebar === */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-32">
                            {/* Sidebar heading */}
                            <div className="mb-6 flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900">
                                    <Package className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-500">
                                    {t('articleDetail.sidebarTitle', lang)}
                                </h2>
                            </div>

                            {/* Related products */}
                            {relatedProducts.length > 0 ? (
                                <div className="space-y-0 divide-y divide-slate-100">
                                    {relatedProducts.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/urunler/${product.slug}`}
                                            className="group flex items-start gap-4 py-5 transition-colors first:pt-0"
                                        >
                                            {/* Product image */}
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                                {product.image_url ? (
                                                    <img
                                                        src={resolveMediaUrl(product.image_url)}
                                                        alt={product.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-5 w-5 text-slate-200" strokeWidth={1} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product info */}
                                            <div className="min-w-0 flex-1">
                                                {product.brand && (
                                                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                                        {product.brand}
                                                    </span>
                                                )}
                                                <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-slate-700 transition-colors group-hover:text-brand-600">
                                                    {product.title}
                                                </h3>
                                                {product.price !== null && product.price > 0 && (
                                                    <span className="mt-1 block text-[12px] font-semibold text-slate-900">
                                                        {formatPrice(product.price, product.currency)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-slate-200 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[13px] font-light leading-relaxed text-slate-400">
                                    {t('articleDetail.sidebarEmpty', lang)}
                                </p>
                            )}

                            {/* Divider + mini CTA */}
                            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                <p className="text-[12px] font-medium leading-relaxed text-slate-500">
                                    {t('articleDetail.ctaDesc', lang)}
                                </p>
                                <Link
                                    to="/iletisim"
                                    className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-700 transition-colors hover:text-brand-600"
                                >
                                    {t('articleDetail.ctaBtn', lang)}
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM CTA — Full-width call to action
   ───────────────────────────────────────────────────────────── */
function ArticleCTA() {
    const { lang } = useLanguage()

    return (
        <section className="border-t border-slate-200 bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5">
                        <Phone className="h-3 w-3 text-brand-600" strokeWidth={1.5} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {t('articleDetail.ctaBadge', lang)}
                        </span>
                    </span>

                    <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                        {t('articleDetail.ctaTitle', lang)}
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-500">
                        {t('articleDetail.ctaDesc', lang)}
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                        <Link
                            to="/iletisim"
                            className="group inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
                        >
                            {t('articleDetail.ctaBtn', lang)}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{t('articleDetail.ctaPhone', lang)}</span>
                            <a
                                href="tel:+908503778689"
                                className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
                            >
                                0850 377 86 89
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────────────────
   RELATED ARTICLES — Other articles
   ───────────────────────────────────────────────────────────── */
function RelatedArticles({ currentId }: { currentId: number }) {
    const { lang } = useLanguage()
    const { data } = useArticles()
    const articles = (data?.data ?? []).filter((a) => a.id !== currentId).slice(0, 3)

    if (articles.length === 0) return null

    return (
        <section className="border-t border-slate-100 bg-slate-50 py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="mb-12 font-serif text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                    {t('articleDetail.relatedArticles', lang)}
                </h2>

                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => {
                        const articleTitle = localizedField(article, 'title', lang)
                        const articleExcerpt = localizedField(article, 'excerpt', lang)
                        const content = localizedField(article, 'content', lang)

                        return (
                            <Link
                                key={article.id}
                                to={`/akademi/${article.slug}`}
                                className="group flex flex-col bg-white p-8 transition-colors hover:bg-slate-50"
                            >
                                {/* Cover image */}
                                {article.cover_image_url ? (
                                    <div className="mb-6 aspect-[3/2] overflow-hidden rounded-xl">
                                        <img
                                            src={resolveMediaUrl(article.cover_image_url)}
                                            alt={articleTitle}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-6 flex aspect-[3/2] items-center justify-center rounded-xl bg-slate-50">
                                        <BookOpen className="h-10 w-10 text-slate-200" strokeWidth={1} />
                                    </div>
                                )}

                                <h3 className="font-serif text-lg font-medium tracking-tight text-slate-900 transition-colors group-hover:text-brand-600">
                                    {articleTitle}
                                </h3>

                                {articleExcerpt && (
                                    <p className="mt-2 line-clamp-2 flex-1 text-sm font-light leading-relaxed text-slate-500">
                                        {articleExcerpt}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" />
                                        {estimateReadTime(content)} {t('articleDetail.readTime', lang)}
                                    </span>
                                    <span className="h-2.5 w-px bg-slate-200" />
                                    <span>
                                        {formatDate(article.published_at || article.created_at, lang)}
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
export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { lang } = useLanguage()
    const { data, isLoading, isError } = useArticle(slug ?? '')

    const article = data?.data

    useEffect(() => {
        if (article) {
            const title = localizedField(article, 'title', lang)
            document.title = `${title} — Akademi — For-Labs`
            const meta = document.querySelector('meta[name="description"]')
            if (meta) {
                const desc = article.meta_description ?? localizedField(article, 'excerpt', lang) ?? ''
                meta.setAttribute('content', desc)
            }
        }
    }, [article, lang])

    /* Loading */
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <p className="text-sm text-slate-400">{t('articleDetail.loading', lang)}</p>
                </div>
            </div>
        )
    }

    /* Error / Not found */
    if (isError || !article) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-6 w-6 text-slate-300" />
                    <p className="text-sm text-slate-500">{t('articleDetail.notFound', lang)}</p>
                    <Link
                        to="/akademi"
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        {t('articleDetail.backToAcademy', lang)}
                    </Link>
                </div>
            </div>
        )
    }

    const title = localizedField(article, 'title', lang)

    return (
        <>
            <Breadcrumb title={title} />
            <ArticleHeader article={article} />
            <ArticleBody article={article} />
            <ArticleCTA />
            <RelatedArticles currentId={article.id} />
        </>
    )
}
