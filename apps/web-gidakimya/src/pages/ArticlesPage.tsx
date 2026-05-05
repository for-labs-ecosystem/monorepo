import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useArticles } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Article } from '@forlabs/shared'

export default function ArticlesPage() {
    const { data: articlesData, isLoading } = useArticles({ limit: 50 })
    const articles = (articlesData?.data ?? []) as Article[]

    return (
        <>
            <title>Bilgi Bankası — GıdaKimya</title>
            <meta name="description" content="Gıda analiz teknolojileri, kalite kontrol yöntemleri ve laboratuvar uygulamaları üzerine teknik makaleler." />

            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
                {/* Page Header */}
                <div className="mb-14">
                    <span className="text-[11px] font-semibold text-azure-500 uppercase tracking-[0.2em]">Knowledge Base</span>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Bilgi Bankası</h1>
                    <p className="mt-4 text-slate-400 max-w-lg leading-relaxed">
                        Gıda analiz teknolojileri, kalite kontrol yöntemleri ve laboratuvar uygulamaları üzerine teknik içerikler.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[380px] bento-card animate-pulse !bg-azure-50/20" />
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-14 h-14 text-azure-100 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-500 mb-2">Henüz Makale Yok</h3>
                        <p className="text-sm text-slate-400">Kısa sürede teknik içerikler eklenecektir.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/bilgi-bankasi/${article.slug}`}
                                className="group flex flex-col bento-card overflow-hidden"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {article.cover_image_url ? (
                                        <img
                                            src={getImageUrl(article.cover_image_url)}
                                            alt={article.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-azure-50 to-lab-50 flex items-center justify-center">
                                            <BookOpen className="w-10 h-10 text-azure-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-20">
                                        <div className="bg-white/80 backdrop-blur-md text-azure-600 px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm">
                                            Makale
                                        </div>
                                    </div>
                                </div>

                                <div className="p-7 flex flex-col flex-1">
                                    <h3 className="text-[16px] font-bold text-slate-700 leading-snug line-clamp-2 group-hover:text-azure-600 transition-colors duration-300">
                                        {article.title}
                                    </h3>
                                    {article.excerpt && (
                                        <p className="mt-2.5 text-[12.5px] text-slate-400 leading-relaxed line-clamp-3">
                                            {article.excerpt}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-6 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-azure-500 group-hover:gap-2 transition-all duration-300">
                                            Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
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
