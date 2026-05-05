import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ChevronLeft, BookOpen, Calendar, User, Share2, Twitter, Linkedin,
    MessageCircle, Link as LinkIcon, Check, ArrowRight, Clock,
} from 'lucide-react'
import { useArticle, useArticles, TiptapRenderer } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

function estimateReadingTime(content: string | null | undefined): number | null {
    if (!content) return null
    const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) return null
    const words = text.split(' ').length
    return Math.max(1, Math.round(words / 200))
}

export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useArticle(slug ?? '')
    const { data: allRes } = useArticles()
    const article = data?.data
    const [copied, setCopied] = useState(false)

    const allArticles = (allRes?.data ?? []) as Article[]

    /* Related: same category first, else recent; exclude current */
    const related = useMemo<Article[]>(() => {
        if (!article) return []
        const others = allArticles.filter((a) => a.slug !== article.slug && a.is_active !== false)
        const sameCat = article.category_id != null
            ? others.filter((a) => a.category_id === article.category_id)
            : []
        const sortByDate = (arr: Article[]) =>
            [...arr].sort((a, b) => {
                const da = a.published_at ? new Date(a.published_at).getTime() : 0
                const db = b.published_at ? new Date(b.published_at).getTime() : 0
                return db - da
            })
        const picks = [...sortByDate(sameCat), ...sortByDate(others.filter((a) => !sameCat.includes(a)))]
        return picks.slice(0, 3)
    }, [article, allArticles])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-clean-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <BookOpen className="w-12 h-12 text-clean-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Makale bulunamadı</h1>
                <p className="text-slate-500 mb-6">Aradığınız içerik mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/bilgi-bankasi" className="btn-uv">Bilgi Bankasına Dön</Link>
            </div>
        )
    }

    const cover = article.cover_image_url ? getImageUrl(article.cover_image_url) : null
    const publishedAt = article.published_at
        ? new Date(article.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null
    const readingTime = estimateReadingTime(article.content)

    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareTitle = article.title
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch { /* ignore */ }
    }

    const tagList = (article.tags ?? '').split(/[,\n]+/).map((t) => t.trim()).filter(Boolean)

    return (
        <>
            <title>{article.meta_title || article.title} | HijyenKontrol</title>
            {article.meta_description && <meta name="description" content={article.meta_description} />}
            {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}

            <article className="mx-auto max-w-4xl px-6 lg:px-10 pt-8 pb-24">
                <Link to="/bilgi-bankasi" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-clean-700 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4" />
                    Bilgi Bankası
                </Link>

                <header className="mb-10">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-[1.15] tracking-tight mb-5">{article.title}</h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-slate-500">
                        {article.author && (
                            <span className="inline-flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-clean-500" />
                                {article.author}
                            </span>
                        )}
                        {publishedAt && (
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-clean-500" />
                                {publishedAt}
                            </span>
                        )}
                        {readingTime && (
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-clean-500" />
                                {readingTime} dk okuma
                            </span>
                        )}
                    </div>
                </header>

                {cover && (
                    <div className="glass-card overflow-hidden mb-12">
                        <img
                            src={cover}
                            alt={article.title}
                            className="w-full h-auto max-h-[480px] object-cover"
                        />
                    </div>
                )}

                {article.excerpt && (
                    <p className="text-[17px] text-slate-600 leading-relaxed font-medium border-l-2 border-clean-300 pl-5 mb-10">
                        {article.excerpt}
                    </p>
                )}

                {article.content ? (
                    <div className="glass-card p-8 lg:p-12">
                        <TiptapRenderer content={article.content} />
                    </div>
                ) : (
                    <p className="text-slate-400 italic">Bu makalenin henüz içeriği bulunmuyor.</p>
                )}

                {/* ─── Tags + Share footer ─── */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    {tagList.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.18em] mr-1">Etiketler</span>
                            {tagList.map((t, i) => (
                                <span key={i} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-[11.5px] font-medium text-slate-600">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    ) : <span />}

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.18em] mr-1">
                            <Share2 className="w-3 h-3" />Paylaş
                        </span>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-uv-700 hover:border-uv-200 hover:bg-uv-50 transition-all duration-200"
                            aria-label="Twitter'da paylaş"
                        >
                            <Twitter className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-uv-700 hover:border-uv-200 hover:bg-uv-50 transition-all duration-200"
                            aria-label="LinkedIn'de paylaş"
                        >
                            <Linkedin className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} — ${shareUrl}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/10 transition-all duration-200"
                            aria-label="WhatsApp'tan paylaş"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <button
                            onClick={handleCopy}
                            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                                copied
                                    ? 'bg-clean-50 border-clean-300 text-clean-700'
                                    : 'bg-white border-slate-200 text-slate-500 hover:text-uv-700 hover:border-uv-200 hover:bg-uv-50'
                            }`}
                            aria-label="Bağlantıyı kopyala"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </article>

            {/* ─── Related articles ─── */}
            {related.length > 0 && (
                <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-24">
                    <div className="flex items-end justify-between gap-6 mb-8">
                        <div>
                            <p className="text-[10.5px] font-bold text-clean-700 uppercase tracking-[0.22em] mb-2">Devamı</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Sizin için diğer içerikler</h2>
                        </div>
                        <Link to="/bilgi-bankasi" className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-uv-700 hover:text-uv-900 transition-colors">
                            Tümünü gör <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {related.map((r) => {
                            const rCover = r.cover_image_url ? getImageUrl(r.cover_image_url) : null
                            const rDate = r.published_at
                                ? new Date(r.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                                : null
                            return (
                                <Link
                                    key={r.id}
                                    to={`/bilgi-bankasi/${r.slug}`}
                                    className="group glass-card overflow-hidden flex flex-col"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-uv-50/60 via-white to-clean-50/40 overflow-hidden flex items-center justify-center">
                                        {rCover ? (
                                            <img
                                                src={rCover}
                                                alt={r.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <BookOpen className="w-10 h-10 text-clean-200" />
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        {rDate && (
                                            <span className="text-[10.5px] font-bold text-clean-700 uppercase tracking-[0.18em] mb-2">{rDate}</span>
                                        )}
                                        <h3 className="text-[15px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-uv-700 transition-colors line-clamp-2">{r.title}</h3>
                                        {r.excerpt && (
                                            <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{r.excerpt}</p>
                                        )}
                                        <div className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-uv-700">
                                            Okumaya devam et
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}
        </>
    )
}
