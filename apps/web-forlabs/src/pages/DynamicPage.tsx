import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import { useLanguage } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'

interface PageData {
  id: number
  slug: string
  title: string
  title_en: string | null
  content: string | null
  content_en: string | null
  cover_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  keywords: string | null
  is_active: boolean
}

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLanguage()

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', slug, SITE_ID],
    queryFn: () => getPage(slug!),
    enabled: !!slug,
  })

  const page = data?.data as PageData | undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Sayfa Bulunamadı</h1>
        <p className="text-slate-500 text-sm">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
    )
  }

  const title = (lang === 'en' && page.title_en) ? page.title_en : page.title
  const content = (lang === 'en' && page.content_en) ? page.content_en : page.content
  const metaTitle = page.meta_title || title
  const metaDescription = page.meta_description || ''

  return (
    <>
      {/* SEO */}
      <title>{metaTitle} — For Labs</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

      <article className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-24">
        {page.cover_image_url && (
          <div className="mb-12 overflow-hidden rounded-2xl shadow-sm">
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
