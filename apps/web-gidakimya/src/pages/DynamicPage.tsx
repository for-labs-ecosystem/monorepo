import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'

interface PageData {
    id: number
    slug: string
    title: string
    content: string | null
    cover_image_url: string | null
    meta_title: string | null
    meta_description: string | null
    canonical_url: string | null
    is_active: boolean
}

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function DynamicPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data, isLoading, error } = useQuery({
        queryKey: ['page', slug, SITE_ID],
        queryFn: () => getPage(slug!),
        enabled: !!slug,
    })

    const page = data?.data as PageData | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !page) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-28 text-center">
                <h1 className="text-2xl font-semibold text-slate-500 mb-3">Sayfa Bulunamadı</h1>
                <p className="text-slate-400 text-sm mb-6 font-light">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
                <Link to="/" className="text-[13px] font-semibold text-azure-500 hover:text-azure-600 transition-colors duration-300">
                    ← Anasayfaya Dön
                </Link>
            </div>
        )
    }

    const title = page.title
    const content = page.content
    const metaTitle = page.meta_title || title

    return (
        <>
            <title>{metaTitle} — GıdaKimya</title>
            {page.meta_description && <meta name="description" content={page.meta_description} />}
            {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-20 lg:py-28">
                {page.cover_image_url && (
                    <div className="mb-14 overflow-hidden rounded-[2rem]">
                        <img
                            src={resolveMediaUrl(page.cover_image_url)}
                            alt={title}
                            className="w-full h-48 sm:h-56 md:h-72 object-cover"
                        />
                    </div>
                )}

                {content ? (
                    <TiptapRenderer content={content} />
                ) : (
                    <p className="text-slate-400 italic font-light">Bu sayfanın henüz içeriği bulunmuyor.</p>
                )}
            </article>
        </>
    )
}
