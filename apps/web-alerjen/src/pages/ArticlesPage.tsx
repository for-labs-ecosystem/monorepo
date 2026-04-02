import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight, Leaf, Calendar } from 'lucide-react'
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
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 via-white to-peach-50/30" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-ocean-200/8 blur-[120px]" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 mb-5">
                        <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-500">Araştırmalar & Makaleler</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-600 tracking-tight">
                        Araştırmalar & Makaleler
                    </h1>
                    <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Gıda güvenliği, alerjen yönetimi ve laboratuvar teknolojileri üzerine bilimsel içerikler ve sektör analizleri.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-14 lg:py-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[400px] pebble-card animate-pulse !bg-ocean-50/20" />
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-28">
                            <Leaf className="w-12 h-12 text-ocean-200 mx-auto mb-5" />
                            <p className="text-lg font-semibold text-slate-400">Henüz makale yayınlanmadı</p>
                            <p className="text-sm text-slate-400 mt-1.5 font-light">Yakında bilimsel içeriklerimiz burada olacak.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    to={`/arastirmalar/${article.slug}`}
                                    className="group flex flex-col pebble-card overflow-hidden"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-ocean-50/30 to-mint-50/20 flex items-center justify-center overflow-hidden">
                                        {article.cover_image_url ? (
                                            <img
                                                src={getImageUrl(article.cover_image_url)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <Leaf className="w-10 h-10 text-ocean-200" />
                                        )}
                                    </div>
                                    <div className="p-7 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-semibold text-ocean-500 uppercase tracking-[0.15em]">Araştırma</span>
                                            {article.created_at && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-light">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-[15px] font-semibold text-slate-600 line-clamp-2 group-hover:text-ocean-600 transition-colors duration-300 leading-snug">
                                            {article.title}
                                        </h3>
                                        {article.excerpt && (
                                            <p className="text-[12px] text-slate-400 mt-3 line-clamp-3 leading-relaxed flex-1 font-light">{article.excerpt}</p>
                                        )}
                                        <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ocean-500 group-hover:gap-2.5 transition-all duration-300">
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
