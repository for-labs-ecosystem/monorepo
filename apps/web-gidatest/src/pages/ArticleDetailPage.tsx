import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Calendar, User } from 'lucide-react'
import { useArticle, TiptapRenderer } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'

export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading } = useArticle(slug!)
    const article = data?.data

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!article) {
        return (
            <div className="max-w-xl mx-auto py-32 text-center px-6">
                <h1 className="heading-serif text-3xl mb-4">Makale bulunamadı</h1>
                <Link to="/bilgi-bankasi" className="btn-organic">
                    <ChevronLeft className="w-4 h-4" /> Bilgi Bankasına Dön
                </Link>
            </div>
        )
    }

    return (
        <article className="py-16 lg:py-24">
            <title>{article.meta_title || article.title} — GıdaTest</title>
            {article.meta_description && <meta name="description" content={article.meta_description} />}
            <div className="max-w-3xl mx-auto px-6 lg:px-10">
                <Link to="/bilgi-bankasi" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-forest-900 mb-8">
                    <ChevronLeft className="w-4 h-4" /> Bilgi Bankası
                </Link>

                {article.cover_image_url && (
                    <div className="card-organic overflow-hidden mb-10 h-72 lg:h-96">
                        <img src={getImageUrl(article.cover_image_url) || ''} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[12px] text-stone-500 mb-5">
                    {article.created_at && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    )}
                    {article.author && (
                        <span className="inline-flex items-center gap-1.5">
                            <User className="w-3 h-3" /> {article.author}
                        </span>
                    )}
                </div>

                <h1 className="heading-serif text-4xl lg:text-5xl mb-6 leading-tight">{article.title}</h1>
                {article.excerpt && (
                    <p className="text-stone-600 text-lg leading-relaxed mb-10 italic border-l-2 border-sage-400 pl-5">
                        {article.excerpt}
                    </p>
                )}

                {article.content && (
                    <div className="pt-8 border-t border-stone-200">
                        <TiptapRenderer content={article.content} />
                    </div>
                )}
            </div>
        </article>
    )
}
