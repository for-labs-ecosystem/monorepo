import { useState, useRef, useEffect } from 'react'
import { LayoutGrid, ChevronDown, ExternalLink, ArrowUpRight } from 'lucide-react'

const NETWORK_BRANDS: { name: string; href: string; color: string; desc: string }[] = [
    { name: 'For-Labs', href: 'https://for-labs.com', color: '#0055FF', desc: 'Ekosistem ana merkezi — laboratuvar çözümleri platformu' },
    { name: 'Atago TR', href: 'https://atagotr.com', color: '#2563eb', desc: 'Atago refraktometre ve polarimetre Türkiye tek yetkilisi' },
    { name: 'Lab Kurulum', href: 'https://labkurulum.com', color: '#475569', desc: 'Laboratuvar kurulum, tasarım ve danışmanlık' },
    { name: 'Gıda Kimya', href: 'https://gidakimya.com', color: '#9333ea', desc: 'Gıda kimyasalları ve reaktif tedariki' },
    { name: 'Alerjen', href: 'https://alerjen.com', color: '#ea580c', desc: 'Alerjen analiz kitleri ve test sistemleri' },
    { name: 'Hijyen Kontrol', href: 'https://hijyenkontrol.com', color: '#0891b2', desc: 'Hijyen denetimi ve sanitasyon ürünleri' },
]

export default function NetworkBar() {
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
        <div className="relative z-[60] bg-oat-50 text-stone-600" ref={menuRef}>
            <div className="mx-auto flex h-11 max-w-7xl items-center justify-between pl-5 pr-3">

                {/* Ecosystem Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group flex items-center gap-2.5 rounded-md px-2 py-1 transition-all ${isOpen ? 'bg-stone-200/70' : 'hover:bg-stone-200/50'}`}
                >
                    <LayoutGrid className={`h-4 w-4 transition-colors ${isOpen ? 'text-forest-600' : 'text-stone-400 group-hover:text-forest-600'}`} />
                    <div className={`relative flex items-center gap-2 font-sans text-xs font-bold tracking-[0.15em] uppercase transition-colors ${isOpen ? 'text-stone-900' : 'text-stone-500 group-hover:text-stone-800'}`}>
                        <span>Ecosystem</span>
                        <div className={`relative flex h-4 w-12 items-center transition-opacity ${isOpen ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                            <img
                                src="/ecosystem/for-labs.svg"
                                alt="For-Labs"
                                className={`absolute h-3.5 w-auto transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'} mix-blend-multiply`}
                            />
                            <img
                                src="/ecosystem/for-labs.svg"
                                alt="For-Labs"
                                className={`absolute h-3.5 w-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} brightness-0`}
                            />
                        </div>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Right: Support / Contact */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://wa.me/905320000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-green-700 transition-colors"
                    >
                        <span className="hidden sm:inline">WhatsApp Destek</span>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-green-500 group-hover:text-green-600 transition-colors" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.888-.656-1.488-1.467-1.662-1.764-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Mega Menu Dropdown */}
            <div
                className={`absolute left-0 w-full z-[60] border-b border-stone-200 bg-white shadow-2xl shadow-stone-200/50 transition-all duration-300 origin-top ${
                    isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }`}
            >
                <div className="mx-auto max-w-7xl p-6 lg:p-8">
                    <div className="mb-5 flex items-end justify-between border-b border-stone-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-stone-900">
                                For-Labs <span className="text-stone-400 font-normal">Ekosistemi</span>
                            </h3>
                            <p className="mt-1 text-sm text-stone-500 max-w-xl">
                                Türkiye'nin lider laboratuvar teknolojileri ağı — 7 uzman platform, tek ekosistem.
                            </p>
                        </div>
                        <a
                            href="https://for-labs.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex group items-center gap-1.5 text-[13px] font-semibold text-forest-600 hover:text-forest-700"
                        >
                            Tümünü Görüntüle
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`
                    }} />

                    <div className="no-scrollbar -mx-2 flex gap-4 overflow-x-auto px-2 pb-6 pt-2 sm:gap-4">
                        {NETWORK_BRANDS.map((brand) => (
                            <a
                                key={brand.name}
                                href={brand.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex min-w-[190px] flex-1 flex-col items-start gap-1 rounded-2xl border border-stone-200/60 bg-white p-4 transition-all duration-300 hover:border-forest-500/20 hover:shadow-[0_8px_24px_rgb(0,0,0,0.04)] hover:-translate-y-1"
                            >
                                <div
                                    className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-[0.04]"
                                    style={{ backgroundColor: brand.color }}
                                />

                                <div className="flex w-full items-center justify-between mb-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 shadow-inner ring-1 ring-stone-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <div
                                            className="h-3 w-3 rounded-full ring-2 ring-white"
                                            style={{ backgroundColor: brand.color }}
                                        />
                                    </div>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-50 text-stone-300 transition-all duration-300 group-hover:bg-forest-50 group-hover:text-forest-500">
                                        <ExternalLink className="h-3 w-3" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[14px] font-bold text-stone-800 tracking-tight transition-colors group-hover:text-stone-900">
                                        {brand.name}
                                    </span>
                                    <span className="text-[11px] font-medium text-stone-500 line-clamp-2 leading-snug">
                                        {brand.desc}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
