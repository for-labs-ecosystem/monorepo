import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getArticles } from '@forlabs/core'
import { ArrowRight, Clock } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface ArticleItem {
    id: number
    slug: string
    title: string
    short_description: string | null
    image_url: string | null
    created_at: string | null
    category_name: string | null
}

export default function ArticlesPage() {
    const { data: articlesRes, isLoading } = useQuery({
        queryKey: ['articles', SITE_ID],
        queryFn: () => getArticles({}),
        staleTime: 3 * 60 * 1000,
    })

    const articles = (articlesRes?.data ?? []) as ArticleItem[]

    return (
        <>
            <title>Bilgi Bankası — Lab Kurulum</title>
            <meta name="description" content="Laboratuvar kurulumu, akreditasyon ve teknik konularda uzman makaleleri." />

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">// Bilgi Bankası</span>
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">Teknik Makaleler & Rehberler</h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl">
                        Laboratuvar kurulumu, ekipman seçimi ve akreditasyon süreçlerine dair uzman içeriklerimiz.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && articles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-slate-400">Henüz makale bulunmuyor.</p>
                    </div>
                )}

                {!isLoading && articles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/bilgi-bankasi/${article.slug}`}
                                className="group border border-slate-200 rounded-md bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                            >
                                {article.image_url ? (
                                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                        <img
                                            src={getImageUrl(article.image_url)}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[16/9] bg-blueprint-grid-heavy flex items-center justify-center">
                                        <span className="font-mono text-sm text-brand-300">DOC-{String(article.id).padStart(3, '0')}</span>
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        {article.category_name && (
                                            <span className="text-[10px] font-mono font-semibold text-accent-600 uppercase tracking-wider">
                                                {article.category_name}
                                            </span>
                                        )}
                                        {article.created_at && (
                                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(article.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    {article.short_description && (
                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                                            {article.short_description}
                                        </p>
                                    )}
                                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                                        Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
