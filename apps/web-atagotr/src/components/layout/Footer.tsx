import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link to="/" className="group inline-flex items-center mb-6">
                            <div className="relative flex items-center bg-slate-800/50 border border-slate-700/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)] rounded-xl px-4 py-2 transition-all duration-400 ease-out hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.3)] hover:border-slate-600/50 hover:-translate-y-0.5 hover:bg-slate-800/80 overflow-hidden">
                                {/* Sweep animation */}
                                <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover:translate-x-[50%]" />
                                
                                <span className="relative flex items-baseline">
                                    <span
                                        className="font-black text-[1.4rem] sm:text-[1.55rem] leading-none tracking-[-0.05em] text-white"
                                        style={{ fontFamily: 'Arial Black, Inter, sans-serif' }}
                                    >
                                        ATAGO
                                    </span>
                                    <span 
                                        className="font-extrabold text-[1.4rem] sm:text-[1.55rem] leading-none tracking-tight text-transparent bg-clip-text bg-linear-to-br from-slate-200 to-slate-400"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        TR
                                    </span>
                                    {/* Accent dot */}
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 ml-1 mb-0.5 shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-transform duration-300 group-hover:scale-125" />
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed pr-4">
                            Japonya'nın lider refraktometre üreticisi ATAGO'nun Türkiye yetkili distribütörü <a href="https://www.protekanalitik.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium transition-colors">Protek Analitik</a> tarafından desteklenmektedir.
                        </p>
                        <div className="space-y-3 text-sm">
                            <a href="tel:+902121234567" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                                +90 (212) 123 45 67
                            </a>
                            <a href="mailto:info@atagotr.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                info@atagotr.com
                            </a>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-4 h-4 shrink-0" />
                                İstanbul, Türkiye
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Ürünler</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/urunler" className="text-slate-400 hover:text-white transition-colors">Tüm Ürünler</Link></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Refraktometreler</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Polarimetreler</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">pH Metreler</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Viskozimetreler</a></li>
                        </ul>
                    </div>

                    {/* Hizmetler & Destek */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hizmetler & Destek</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/hizmetler" className="text-slate-400 hover:text-white transition-colors">Tüm Hizmetler</Link></li>
                            <li><Link to="/bilgi-bankasi" className="text-slate-400 hover:text-white transition-colors">Bilgi Bankası</Link></li>
                            <li><Link to="/destek" className="text-slate-400 hover:text-white transition-colors">Yardım & Destek</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Kurumsal</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/hakkimizda" className="text-slate-400 hover:text-white transition-colors">Hakkımızda</Link></li>
                            <li><Link to="/destek" className="text-slate-400 hover:text-white transition-colors">İletişim</Link></li>
                            <li><a href="https://for-labs.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">For-Labs Ekosistemi</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar with trust & payment logos */}
            <div className="border-t border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs text-slate-500 text-center sm:text-left">
                        <p>
                            &copy; {new Date().getFullYear()} Atago TR — For-Labs Ekosistemi. Tüm hakları saklıdır.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/gizlilik-politikasi" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</Link>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <Link to="/kullanim-kosullari" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</Link>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <Link to="/kvkk" className="hover:text-slate-300 transition-colors">KVKK</Link>
                        </div>
                    </div>
                    
                    {/* Payment & Trust Indicators */}
                    <div className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-3">
                            {/* Iyzico Logo Mock */}
                            <div className="bg-white/10 rounded px-2.5 py-1.5 flex items-center justify-center border border-white/5">
                                <span className="text-[10px] font-black text-white tracking-wider">iyzico</span>
                            </div>
                            {/* Visa / Mastercard Icons Mock */}
                            <div className="flex gap-2 bg-white/5 rounded px-3 py-1.5 border border-white/5">
                                <div className="flex -space-x-2">
                                    <div className="w-4 h-4 rounded-full bg-red-500/80 mix-blend-screen" />
                                    <div className="w-4 h-4 rounded-full bg-yellow-500/80 mix-blend-screen" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 italic">VISA</span>
                            </div>
                        </div>
                        {/* 256-bit SSL */}
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-700 pl-6">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            256-bit SSL Güvencesi
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
