import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArticle, useArticles } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    ChevronRight,
    Clock3,
    MessageCircle,
    Package,
    Share2,
    Sparkles,
    Tag,
    User,
} from 'lucide-react'

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

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.2 6.42 2.2 11.84c0 1.74.45 3.43 1.32 4.93L2 22l5.39-1.41a9.8 9.8 0 0 0 4.64 1.18h.01c5.41 0 9.83-4.42 9.83-9.84 0-2.63-1.02-5.1-2.82-7.02Zm-7.02 15.2h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.2.84.85-3.12-.2-.32a8.16 8.16 0 0 1-1.25-4.35c0-4.5 3.66-8.16 8.17-8.16a8.1 8.1 0 0 1 5.78 2.4 8.1 8.1 0 0 1 2.38 5.77c0 4.5-3.66 8.16-8.16 8.16Zm4.48-6.1c-.25-.12-1.47-.73-1.7-.82-.23-.08-.4-.12-.58.13-.17.24-.66.82-.8.99-.15.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.24a7.42 7.42 0 0 1-1.38-1.72c-.14-.24-.02-.37.1-.5.11-.11.25-.29.37-.43.12-.14.16-.24.25-.4.08-.16.04-.3-.02-.43-.07-.12-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.43.06-.65.3-.23.24-.87.85-.87 2.06 0 1.2.9 2.37 1.02 2.53.12.16 1.76 2.7 4.26 3.79.6.26 1.07.42 1.44.54.6.19 1.15.16 1.58.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.18-.48-.3Z" />
        </svg>
    )
}

function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false)

    const handleShare = useCallback(async () => {
        const url = window.location.href
        if (navigator.share) {
            try { await navigator.share({ title, url }) } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [title])

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-primary-200 hover:text-primary-600"
        >
            <Share2 className="h-3.5 w-3.5" />
            {copied ? 'Kopyalandı!' : 'Paylaş'}
        </button>
    )
}

