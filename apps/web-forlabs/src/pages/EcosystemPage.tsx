import { useQuery } from '@tanstack/react-query'
import { getSites } from '@/lib/api'
import { useLanguage, localizedField } from '@/lib/i18n'
import { ExternalLink, Globe2 } from 'lucide-react'

export default function EcosystemPage() {
    const { lang } = useLanguage()
    const { data: sitesData, isLoading } = useQuery({
        queryKey: ['sites'],
        queryFn: getSites,
    })

    const sites = (sitesData?.data || []).filter((s: any) => s.slug !== 'admin')

    return (
        <div className="min-h-screen bg-slate-50/30">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
                {/* Split Layout Container */}
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left Side: Sticky Banner Text */}
                    <div className="lg:w-1/3 lg:sticky lg:top-32 self-start">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 mb-6">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-600">
                                {lang === 'tr' ? 'Global Ağımız' : 'Global Network'}
                            </span>
                        </div>

                        <h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight text-slate-900 leading-[1.1]">
                            {lang === 'tr' ? (
                                <>
                                    For-Labs <br />
                                    <span className="text-slate-400">Ekosistemi.</span>
                                </>
                            ) : (
                                <>
                                    For-Labs <br />
                                    <span className="text-slate-400">Ecosystem.</span>
                                </>
                            )}
                        </h1>

                        <p className="mt-8 text-lg text-slate-500 leading-relaxed max-w-sm">
                            {lang === 'tr'
                                ? 'Bilimsel mükemmelliği ve operasyonel netliği birleştiren tüm dijital platformlarımıza tek bir merkezden erişin.'
                                : 'Access all our digital platforms that combine scientific excellence and operational clarity from a single hub.'}
                        </p>

                        <div className="mt-12 hidden lg:flex flex-col gap-8 border-l border-slate-200 pl-8">
                            <div>
                                <span className="block font-serif text-2xl font-medium text-slate-900">{sites.length}+</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {lang === 'tr' ? 'Aktif Platform' : 'Active Platforms'}
                                </span>
                            </div>
                            <div>
                                <span className="block font-serif text-2xl font-medium text-slate-900">50k+</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {lang === 'tr' ? 'Teknolojik Ürün' : 'Tech Products'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Scrollable Website Cards */}
                    <div className="lg:w-2/3 flex flex-col gap-4">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                            ))
                        ) : (
                            sites.map((site: any) => {
                                const themeConfig = JSON.parse(site.theme_config || '{}')
                                const primaryColor = themeConfig.primary_color || '#2563eb'

                                return (
                                    <a
                                        key={site.id}
                                        href={`https://${site.domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center gap-6 rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-300 hover:border-brand-500/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5"
                                    >
                                        {/* Brand Logo / Monogram Container */}
                                        <div className="relative shrink-0 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:border-brand-500/10">
                                            {site.logo_url ? (
                                                <img
                                                    src={site.logo_url}
                                                    alt={site.name}
                                                    className="h-12 w-12 object-contain"
                                                />
                                            ) : (
                                                <div
                                                    className="flex h-12 w-12 items-center justify-center rounded-xl font-serif text-2xl font-bold transition-all duration-500"
                                                    style={{
                                                        backgroundColor: `${primaryColor}10`, // 10% opacity hex
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {site.name.charAt(0)}
                                                </div>
                                            )}

                                            {/* Brand-colored accent bar */}
                                            <div
                                                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full opacity-50 transition-all duration-500 group-hover:w-8 group-hover:opacity-100"
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="font-sans text-lg font-bold text-slate-800 tracking-tight truncate">
                                                    {localizedField(site, 'name', lang)}
                                                </h2>
                                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                <span className="text-xs font-medium text-slate-400 truncate">
                                                    {site.domain}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed">
                                                {localizedField(site, 'description', lang) || (lang === 'tr' ? 'Laboratuvar süreçleriniz için profesyonel çözümler.' : 'Professional solutions for your laboratory processes.')}
                                            </p>
                                        </div>

                                        {/* Action */}
                                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-brand-50 group-hover:text-brand-500">
                                            <ExternalLink size={16} />
                                        </div>

                                        {/* Hover Decoration */}
                                        <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
                                            <Globe2 size={40} strokeWidth={0.5} className="text-brand-500" />
                                        </div>
                                    </a>
                                )
                            })
                        )}

                        {/* Bottom Spacer */}
                        <div className="py-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}
