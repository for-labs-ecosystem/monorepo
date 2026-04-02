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
        <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <Link to="/" className="group inline-flex items-center gap-2 mb-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600">
                                <span className="text-sm font-black text-white">A</span>
                            </div>
                            <span className="text-xl font-extrabold text-white tracking-tight">Alerjen</span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed pr-4">
                            Gıda güvenliği ve alerjen hızlı test kitleri konusunda Türkiye'nin güvenilir tedarikçisi. For-Labs Ekosistemi üyesidir.
                        </p>
                        <div className="space-y-3 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@alerjen.net" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                info@alerjen.net
                            </a>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-4 h-4 shrink-0" />
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Ürünler</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/urunler" className="text-slate-400 hover:text-white transition-colors">Tüm Test Kitleri</Link></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Alerjen Test Kitleri</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Glüten Test Kitleri</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Mikotoksin Test Kitleri</a></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kaynaklar</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/arastirmalar" className="text-slate-400 hover:text-white transition-colors">Araştırmalar & Makaleler</Link></li>
                            <li><Link to="/iletisim" className="text-slate-400 hover:text-white transition-colors">İletişim</Link></li>
                            {footerItems.map((item) => (
                                <li key={item.id}>
                                    <Link to={item.url} className="text-slate-400 hover:text-white transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kurumsal</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/kurumsal" className="text-slate-400 hover:text-white transition-colors">Hakkımızda</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">For-Labs Ekosistemi</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Alerjen — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/gizlilik-politikasi" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <Link to="/kvkk" className="hover:text-slate-300 transition-colors">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
