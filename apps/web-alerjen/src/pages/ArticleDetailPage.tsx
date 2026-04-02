import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { useArticle, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import type { Article } from '@forlabs/shared'

export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useArticle(slug!)
    const article = data?.data as Article | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Makale Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-6 font-light">Aradığınız içerik mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/arastirmalar" className="text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300">
                    ← Araştırmalara Dön
                </Link>
            </div>
        )
    }

    const content = article.content as string | null

    return (
        <div className="min-h-screen">
            <title>{article.meta_title || article.title} — Alerjen</title>
            {article.meta_description && <meta name="description" content={article.meta_description} />}

            {/* Hero with cover image */}
            {article.cover_image_url && (
                <div className="relative h-64 sm:h-80 lg:h-[420px] overflow-hidden">
                    <img
                        src={resolveMediaUrl(article.cover_image_url)}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>
            )}

            <article className="mx-auto max-w-3xl px-6 lg:px-10 py-14 lg:py-24">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-8">
                    <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/arastirmalar" className="hover:text-ocean-500 transition-colors duration-300">Araştırmalar</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-500 truncate max-w-[200px]">{article.title}</span>
                </div>

                {/* Title & Meta */}
                <div className="mb-12">
                    <span className="text-[11px] font-semibold text-ocean-500 uppercase tracking-[0.15em]">Araştırma</span>
                    <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-600 tracking-tight leading-tight">
                        {article.title}
                    </h1>
                    <div className="mt-5 flex items-center gap-5 text-sm text-slate-400 font-light">
                        {article.created_at && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-ocean-300" />
                                {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-ocean-300" />
                            5 dk okuma
                        </span>
                    </div>
                </div>

                {/* Content */}
                {content ? (
                    <div className="prose-lg">
                        <TiptapRenderer content={content} />
                    </div>
                ) : (
                    <p className="text-slate-400 italic font-light">Bu makalenin henüz içeriği bulunmuyor.</p>
                )}

                {/* Back link */}
                <div className="mt-20 pt-8 border-t border-ocean-100/20">
                    <Link
                        to="/arastirmalar"
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tüm Araştırmalara Dön
                    </Link>
                </div>
            </article>
        </div>
    )
}
