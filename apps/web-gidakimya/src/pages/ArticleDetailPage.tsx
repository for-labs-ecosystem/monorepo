import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, BookOpen, Calendar, Clock, Share2 } from 'lucide-react'
import { useArticle, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import type { Article } from '@forlabs/shared'
import ArticleInquiryModal from '@/components/ArticleInquiryModal'

export default function ArticleDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data, isLoading, error } = useArticle(slug!)
    const article = data?.data as Article | undefined
    const [inquiryOpen, setInquiryOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !article) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <BookOpen className="w-12 h-12 text-azure-200 mx-auto mb-6" />
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Makale Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-8 font-light">Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/bilgi-bankasi" className="inline-flex items-center gap-2 text-[13px] font-semibold text-azure-500 hover:text-azure-600 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Bilgi Bankasına Dön
                </Link>
            </div>
        )
    }

    return (
        <>
            <title>{article.meta_title || article.title} — GıdaKimya Bilgi Bankası</title>
            {article.meta_description && <meta name="description" content={article.meta_description} />}
            {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}

            <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 lg:py-16">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-azure-500 transition-colors">Anasayfa</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <Link to="/bilgi-bankasi" className="hover:text-azure-500 transition-colors">Bilgi Bankası</Link>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-slate-500 truncate max-w-[200px]">{article.title}</span>
                </nav>

                {/* Header */}
                <header className="mb-12">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-azure-500 uppercase tracking-[0.2em] mb-4">
                        <BookOpen className="w-3.5 h-3.5" />
                        Bilgi Bankası
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight tracking-tight">{article.title}</h1>
                    {article.excerpt && (
                        <p className="mt-5 text-lg text-slate-400 leading-relaxed font-light max-w-3xl">{article.excerpt}</p>
                    )}
                    <div className="mt-6 flex items-center gap-5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.ceil((article.content?.length ?? 0) / 1500)} dk okuma
                        </span>
                    </div>
                </header>

                {/* Cover */}
                {article.cover_image_url && (
                    <div className="mb-14 overflow-hidden rounded-[2rem] border border-azure-100/20">
                        <img
                            src={resolveMediaUrl(article.cover_image_url)}
                            alt={article.title}
                            className="w-full h-48 sm:h-56 md:h-80 object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                {article.content ? (
                    <div className="prose prose-slate max-w-none prose-lg prose-img:rounded-3xl prose-headings:text-slate-700">
                        <TiptapRenderer content={article.content} />
                    </div>
                ) : (
                    <p className="text-slate-400 italic font-light">Bu makalenin henüz içeriği bulunmuyor.</p>
                )}

                {/* Bottom nav */}
                <div className="mt-20 pt-10 border-t border-azure-100/20 flex flex-col sm:flex-row gap-6 justify-between items-center sm:items-start">
                    <Link
                        to="/bilgi-bankasi"
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-azure-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Tüm Makaleler
                    </Link>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: article.title,
                                        url: window.location.href,
                                    }).catch(() => {})
                                } else {
                                    navigator.clipboard.writeText(window.location.href)
                                    // Normally we'd use a toast, fallback to alert if copy API is used directly
                                    alert('Bağlantı kopyalandı!')
                                }
                            }}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-[12px] font-semibold text-slate-500 hover:text-azure-600 hover:border-azure-200 hover:bg-azure-50 transition-all duration-300"
                        >
                            <Share2 className="w-4 h-4" />
                            Paylaş
                        </button>
                        <button
                            onClick={() => setInquiryOpen(true)}
                            className="flex-1 sm:flex-none btn-azure !text-[12px] !py-2.5 !px-6"
                        >
                            Soru Sorun
                        </button>
                    </div>
                </div>
            </article>

            {article && (
                <ArticleInquiryModal
                    open={inquiryOpen}
                    onClose={() => setInquiryOpen(false)}
                    article={article}
                />
            )}
        </>
    )
}
