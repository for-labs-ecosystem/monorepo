import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getNavigations } from '@forlabs/core'
import { Mail, Phone, MapPin } from 'lucide-react'

interface NavItem {
    id: number
    name: string
    url: string
    location: string
    parent_id: number | null
    sort_order: number
}

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function Footer() {
    const { data: footerNav } = useQuery({
        queryKey: ['navigations', 'footer', SITE_ID],
        queryFn: () => getNavigations({ site_id: SITE_ID, location: 'footer' }),
        staleTime: 5 * 60 * 1000,
    })

    const footerLinks = ((footerNav?.data ?? []) as NavItem[])
        .filter((n) => n.location === 'footer' && !n.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order)

    return (
        <footer className="bg-brand-900 text-slate-300">
            {/* CTA band */}
            <div className="border-b border-brand-700">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Projenizi Birlikte Planlayalım</h3>
                        <p className="text-sm text-brand-300 mt-1">Anahtar teslim laboratuvar çözümleri için ekibimizle iletişime geçin.</p>
                    </div>
                    <Link
                        to="/iletisim"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-sm bg-accent-500 text-brand-900 text-sm font-bold uppercase tracking-wider transition-all hover:bg-accent-400 shrink-0"
                    >
                        Proje Başlat
                    </Link>
                </div>
            </div>

            {/* Main footer grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-sm bg-brand-600 flex items-center justify-center">
                                <span className="text-white font-mono font-bold text-xs leading-none">LK</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-base tracking-tight text-white">LAB</span>
                                <span className="font-extrabold text-base tracking-tight text-brand-400">KURULUM</span>
                            </div>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            For-Labs Ekosistemi'nin anahtar teslim laboratuvar kurulum, tasarım ve proje yönetimi markası.
                        </p>
                        <div className="space-y-2.5 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@labkurulum.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                info@labkurulum.com
                            </a>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-4 h-4 shrink-0" />
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Hizmetler */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Hizmetler</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/hizmetler" className="text-slate-400 hover:text-white transition-colors">Tüm Hizmetler</Link></li>
                            <li><Link to="/urunler" className="text-slate-400 hover:text-white transition-colors">Ekipman Kataloğu</Link></li>
                            <li><Link to="/projeler" className="text-slate-400 hover:text-white transition-colors">Referans Projeler</Link></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Kaynaklar</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/bilgi-bankasi" className="text-slate-400 hover:text-white transition-colors">Bilgi Bankası</Link></li>
                            <li><Link to="/iletisim" className="text-slate-400 hover:text-white transition-colors">İletişim & Teklif</Link></li>
                        </ul>
                        {footerLinks.length > 0 && (
                            <ul className="space-y-2.5 text-sm mt-2.5">
                                {footerLinks.map((link) => (
                                    <li key={link.id}>
                                        <Link to={link.url} className="text-slate-400 hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Ekosistem */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">Ekosistem</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">For-Labs (Ana Portal)</a></li>
                            <li><a href="https://atagotr.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Atago TR</a></li>
                            <li><a href="https://gidakimya.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Gıda Kimya</a></li>
                            <li><a href="https://gidatest.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Gıda Test</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-brand-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Lab Kurulum — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-brand-600 tracking-wider">
                        <span>ISO 17025</span>
                        <span className="w-px h-3 bg-brand-700" />
                        <span>GLP</span>
                        <span className="w-px h-3 bg-brand-700" />
                        <span>GMP</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
