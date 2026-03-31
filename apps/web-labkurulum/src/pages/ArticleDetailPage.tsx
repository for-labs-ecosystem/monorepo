import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getArticle, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import { ArrowLeft, Clock } from 'lucide-react'

interface ArticleDetail {
    id: number
    slug: string
    title: string
    content: string | null
    short_description: string | null
    image_url: string | null
    created_at: string | null
    category_name: string | null
    meta_title: string | null
    meta_description: string | null
    canonical_url: string | null
}

export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data, isLoading, error } = useQuery({
        queryKey: ['article', slug],
        queryFn: () => getArticle(slug!),
        enabled: !!slug,
    })

    const article = data?.data as ArticleDetail | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-brand-900 mb-3">Makale Bulunamadı</h1>
                <Link to="/bilgi-bankasi" className="text-sm font-semibold text-brand-600">← Bilgi Bankasına Dön</Link>
            </div>
        )
    }

    const metaTitle = article.meta_title || article.title

    return (
        <>
            <title>{metaTitle} — Lab Kurulum</title>
            {article.meta_description && <meta name="description" content={article.meta_description} />}
            {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/bilgi-bankasi" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Bilgi Bankası
                    </Link>
                </div>
            </div>

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-20">
                {/* Meta info */}
                <div className="flex items-center gap-3 mb-6">
                    {article.category_name && (
                        <span className="text-[10px] font-mono font-semibold text-accent-600 uppercase tracking-wider px-2 py-1 border border-accent-200 rounded-sm bg-accent-50">
                            {article.category_name}
                        </span>
                    )}
                    {article.created_at && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(article.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-900 tracking-tight leading-tight mb-6">
                    {article.title}
                </h1>

                {article.short_description && (
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed border-l-2 border-brand-200 pl-4">
                        {article.short_description}
                    </p>
                )}

                {article.image_url && (
                    <div className="mb-10 overflow-hidden rounded-md border border-slate-200">
                        <img
                            src={resolveMediaUrl(article.image_url)}
                            alt={article.title}
                            className="w-full h-48 sm:h-56 md:h-72 object-cover"
                        />
                    </div>
                )}

                {article.content ? (
                    <TiptapRenderer content={article.content} />
                ) : (
                    <p className="text-slate-400 italic">Bu makalenin henüz içeriği bulunmuyor.</p>
                )}
            </article>
        </>
    )
}
