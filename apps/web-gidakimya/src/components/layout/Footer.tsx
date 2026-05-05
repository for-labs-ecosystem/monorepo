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
        <footer className="relative z-10 bg-white/60 backdrop-blur-lg border-t border-slate-100/40">
            <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-20 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

                    {/* Brand */}
                    <div>
                        {/* Glassmorphic Logo */}
                        <Link to="/" className="group inline-flex items-center mb-7">
                            <div className="relative flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-slate-50/50 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,1),0_2px_10px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-[inset_0_1px_4px_rgba(255,255,255,1),0_4px_16px_-4px_rgba(0,0,0,0.06)] group-hover:scale-[1.02]">
                                <span className="text-[18px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 drop-shadow-sm">
                                    Gıda
                                </span>
                                <span className="text-[18px] font-medium text-slate-400 drop-shadow-sm">
                                    /
                                </span>
                                <span className="text-[18px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-azure-600 to-sky-400 drop-shadow-sm">
                                    Kimya
                                </span>
                            </div>
                        </Link>
                        <p className="text-[13px] text-slate-400 mb-8 leading-relaxed pr-4 max-w-xs">
                            Hammaddeden son ürüne gıda sektörüne yönelik kalite kontrol ve analiz cihazları. For-Labs Ekosistemi üyesidir.
                        </p>
                        <div className="space-y-3 text-[13px]">
                            <a href="tel:+902121234567" className="flex items-center gap-3 text-slate-400 hover:text-azure-600 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-azure-50/80 flex items-center justify-center">
                                    <Phone className="w-3.5 h-3.5 text-azure-400" />
                                </div>
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@gidakimya.com" className="flex items-center gap-3 text-slate-400 hover:text-azure-600 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-azure-50/80 flex items-center justify-center">
                                    <Mail className="w-3.5 h-3.5 text-azure-400" />
                                </div>
                                info@gidakimya.com
                            </a>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-xl bg-azure-50/80 flex items-center justify-center">
                                    <MapPin className="w-3.5 h-3.5 text-azure-400" />
                                </div>
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">Ürünler</h3>
                        <ul className="space-y-3 text-[13px]">
                            <li><Link to="/urunler" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Tüm Ürünler</Link></li>
                            <li><Link to="/urunler?category=analiz-cihazlari" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Analiz Cihazları</Link></li>
                            <li><Link to="/urunler?category=kalite-kontrol" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Kalite Kontrol</Link></li>
                            <li><Link to="/urunler?category=laboratuvar-ekipmanlari" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Laboratuvar Ekipmanları</Link></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">Kaynaklar</h3>
                        <ul className="space-y-3 text-[13px]">
                            <li><Link to="/bilgi-bankasi" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Bilgi Bankası</Link></li>
                            <li><Link to="/hizmetler" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Hizmetlerimiz</Link></li>
                            <li><Link to="/iletisim" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">İletişim</Link></li>
                            {footerItems.map((item) => (
                                <li key={item.id}>
                                    <Link to={item.url} className="text-slate-400 hover:text-azure-600 transition-colors duration-300">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">Kurumsal</h3>
                        <ul className="space-y-3 text-[13px]">
                            <li><Link to="/hakkimizda" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">Hakkımızda</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-azure-600 transition-colors duration-300">For-Labs Ekosistemi</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-100/40">
                <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                    <p>&copy; {new Date().getFullYear()} GıdaKimya — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/gizlilik-politikasi" className="hover:text-azure-600 transition-colors duration-300">Gizlilik Politikası</Link>
                        <span className="w-1 h-1 bg-azure-200 rounded-full" />
                        <Link to="/kvkk" className="hover:text-azure-600 transition-colors duration-300">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
