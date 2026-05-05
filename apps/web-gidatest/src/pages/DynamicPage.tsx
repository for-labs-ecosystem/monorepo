import { useParams } from 'react-router-dom'
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
                <div className="w-10 h-10 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !page) {
        return (
            <div className="max-w-xl mx-auto py-32 text-center px-6">
                <h1 className="heading-serif text-3xl mb-4">Sayfa bulunamadı</h1>
                <p className="text-stone-600">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
            </div>
        )
    }

    const metaTitle = page.meta_title || page.title

    return (
        <>
            <title>{metaTitle} — GıdaTest</title>
            {page.meta_description && <meta name="description" content={page.meta_description} />}
            {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-24">
                {page.cover_image_url && (
                    <div className="card-organic overflow-hidden mb-12 h-64 lg:h-80">
                        <img src={resolveMediaUrl(page.cover_image_url)} alt={page.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <h1 className="heading-serif text-4xl lg:text-5xl mb-8 leading-tight">{page.title}</h1>

                {page.content ? (
                    <TiptapRenderer content={page.content} />
                ) : (
                    <p className="text-stone-400 italic">Bu sayfanın henüz içeriği bulunmuyor.</p>
                )}
            </article>
        </>
    )
}
