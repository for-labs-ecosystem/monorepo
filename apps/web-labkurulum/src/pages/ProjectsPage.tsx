import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@forlabs/core'
import { ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface ProjectItem {
    id: number
    slug: string
    title: string
    short_description: string | null
    image_url: string | null
    client_name: string | null
    completion_date: string | null
}

export default function ProjectsPage() {
    const { data: projectsRes, isLoading } = useQuery({
        queryKey: ['projects', SITE_ID],
        queryFn: () => getProjects({}),
        staleTime: 3 * 60 * 1000,
    })

    const projects = (projectsRes?.data ?? []) as ProjectItem[]

    return (
        <>
            <title>Referans Projeler — Lab Kurulum</title>
            <meta name="description" content="Tamamlanan anahtar teslim laboratuvar kurulum projeleri ve referanslarımız." />

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">// Referanslar</span>
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">Referans Projeler</h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl">
                        Üniversite, hastane ve endüstriyel tesisler için tamamladığımız anahtar teslim laboratuvar projeleri.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && projects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-slate-400">Henüz proje kaydı bulunmuyor.</p>
                    </div>
                )}

                {!isLoading && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projeler/${project.slug}`}
                                className="group border border-slate-200 rounded-md bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                            >
                                {project.image_url ? (
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                        <img
                                            src={getImageUrl(project.image_url)}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[16/10] bg-blueprint-grid-heavy flex items-center justify-center">
                                        <span className="font-mono text-sm text-brand-300">PRJ-{String(project.id).padStart(3, '0')}</span>
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        {project.client_name && (
                                            <span className="text-[10px] font-mono font-semibold text-accent-600 uppercase tracking-wider">
                                                {project.client_name}
                                            </span>
                                        )}
                                        {project.completion_date && (
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {new Date(project.completion_date).getFullYear()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                                        {project.title}
                                    </h3>
                                    {project.short_description && (
                                        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                                            {project.short_description}
                                        </p>
                                    )}
                                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                                        Proje Detayı <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
