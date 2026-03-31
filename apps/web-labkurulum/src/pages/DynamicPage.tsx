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
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-brand-900 mb-3">Sayfa Bulunamadı</h1>
        <p className="text-slate-500 text-sm mb-6">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">← Ana Sayfaya Dön</Link>
      </div>
    )
  }

  const title = page.title
  const content = page.content
  const metaTitle = page.meta_title || title

  return (
    <>
      <title>{metaTitle} — Lab Kurulum</title>
      {page.meta_description && <meta name="description" content={page.meta_description} />}
      {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

      <article className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-24">
        {page.cover_image_url && (
          <div className="mb-12 overflow-hidden rounded-md border border-slate-200">
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
          <p className="text-slate-400 italic">Bu sayfanın henüz içeriği bulunmuyor.</p>
        )}
      </article>
    </>
  )
}
