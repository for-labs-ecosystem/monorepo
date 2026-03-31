import { ArrowUpRight } from 'lucide-react'

const NETWORK_BRANDS = [
  { name: 'For-Labs Ekosistemi', href: 'https://for-labs.com' },
  { name: 'AtagoTR', href: 'https://atagotr.com' },
  { name: 'GıdaTest', href: 'https://gidatest.com' },
  { name: 'LabKurulum', href: 'https://labkurulum.com', current: true },
  { name: 'GıdaKimya', href: 'https://gidakimya.com' },
  { name: 'Alerjen', href: 'https://alerjen.com' },
  { name: 'HijyenKontrol', href: 'https://hijyenkontrol.com' },
]

export function NetworkBar() {
  return (
    <div className="bg-brand-900 text-white border-b border-white/5 relative z-40">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px]">
        
        {/* Left: Brand Links as mini buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {NETWORK_BRANDS.map((brand) => (
            <a 
              key={brand.name}
              href={brand.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center justify-center px-2.5 py-1 rounded-[4px] font-semibold transition-all duration-200 shrink-0 ${
                brand.current 
                  ? 'bg-brand-500/20 text-brand-300 ring-1 ring-inset ring-brand-500/30' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {brand.name}
            </a>
          ))}
        </div>

        {/* Right: Tools */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://for-labs.com/giris-yap"
            className="flex items-center gap-1 text-slate-300 font-bold transition-all duration-200 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded-[4px]"
          >
            Müşteri Girişi
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
