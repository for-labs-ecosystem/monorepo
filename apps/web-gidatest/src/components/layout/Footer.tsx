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
    { label: 'TÜRKAK', desc: 'Akreditasyon' },
    { label: 'ISO 17025', desc: 'Lab. Yetkinliği' },
    { label: 'ISO 22000', desc: 'Gıda Güvenliği' },
    { label: 'HACCP', desc: 'Tehlike Analizi' },
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
        <footer className="relative bg-gradient-to-b from-oat-100 to-oat-200 overflow-hidden border-t border-stone-200">
            {/* Trust badges strip */}
            <div className="border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {TRUST_BADGES.map((b) => (
                            <div
                                key={b.label}
                                className="group flex items-center gap-4 bg-white/40 backdrop-blur-sm border border-stone-200/60 px-5 py-4 transition-all duration-500 ease-out hover:bg-white hover:shadow-[0_20px_50px_-20px_rgba(26,51,32,0.12)] hover:border-sage-200/80 hover:-translate-y-1"
                                style={{ borderTopLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                            >
                                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sage-100 to-sage-200/50 opacity-80 group-hover:scale-110 transition-transform duration-500" 
                                         style={{ borderTopLeftRadius: '0.85rem', borderBottomRightRadius: '0.85rem' }} />
                                    <ShieldCheck className="relative w-5 h-5 text-sage-700 transition-colors duration-500 group-hover:text-forest-900" />
                                </div>
                                <div className="leading-tight">
                                    <div className="text-[14px] font-bold text-forest-900 heading-serif tracking-tight">{b.label}</div>
                                    <div className="text-[11px] text-stone-500 font-medium tracking-wide mt-0.5">{b.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Brand */}
                    <div>
                        {/* Official SVG Logo */}
                        <Link to="/" className="group inline-flex items-center mb-8 outline-none" aria-label="GıdaTest">
                            <img 
                                src="/images/gidatest-logo.svg" 
                                alt="GıdaTest" 
                                className="h-11 w-auto transition-transform duration-300 group-hover:scale-[1.05]" 
                            />
                        </Link>
                        <p className="text-sm text-stone-600 mb-8 leading-relaxed pr-4 max-w-xs">
                            Gıda endüstrisi ve tarım laboratuvarları için profesyonel analiz cihazları, test kitleri ve akredite analiz hizmetleri. For-Labs Ekosistemi üyesi.
                        </p>
                        <div className="space-y-3 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-3 text-stone-600 hover:text-forest-900 transition-colors duration-300">
                                <div className="w-8 h-8 bg-sage-100 flex items-center justify-center"
                                     style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                    <Phone className="w-3.5 h-3.5 text-sage-700" />
                                </div>
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@gidatest.com" className="flex items-center gap-3 text-stone-600 hover:text-forest-900 transition-colors duration-300">
                                <div className="w-8 h-8 bg-sage-100 flex items-center justify-center"
                                     style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                    <Mail className="w-3.5 h-3.5 text-sage-700" />
                                </div>
                                info@gidatest.com
                            </a>
                            <div className="flex items-center gap-3 text-stone-600">
                                <div className="w-8 h-8 bg-sage-100 flex items-center justify-center"
                                     style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}>
                                    <MapPin className="w-3.5 h-3.5 text-sage-700" />
                                </div>
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Çözümler */}
                    <div>
                        <h3 className="label-eyebrow mb-5">Çözümler</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/urunler" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Tüm Ürünler</Link></li>
                            <li><Link to="/urunler" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Refraktometreler</Link></li>
                            <li><Link to="/urunler" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">pH-metre & İletkenlik</Link></li>
                            <li><Link to="/urunler" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Mikotoksin Test Kitleri</Link></li>
                            <li><Link to="/hizmetler" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Akredite Analiz</Link></li>
                        </ul>
                    </div>

                    {/* Kaynaklar */}
                    <div>
                        <h3 className="label-eyebrow mb-5">Kaynaklar</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/bilgi-bankasi" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Bilgi Bankası</Link></li>
                            <li><Link to="/iletisim" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">İletişim</Link></li>
                            {footerItems.map((item) => (
                                <li key={item.id}>
                                    <Link to={item.url} className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h3 className="label-eyebrow mb-5">Kurumsal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/kurumsal" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Hakkımızda</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">For-Labs Ekosistemi</a></li>
                            <li><a href="https://hijyenkontrol.com" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Hijyen Kontrol</a></li>
                            <li><a href="https://labkurulum.com" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-forest-900 hover:underline underline-offset-4 decoration-harvest-400 transition-colors duration-300">Lab Kurulum</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
                    <p>&copy; {new Date().getFullYear()} GıdaTest — For-Labs Ekosistemi. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/gizlilik-politikasi" className="hover:text-forest-900 transition-colors duration-300">Gizlilik Politikası</Link>
                        <span className="w-1 h-1 bg-sage-300 rounded-full" />
                        <Link to="/kvkk" className="hover:text-forest-900 transition-colors duration-300">KVKK</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
