import { useState, useRef, useEffect } from 'react'
import { LayoutGrid, ChevronDown, ArrowUpRight, MessageCircle } from 'lucide-react'

const NETWORK_BRANDS: { name: string; href: string; color: string; desc: string }[] = [
    { name: 'For-Labs', href: 'https://for-labs.com', color: '#0055FF', desc: 'Ekosistem ana merkezi — laboratuvar çözümleri platformu' },
    { name: 'Atago TR', href: 'https://atagotr.com', color: '#0052CC', desc: 'Dijital refraktometre ve laboratuvar ölçüm cihazları' },
    { name: 'GıdaTest', href: 'https://gidatest.com', color: '#16a34a', desc: 'Gıda analiz ve test laboratuvarı hizmetleri' },
    { name: 'LabKurulum', href: 'https://labkurulum.com', color: '#475569', desc: 'Laboratuvar kurulum, tasarım ve danışmanlık' },
    { name: 'GıdaKimya', href: 'https://gidakimya.com', color: '#9333ea', desc: 'Gıda kimyasalları ve reaktif tedariki' },
    { name: 'HijyenKontrol', href: 'https://hijyenkontrol.com', color: '#0891b2', desc: 'Hijyen denetimi ve sanitasyon ürünleri' },
]

export function NetworkBar() {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative z-[60] border-b border-ocean-100/30 bg-white/40 backdrop-blur-md text-slate-500" ref={menuRef}>
            <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-6 lg:px-10">

                {/* Ecosystem Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-300 ${isOpen ? 'bg-ocean-50/60' : 'hover:bg-ocean-50/40'}`}
                >
                    <LayoutGrid className={`h-3 w-3 transition-colors duration-300 ${isOpen ? 'text-ocean-500' : 'text-slate-300 group-hover:text-ocean-400'}`} />
                    <span className={`text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors duration-300 ${isOpen ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
                        Ecosystem For-Labs
                    </span>
                    <ChevronDown className={`h-2.5 w-2.5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* WhatsApp CTA */}
                <a
                    href="https://wa.me/905320000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 rounded-full bg-green-50/50 border border-green-100/50 px-3 py-1 text-[10px] font-medium text-green-600 hover:bg-green-50 transition-all duration-300"
                >
                    <MessageCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">WhatsApp'tan Yazın</span>
                </a>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full border-b border-ocean-100/30 bg-white/80 backdrop-blur-xl shadow-lg shadow-ocean-100/20 z-50">
                    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">For-Labs Ekosistemi</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {NETWORK_BRANDS.map((brand) => (
                                <a
                                    key={brand.name}
                                    href={brand.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col gap-2 rounded-2xl border border-ocean-100/40 bg-white/60 backdrop-blur-md p-4 hover:bg-white hover:shadow-lg hover:border-ocean-200/50 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold" style={{ color: brand.color }}>{brand.name}</span>
                                        <ArrowUpRight className="h-3 w-3 text-slate-200 group-hover:text-slate-400 transition-colors duration-300" />
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-2">{brand.desc}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
