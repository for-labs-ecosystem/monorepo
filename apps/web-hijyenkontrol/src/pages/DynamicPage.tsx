import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileQuestion } from 'lucide-react'
import { getPage, TiptapRenderer } from '@forlabs/core'
import type { Page } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

export default function DynamicPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data, isLoading, error } = useQuery({
        queryKey: ['page', slug],
        queryFn: () => getPage(slug!),
        enabled: !!slug,
    })

    const page = data?.data as Page | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-uv-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !page) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <FileQuestion className="w-12 h-12 text-uv-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-3">Sayfa bulunamadı</h1>
                <p className="text-slate-500 mb-6">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/" className="btn-uv">Ana Sayfaya Dön</Link>
            </div>
        )
    }

    const cover = page.cover_image_url ? getImageUrl(page.cover_image_url) : null
    const metaTitle = page.meta_title || page.title

    return (
        <>
            <title>{metaTitle} — HijyenKontrol</title>
            {page.meta_description && <meta name="description" content={page.meta_description} />}
            {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-20">
                {cover && (
                    <div className="mb-12 glass-card overflow-hidden">
                        <img
                            src={cover}
                            alt={page.title}
                            className="w-full h-48 sm:h-64 md:h-80 object-cover"
                        />
                    </div>
                )}

                {page.content ? (
                    <div className="glass-card p-8 lg:p-12">
                        <TiptapRenderer content={page.content} />
                    </div>
                ) : (
                    <p className="text-slate-400 italic">Bu sayfanın henüz içeriği bulunmuyor.</p>
                )}
            </article>
        </>
    )
}
