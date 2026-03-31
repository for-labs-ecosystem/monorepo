import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getServices, getProjects } from '@forlabs/core'
import { ArrowRight, FlaskConical, Wrench, GraduationCap, ClipboardCheck, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface ServiceItem {
    id: number
    slug: string
    title: string
    short_description: string | null
    image_url: string | null
}

interface ProjectItem {
    id: number
    slug: string
    title: string
    short_description: string | null
    cover_image_url: string | null
    client_name: string | null
    completion_date: string | null
}

const CAPABILITY_CARDS = [
    {
        icon: FlaskConical,
        code: 'LAB-DES',
        title: 'Laboratuvar Tasarımı',
        description: 'Uluslararası standartlara uygun, iş akışı optimizasyonlu laboratuvar mimari projelendirme.',
    },
    {
        icon: Wrench,
        code: 'EQP-INT',
        title: 'Ekipman Entegrasyonu',
        description: 'Analitik cihazların tedarik, kurulum ve validasyon süreçlerinin anahtar teslim yönetimi.',
    },
    {
        icon: GraduationCap,
        code: 'TRN-CRT',
        title: 'Eğitim & Sertifikasyon',
        description: 'Laboratuvar personeli için cihaz kullanımı, kalibrasyon ve güvenlik eğitimleri.',
    },
    {
        icon: ClipboardCheck,
        code: 'QA-AUD',
        title: 'Kalite & Akreditasyon',
        description: 'ISO 17025, GLP ve GMP uygunluk danışmanlığı ve akreditasyon süreç yönetimi.',
    },
]

export default function HomePage() {
    // Try featured first, fallback to all items if none are featured
    const { data: featuredServicesRes } = useQuery({
        queryKey: ['services', SITE_ID, 'featured'],
        queryFn: () => getServices({ is_featured: '1', limit: '4' }),
        staleTime: 5 * 60 * 1000,
    })

    const { data: allServicesRes } = useQuery({
        queryKey: ['services', SITE_ID, 'all-homepage'],
        queryFn: () => getServices({ limit: '4' }),
        staleTime: 5 * 60 * 1000,
        enabled: (featuredServicesRes?.data ?? []).length === 0,
    })

    const { data: featuredProjectsRes } = useQuery({
        queryKey: ['projects', SITE_ID, 'featured'],
        queryFn: () => getProjects({ is_featured: '1', limit: '3' }),
        staleTime: 5 * 60 * 1000,
    })

    const { data: allProjectsRes } = useQuery({
        queryKey: ['projects', SITE_ID, 'all-homepage'],
        queryFn: () => getProjects({ limit: '3' }),
        staleTime: 5 * 60 * 1000,
        enabled: (featuredProjectsRes?.data ?? []).length === 0,
    })

    // Use featured items if available, otherwise fall back to all items
    const services = ((featuredServicesRes?.data ?? []).length > 0
        ? featuredServicesRes?.data
        : allServicesRes?.data ?? []) as unknown as ServiceItem[]
    const projects = ((featuredProjectsRes?.data ?? []).length > 0
        ? featuredProjectsRes?.data
        : allProjectsRes?.data ?? []) as unknown as ProjectItem[]

    return (
        <>
            <title>Lab Kurulum - Anahtar Teslim Laboratuvar Kurulumu</title>

            {/* ═══ HERO ═══ */}
            <section className="relative bg-blueprint-grid-heavy overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-brand-50/60 via-white/20 to-white pointer-events-none" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-20 lg:pb-36">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7">
                            {/* Technical tag */}
                            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-sm border border-brand-200 bg-brand-50/80">
                                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                                <span className="text-[11px] font-mono font-semibold text-brand-700 uppercase tracking-widest">
                                    Proje Kabul Açık
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-900 leading-[1.1]">
                                Laboratuvar Kurulumunu{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10">Uzman Mühendislere</span>
                                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent-400/30 -z-0" />
                                </span>{' '}
                                Bırakın.
                            </h1>

                            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
                                Tasarımdan kuruluma, ekipman tedariğinden akreditasyona, laboratuvarınızın her aşamasını mühendislik disipliniyle yönetiyoruz.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                                <Link
                                    to="/iletisim"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider transition-all hover:bg-brand-700 hover:shadow-lg dimension-line"
                                >
                                    Proje Başlat
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/projeler"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm border border-slate-300 text-slate-700 text-sm font-semibold transition-all hover:border-brand-300 hover:text-brand-700"
                                >
                                    Referans Projeler
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Stats row */}
                            <div className="mt-14 flex flex-wrap gap-8 sm:gap-12">
                                {[
                                    { value: '250+', label: 'Tamamlanan Proje' },
                                    { value: '30+', label: 'Yıllık Deneyim' },
                                    { value: '98%', label: 'Müşteri Memnuniyeti' },
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 font-mono tracking-tight">{stat.value}</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Banner Image */}
                        <div className="relative hidden lg:block lg:col-span-5 h-full min-h-[400px]">
                            <div className="absolute top-1/2 left-0 w-full aspect-square -translate-y-1/2 flex items-center justify-center">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-brand-100/30 rounded-full blur-3xl -z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-brand-100 rounded-full opacity-50 -z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border border-brand-200/50 rounded-full -z-10" />

                                <img
                                    src="/labkurulum-banner.png"
                                    alt="Lab Kurulum banner"
                                    className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl animate-float"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CAPABILITY CARDS ═══ */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">
                            // Uzmanlık Alanlarımız
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-brand-900 tracking-tight">
                            Mühendislik Odaklı Çözümler
                        </h2>
                        <p className="mt-4 text-slate-500 max-w-xl mx-auto">
                            Her laboratuvar projesi benzersizdir. Sektöre özel ihtiyaçlarınızı analiz eder, uçtan uca çözüm sunarız.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {CAPABILITY_CARDS.map((card) => {
                            const Icon = card.icon
                            return (
                                <div
                                    key={card.code}
                                    className="group relative border border-slate-200 rounded-md p-6 transition-all duration-300 hover:border-brand-300 hover:shadow-sm bg-white"
                                >
                                    {/* Code label */}
                                    <span className="absolute top-4 right-4 text-[10px] font-mono font-semibold text-slate-300 tracking-wider">
                                        {card.code}
                                    </span>

                                    <div className="w-10 h-10 rounded-sm bg-brand-50 border border-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                                        <Icon className="w-5 h-5 text-brand-600" />
                                    </div>

                                    <h3 className="text-base font-bold text-brand-900 mb-2">{card.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ SERVICES (from API) ═══ */}
            {services.length > 0 && (
                <section className="py-20 lg:py-28 bg-slate-50 bg-blueprint-grid">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">
                                    // Hizmet Kataloğu
                                </span>
                                <h2 className="mt-3 text-3xl font-extrabold text-brand-900 tracking-tight">
                                    Hizmetlerimiz
                                </h2>
                            </div>
                            <Link
                                to="/hizmetler"
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                Tümünü Gör <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {services.map((svc) => (
                                <Link
                                    key={svc.id}
                                    to={`/hizmetler/${svc.slug}`}
                                    className="group border border-slate-200 rounded-md bg-white overflow-hidden transition-all duration-300 hover:border-brand-300 hover:shadow-sm"
                                >
                                    {svc.image_url && (
                                        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                            <img
                                                src={getImageUrl(svc.image_url)}
                                                alt={svc.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="text-sm font-bold text-brand-900 group-hover:text-brand-600 transition-colors">
                                            {svc.title}
                                        </h3>
                                        {svc.short_description && (
                                            <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {svc.short_description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="sm:hidden mt-8 text-center">
                            <Link to="/hizmetler" className="text-sm font-semibold text-brand-600">
                                Tüm Hizmetleri Gör →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ PROJECT SHOWCASE ═══ */}
            {projects.length > 0 && (
                <section className="py-20 lg:py-28 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">
                                    // Referans Portföy
                                </span>
                                <h2 className="mt-3 text-3xl font-extrabold text-brand-900 tracking-tight">
                                    Tamamlanan Projeler
                                </h2>
                            </div>
                            <Link
                                to="/projeler"
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                Tüm Projeler <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {projects.map((project, idx) => (
                                <Link
                                    key={project.id}
                                    to={`/projeler/${project.slug}`}
                                    className={`group relative border border-slate-200 rounded-md overflow-hidden bg-white transition-all duration-300 hover:border-brand-300 hover:shadow-sm ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                                >
                                    <div className={`overflow-hidden bg-slate-100 ${idx === 0 ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
                                        {project.cover_image_url ? (
                                            <img
                                                src={getImageUrl(project.cover_image_url)}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blueprint-grid-heavy flex items-center justify-center">
                                                <span className="font-mono text-sm text-brand-300">PRJ-{String(project.id).padStart(3, '0')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            {project.client_name && (
                                                <span className="text-[10px] font-mono font-semibold text-accent-600 uppercase tracking-wider">
                                                    {project.client_name}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-brand-900 group-hover:text-brand-600 transition-colors ${idx === 0 ? 'text-lg' : 'text-sm'}`}>
                                            {project.title}
                                        </h3>
                                        {project.short_description && (
                                            <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {project.short_description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="sm:hidden mt-8 text-center">
                            <Link to="/projeler" className="text-sm font-semibold text-brand-600">
                                Tüm Projeleri Gör →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ CTA BAND ═══ */}
            <section className="py-20 lg:py-28 bg-brand-800 bg-blueprint-grid-heavy relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-brand-900/80 to-brand-800/60 pointer-events-none" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Laboratuvar Projenizi Hayata Geçirelim
                    </h2>
                    <p className="mt-4 text-brand-200 max-w-2xl mx-auto">
                        Fizibilite analizinden akreditasyona, mühendislik ekibimiz projenizin her adımında yanınızda.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/iletisim"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-sm bg-accent-500 text-brand-900 text-sm font-bold uppercase tracking-wider transition-all hover:bg-accent-400 hover:shadow-lg dimension-line"
                        >
                            Ücretsiz Fizibilite Talebi
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="tel:+902121234567"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-sm border border-brand-500 text-white text-sm font-semibold transition-all hover:bg-brand-700"
                        >
                            +90 (212) 123 45 67
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
