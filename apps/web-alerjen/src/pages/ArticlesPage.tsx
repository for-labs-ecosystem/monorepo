import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight, FlaskConical, Calendar } from 'lucide-react'
import { useArticles } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import type { Article } from '@forlabs/shared'

export default function ArticlesPage() {
    const { data, isLoading } = useArticles()
    const articles = (data?.data ?? []) as Article[]

    return (
        <div className="min-h-screen">
            <title>Araştırmalar & Makaleler — Alerjen</title>

            {/* Hero */}
            <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-accent-50/30" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-600">Araştırmalar & Makaleler</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Araştırmalar & Makaleler
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Gıda güvenliği, alerjen yönetimi ve laboratuvar teknolojileri üzerine bilimsel içerikler ve sektör analizleri.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-12 lg:py-20">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[380px] rounded-3xl bg-white animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-24">
                            <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-400">Henüz makale yayınlanmadı</p>
                            <p className="text-sm text-slate-400 mt-1">Yakında bilimsel içeriklerimiz burada olacak.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    to={`/arastirmalar/${article.slug}`}
                                    className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center overflow-hidden">
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <FlaskConical className="w-12 h-12 text-primary-300" />
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Araştırma</span>
                                            {article.created_at && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug">
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed flex-1">{article.excerpt}</p>
                                        )}
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:gap-2 transition-all">
                                            Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
