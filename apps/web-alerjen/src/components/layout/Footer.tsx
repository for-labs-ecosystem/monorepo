import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getNavigations } from '@forlabs/core'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

interface NavItem {
    id: number
    name: string
    url: string
    parent_id: number | null
    location: string
    sort_order: number
}

export default function Footer() {
    const { data: footerNav } = useQuery({
        queryKey: ['navigations', 'footer', SITE_ID],
        queryFn: () => getNavigations({ location: 'footer' }),
        staleTime: 5 * 60 * 1000,
    })

    const footerItems = ((footerNav?.data ?? []) as NavItem[])
        .filter((n) => n.location === 'footer' && !n.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order)

    return (
        <footer className="relative bg-gradient-to-b from-white via-ocean-50/30 to-ocean-50/50 overflow-hidden">
            {/* Soft top divider — a whisper of color */}
            <div className="h-px bg-gradient-to-r from-transparent via-ocean-200/40 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

                    {/* Brand */}
                    <div>
                        <Link to="/" className="group inline-flex items-center gap-3 mb-8">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 shadow-lg shadow-ocean-500/10">
                                <span className="text-sm font-bold text-white">A</span>
                            </div>
                            <span className="text-lg font-bold text-slate-600 tracking-tight">Alerjen</span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed pr-4 max-w-xs">
                            Gıda güvenliği ve alerjen hızlı test kitleri konusunda Türkiye'nin güvenilir tedarikçisi. For-Labs Ekosistemi üyesidir.
                        </p>
                        <div className="space-y-3.5 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-3 text-slate-400 hover:text-ocean-600 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-ocean-50/60 flex items-center justify-center">
                                    <Phone className="w-3.5 h-3.5 text-ocean-400" />
                                </div>
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@alerjen.net" className="flex items-center gap-3 text-slate-400 hover:text-ocean-600 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-ocean-50/60 flex items-center justify-center">
                                    <Mail className="w-3.5 h-3.5 text-ocean-400" />
                                </div>
                                info@alerjen.net
                            </a>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-xl bg-ocean-50/60 flex items-center justify-center">
                                    <MapPin className="w-3.5 h-3.5 text-ocean-400" />
                                </div>
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">Ürünler</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/urunler" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Tüm Test Kitleri</Link></li>
                            <li><a href="#" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Alerjen Test Kitleri</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Glüten Test Kitleri</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Mikotoksin Test Kitleri</a></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">Kaynaklar</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/arastirmalar" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Araştırmalar & Makaleler</Link></li>
                            <li><Link to="/iletisim" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">İletişim</Link></li>
                            {footerItems.map((item) => (
                                <li key={item.id}>
                                    <Link to={item.url} className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">Kurumsal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/kurumsal" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">Hakkımızda</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-ocean-600 transition-colors duration-300">For-Labs Ekosistemi</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar — whisper-light */}
            <div className="border-t border-ocean-100/30">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Alerjen — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/gizlilik-politikasi" className="hover:text-ocean-600 transition-colors duration-300">Gizlilik Politikası</Link>
                        <span className="w-1 h-1 bg-ocean-200 rounded-full" />
                        <Link to="/kvkk" className="hover:text-ocean-600 transition-colors duration-300">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
