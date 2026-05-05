import { Link } from 'react-router-dom'
import { BookOpen, Calendar, ChevronRight } from 'lucide-react'
import { useArticles } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

export default function ArticlesPage() {
    const { data, isLoading } = useArticles()
    const articles = (data?.data ?? []) as Article[]

    return (
        <div className="py-16 lg:py-24">
            <title>Bilgi Bankası — GıdaTest</title>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="mb-14 max-w-2xl">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-px bg-sage-400" />
                        <span className="label-eyebrow">Bilgi Bankası</span>
                    </div>
                    <h1 className="heading-serif text-4xl lg:text-5xl mb-5">
                        Teknik makaleler & <span className="italic text-sage-600">sektör rehberi</span>
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        Gıda güvenliği, mevzuat, akreditasyon ve laboratuvar pratiklerine dair uzman içerikler.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`${i % 2 === 0 ? 'card-organic' : 'card-organic-alt'} h-80 animate-pulse bg-oat-100`} />
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 text-stone-500">Henüz makale yayımlanmadı.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.map((a, i) => (
                            <Link
                                key={a.id}
                                to={`/bilgi-bankasi/${a.slug}`}
                                className={`group ${i % 2 === 0 ? 'card-organic' : 'card-organic-alt'} flex flex-col overflow-hidden`}
                            >
                                <div className="relative h-48 bg-gradient-to-br from-sage-100 via-oat-50 to-harvest-100 overflow-hidden">
                                    {a.cover_image_url ? (
                                        <img src={getImageUrl(a.cover_image_url) || ''} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-sage-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    {a.created_at && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    )}
                                    <h3 className="heading-serif text-lg text-forest-900 mb-3 leading-snug group-hover:text-sage-700 transition-colors line-clamp-2">
                                        {a.title}
                                    </h3>
                                    {a.excerpt && (
                                        <p className="text-stone-600 text-[13px] leading-relaxed line-clamp-3 mb-5">{a.excerpt}</p>
                                    )}
                                    <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-sage-700 group-hover:text-harvest-600 transition-colors">
                                        Yazıyı Oku <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
