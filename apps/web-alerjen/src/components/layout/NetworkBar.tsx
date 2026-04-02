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
        <div className="relative z-[60] border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-sm text-slate-600" ref={menuRef}>
            <div className="mx-auto flex h-10 max-w-[1400px] items-center justify-between px-6 lg:px-10">

                {/* Ecosystem Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group flex items-center gap-2 rounded-lg px-2 py-1 transition-all ${isOpen ? 'bg-slate-200/70' : 'hover:bg-slate-200/50'}`}
                >
                    <LayoutGrid className={`h-3.5 w-3.5 transition-colors ${isOpen ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-600'}`} />
                    <span className={`text-[11px] font-bold tracking-[0.12em] uppercase transition-colors ${isOpen ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        Ecosystem For-Labs
                    </span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* WhatsApp CTA */}
                <a
                    href="https://wa.me/905320000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-100 transition-colors"
                >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp'tan Yazın</span>
                </a>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white shadow-lg z-50">
                    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">For-Labs Ekosistemi</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {NETWORK_BRANDS.map((brand) => (
                                <a
                                    key={brand.name}
                                    href={brand.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold" style={{ color: brand.color }}>{brand.name}</span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
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
