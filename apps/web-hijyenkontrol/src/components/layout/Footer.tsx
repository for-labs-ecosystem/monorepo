import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react'
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

const TRUST_BADGES = [
    { label: 'ISO 9001', desc: 'Kalite Yönetimi' },
    { label: 'ISO 22000', desc: 'Gıda Güvenliği' },
    { label: 'HACCP', desc: 'Tehlike Analizi' },
    { label: 'GMP', desc: 'İyi Üretim' },
]

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
        <footer className="relative bg-gradient-to-b from-white via-uv-50/40 to-uv-50/60 overflow-hidden">
            {/* Trust badges strip */}
            <div className="border-t border-uv-100/50">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {TRUST_BADGES.map((b) => (
                            <div
                                key={b.label}
                                className="flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 px-4 py-3"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-uv-50 to-clean-50 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-uv-600" />
                                </div>
                                <div className="leading-tight">
                                    <div className="text-[13px] font-bold text-slate-700">{b.label}</div>
                                    <div className="text-[10.5px] text-slate-400 tracking-wide">{b.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-uv-200/50 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-flex items-center mb-6" aria-label="HijyenKontrol">
                            <img
                                src="/hijyenkontrol-logo.svg"
                                alt="HijyenKontrol"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed pr-4 max-w-xs">
                            Laboratuvarlar ve üretim tesisleri için ATP luminometreler, swab kitleri ve yüzey hijyen test çözümleri. For-Labs Ekosistemi üyesi.
                        </p>
                        <div className="space-y-3.5 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-3 text-slate-500 hover:text-uv-700 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-uv-50/70 flex items-center justify-center">
                                    <Phone className="w-3.5 h-3.5 text-uv-500" />
                                </div>
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@hijyenkontrol.com" className="flex items-center gap-3 text-slate-500 hover:text-uv-700 transition-colors duration-300">
                                <div className="w-8 h-8 rounded-xl bg-uv-50/70 flex items-center justify-center">
                                    <Mail className="w-3.5 h-3.5 text-uv-500" />
                                </div>
                                info@hijyenkontrol.com
                            </a>
                            <div className="flex items-center gap-3 text-slate-500">
                                <div className="w-8 h-8 rounded-xl bg-uv-50/70 flex items-center justify-center">
                                    <MapPin className="w-3.5 h-3.5 text-uv-500" />
                                </div>
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">Çözümler</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/urunler" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">Tüm Ürünler</Link></li>
                            <li><Link to="/urunler" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">ATP Luminometreler</Link></li>
                            <li><Link to="/urunler" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">Yüzey Swab Kitleri</Link></li>
                            <li><Link to="/urunler" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">Hızlı Test Stripleri</Link></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-5">Kaynaklar</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/bilgi-bankasi" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">Bilgi Bankası</Link></li>
                            <li><Link to="/iletisim" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">İletişim</Link></li>
                            {footerItems.map((item) => (
                                <li key={item.id}>
                                    <Link to={item.url} className="text-slate-500 hover:text-uv-700 transition-colors duration-300">
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
                            <li><Link to="/kurumsal" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">Hakkımızda</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-uv-700 transition-colors duration-300">For-Labs Ekosistemi</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-uv-100/40">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                    <p>&copy; {new Date().getFullYear()} HijyenKontrol — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/gizlilik-politikasi" className="hover:text-uv-700 transition-colors duration-300">Gizlilik Politikası</Link>
                        <span className="w-1 h-1 bg-uv-200 rounded-full" />
                        <Link to="/kvkk" className="hover:text-uv-700 transition-colors duration-300">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
