import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar } from 'lucide-react'
import { useArticles } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Article } from '@forlabs/shared'

export default function LatestArticles() {
    const { data: articlesData } = useArticles({ limit: 3 })
    const articles = (articlesData?.data ?? []) as Article[]

    return (
        <section className="py-20 lg:py-28 relative">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
                <SectionHeader
                    tag="Bilgi Bankası"
                    title="Güncel Makaleler"
                    description="Gıda analiz teknolojileri ve kalite kontrol üzerine teknik içerikler."
                    linkTo="/bilgi-bankasi"
                    linkLabel="Tümünü Oku"
                />

                {articles.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] bento-card animate-pulse" style={{ background: 'rgba(239,246,255,0.3)' }} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {articles.slice(0, 3).map((article, idx) => (
                            <Link
                                key={article.id}
                                to={`/bilgi-bankasi/${article.slug}`}
                                className="group flex flex-col bento-card overflow-hidden"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {article.cover_image_url ? (
                                        <img
                                            src={getImageUrl(article.cover_image_url)}
                                            alt={article.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-azure-50 to-lab-50 flex items-center justify-center">
                                            <BookOpen className="w-10 h-10 text-azure-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-20">
                                        <div className="glass-widget-floating !pointer-events-auto px-3 py-1.5 !rounded-full text-[9px] font-bold text-azure-600 uppercase tracking-[0.12em]">
                                            Makale
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-7 flex flex-col flex-1">
                                    <h3 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-azure-600 transition-colors duration-300">
                                        {article.title}
                                    </h3>
                                    {article.excerpt && (
                                        <p className="mt-2.5 text-[12px] text-slate-400 leading-relaxed line-clamp-3">
                                            {article.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-6 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-azure-500 group-hover:gap-2.5 transition-all duration-300">
                                            Oku <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
