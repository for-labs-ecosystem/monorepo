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
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Makale Bulunamadı</h1>
                <p className="text-slate-500 text-sm mb-6">Aradığınız içerik mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/arastirmalar" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
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
                <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                    <img
                        src={resolveMediaUrl(article.cover_image_url)}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}

            <article className="mx-auto max-w-3xl px-6 lg:px-10 py-12 lg:py-20">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/arastirmalar" className="hover:text-primary-600 transition-colors">Araştırmalar</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 truncate max-w-[200px]">{article.title}</span>
                </div>

                {/* Title & Meta */}
                <div className="mb-10">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Araştırma</span>
                    <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {article.title}
                    </h1>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                        {article.created_at && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
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
                    <p className="text-slate-400 italic">Bu makalenin henüz içeriği bulunmuyor.</p>
                )}

                {/* Back link */}
                <div className="mt-16 pt-8 border-t border-slate-100">
                    <Link
                        to="/arastirmalar"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tüm Araştırmalara Dön
                    </Link>
                </div>
            </article>
        </div>
    )
}
