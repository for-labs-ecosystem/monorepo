import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ProjectDetail {
    id: number
    slug: string
    title: string
    content: string | null
    description: string | null
    short_description: string | null
    cover_image_url: string | null
    gallery: string | null
    client_name: string | null
    completion_date: string | null
    meta_title: string | null
    meta_description: string | null
}

export default function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>()

    const { data, isLoading, error } = useQuery({
        queryKey: ['project', slug],
        queryFn: () => getProject(slug!),
        enabled: !!slug,
    })

    const project = data?.data as ProjectDetail | undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                <h1 className="text-2xl font-bold text-brand-900 mb-3">Proje Bulunamadı</h1>
                <Link to="/projeler" className="text-sm font-semibold text-brand-600">← Projelere Dön</Link>
            </div>
        )
    }

    const galleryImages: string[] = (() => {
        try { return project.gallery ? JSON.parse(project.gallery) : [] } catch { return [] }
    })()

    return (
        <>
            <title>{project.meta_title || project.title} — Lab Kurulum</title>
            {project.meta_description && <meta name="description" content={project.meta_description} />}

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/projeler" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Projelere Dön
                    </Link>
                </div>
            </div>

            <article className="mx-auto max-w-4xl px-6 lg:px-10 py-12 lg:py-20">
                {/* Project meta */}
                <div className="flex items-center gap-4 mb-4">
                    {project.client_name && (
                        <span className="text-[11px] font-mono font-semibold text-accent-600 uppercase tracking-wider px-2 py-1 border border-accent-200 rounded-sm bg-accent-50">
                            {project.client_name}
                        </span>
                    )}
                    {project.completion_date && (
                        <span className="text-xs font-mono text-slate-400">
                            Tamamlanma: {new Date(project.completion_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-900 tracking-tight leading-tight mb-6">
                    {project.title}
                </h1>

                {project.short_description && (
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed">{project.short_description}</p>
                )}

                {project.cover_image_url && (
                    <div className="mb-10 overflow-hidden rounded-md border border-slate-200">
                        <img
                            src={resolveMediaUrl(project.cover_image_url)}
                            alt={project.title}
                            className="w-full h-56 sm:h-64 md:h-80 object-cover"
                        />
                    </div>
                )}

                {project.content ? (
                    <TiptapRenderer content={project.content} />
                ) : project.description ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: project.description }} />
                ) : null}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-4">Proje Görselleri</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {galleryImages.map((img, i) => (
                                <div key={i} className="aspect-[4/3] border border-slate-200 rounded-sm overflow-hidden bg-slate-50">
                                    <img src={resolveMediaUrl(img)} alt={`${project.title} ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 p-6 border border-brand-200 rounded-md bg-brand-50">
                    <h3 className="text-base font-bold text-brand-900">Benzer bir proje mi planlıyorsunuz?</h3>
                    <p className="text-sm text-slate-600 mt-1">Laboratuvar ihtiyaçlarınızı analiz edip size özel çözüm önerisi sunalım.</p>
                    <Link
                        to="/iletisim"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors"
                    >
                        Teklif Al <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </article>
        </>
    )
}