export default function KnowledgeArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading } = useArticle(slug ?? '')
    const { data: articlesData } = useArticles()

    const article = data?.data as Article | undefined
    const relatedArticles = useMemo(
        () => ((articlesData?.data ?? []) as Article[]).filter((item) => item.slug !== slug).slice(0, 3),
        [articlesData, slug]
    )

    useEffect(() => {
        if (!article) return
        document.title = `${article.meta_title || article.title} | Atago TR`
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
            meta.setAttribute('content', article.meta_description || article.excerpt || `${article.title} - Atago TR bilgi bankası içeriği`)
        }
    }, [article])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 w-48 rounded bg-slate-200" />
                        <div className="h-12 w-2/3 rounded bg-slate-200" />
                        <div className="h-80 rounded-[2rem] bg-slate-200" />
                        <div className="grid gap-8 lg:grid-cols-3">
                            <div className="space-y-3 lg:col-span-2">
                                <div className="h-4 rounded bg-slate-200" />
                                <div className="h-4 rounded bg-slate-200" />
                                <div className="h-4 w-5/6 rounded bg-slate-200" />
                            </div>
                            <div className="h-64 rounded-[2rem] bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!article) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <BookOpen className="h-7 w-7 text-slate-300" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Makale bulunamadı</h1>
                    <p className="mt-2 text-sm text-slate-500">Aradığınız bilgi bankası içeriği yayından kaldırılmış olabilir.</p>
                    <Link
                        to="/bilgi-bankasi"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                    >
                        Bilgi Bankasına Dön
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        )
    }

    const tags = parseTags(article.tags)
    const relatedProducts = article.relatedProducts ?? []

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Link to="/" className="transition-colors hover:text-primary-600">Anasayfa</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link to="/bilgi-bankasi" className="transition-colors hover:text-primary-600">Bilgi Bankası</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="max-w-xs truncate text-slate-600">{article.title}</span>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Bilgi Bankası İçeriği
                                </span>
                                {article.is_featured && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Öne Çıkan Makale
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                {article.title}
                            </h1>

                            {article.excerpt && (
                                <p className="mt-4 text-base leading-8 text-slate-500 sm:text-lg">
                                    {article.excerpt}
                                </p>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {formatDate(article.published_at || article.created_at)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {estimateReadTime(article.content)} dk okuma
                                </span>
                                {article.author && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        {article.author}
                                    </span>
                                )}
                            </div>
                        </div>

                        {article.cover_image_url && (
                            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                                <img
                                    src={getImageUrl(article.cover_image_url)}
                                    alt={article.title}
                                    className="max-h-[460px] w-full object-cover"
                                />
                            </div>
                        )}

                        {article.content && (
                            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                <h2 className="mb-4 text-lg font-bold text-slate-900">Makale Detayı</h2>
                                <div
                                    className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            </div>
                        )}

                        {relatedArticles.length > 0 && (
                            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Diğer İçerikler</h2>
                                        <p className="mt-1 text-sm text-slate-500">Bilgi bankasından okumaya devam edin.</p>
                                    </div>
                                    <Link to="/bilgi-bankasi" className="text-sm font-bold text-primary-600 transition-colors hover:text-primary-700">
                                        Tümünü Gör
                                    </Link>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle.id}
                                            to={`/bilgi-bankasi/${relatedArticle.slug}`}
                                            className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-white"
                                        >
                                            <h3 className="line-clamp-3 text-sm font-bold leading-6 text-slate-800 transition-colors group-hover:text-primary-700">
                                                {relatedArticle.title}
                                            </h3>
                                            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                                <Clock3 className="h-3 w-3" />
                                                {estimateReadTime(relatedArticle.content)} dk
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                to="/bilgi-bankasi"
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700"
                            >
                                ← Bilgi Bankasına Dön
                            </Link>
                            <ShareButton title={article.title} />
                        </div>
                        <div className="sticky top-28 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                            {tags.length > 0 && (
                                <div className="mb-6">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Etiketler</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                                            >
                                                <Tag className="h-3 w-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 border-t border-slate-100 pt-5">
                                <Link
                                    to="/destek"
                                    className="group flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm ring-1 ring-slate-200/70 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                                        <MessageCircle className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-primary-700">Yardım & Destek</p>
                                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary-600" />
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Ürün seçimi ve teklif süreci için hızlı destek alın.
                                        </p>
                                    </div>
                                </Link>

                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/80 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                        <WhatsAppIcon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-emerald-700">WhatsApp Destek</p>
                                            <ArrowRight className="h-4 w-4 shrink-0 text-emerald-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Uzman ekibe hemen yazın, hızlı yanıt alın.
                                        </p>
                                    </div>
                                </a>
                            </div>

                            <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">İlgili Ürünler</p>
                                {relatedProducts.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                        {relatedProducts.map((product) => (
                                            <Link
                                                key={product.id}
                                                to={`/urunler/${product.slug}`}
                                                className="group flex items-start gap-3 rounded-[1.5rem] border border-transparent bg-white/80 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-100 hover:bg-white hover:shadow-md"
                                            >
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                                    {product.image_url ? (
                                                        <img
                                                            src={getImageUrl(product.image_url)}
                                                            alt={product.title}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {product.brand && (
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{product.brand}</p>
                                                    )}
                                                    <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 transition-colors group-hover:text-primary-700">
                                                        {product.title}
                                                    </h3>
                                                    <div className="mt-2 flex items-center justify-between gap-3">
                                                        {product.price != null ? (
                                                            <p className="text-xs font-bold text-primary-700">
                                                                {product.price.toLocaleString('tr-TR')} {product.currency}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs font-medium text-slate-400">Detayları inceleyin</p>
                                                        )}
                                                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white">
                                                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm leading-6 text-slate-500">Bu makale için henüz ilişkili ürün tanımlanmamış.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
