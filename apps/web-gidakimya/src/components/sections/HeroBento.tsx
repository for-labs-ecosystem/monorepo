import { Link } from 'react-router-dom'
import { ArrowUpRight, FlaskConical, Droplets, Thermometer, Eye, Microscope, Waves } from 'lucide-react'

/* ─── Alt satırdaki cihaz kategori kartları ─── */
const CATEGORY_CARDS = [
    {
        icon: Droplets,
        title: 'Nem & Rutubet Analizi',
        desc: 'Terazi, halojensız ve NIR tabanlı hassas nem tayin cihazları',
        stat: '±0.01%',
        statLabel: 'Hassasiyet',
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-500',
    },
    {
        icon: Eye,
        title: 'Refraktometre & Brix',
        desc: 'Dijital ve masa tipi refraktometreler — şeker, konsantrasyon ölçümü',
        stat: '0–95°',
        statLabel: 'Brix aralığı',
        iconBg: 'bg-azure-50',
        iconColor: 'text-azure-500',
    },
    {
        icon: Waves,
        title: 'Viskozite & Tekstür',
        desc: 'Rotasyonel viskozimetreler, tekstür analizörleri ve reometreler',
        stat: '1–10⁸',
        statLabel: 'mPa·s',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-500',
    },
    {
        icon: Thermometer,
        title: 'pH & Asidite',
        desc: 'Masa üstü ve portatif pH metreler, titrasyon sistemleri',
        stat: '0–14',
        statLabel: 'pH aralığı',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
    },
]

export default function HeroBento() {
    return (
        <section className="relative overflow-hidden pt-6 pb-6 lg:pt-10 lg:pb-10">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">

                {/* ─── ROW 1: Ana hero + sağ sütun (asimetrik 7+5) ─── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 mb-4 lg:mb-5">

                    {/* ▓▓▓ ANA HERO KART — 7 sütun ▓▓▓ */}
                    <div className="md:col-span-7 bento-card relative overflow-hidden min-h-[420px] lg:min-h-[480px] flex flex-col p-8 lg:p-12 group">
                        {/* Soft inner gradient — kartın kendi atmosferi */}
                        <div className="absolute inset-0 bg-gradient-to-br from-azure-50/30 via-transparent to-sky-50/20 pointer-events-none" />

                        {/* 3D Hücre görseli — şeffaf arkaplan, sağ tarafta floating */}
                        <div className="absolute -right-4 top-1/2 -translate-y-[55%] w-[260px] h-[260px] lg:w-[360px] lg:h-[360px] hero-3d-float pointer-events-none select-none z-[1]">
                            <img
                                src="/images/hero-cell.png"
                                alt="Moleküler analiz — hücre yapısı"
                                className="w-full h-full object-contain"
                                draggable="false"
                            />
                        </div>

                        {/* İçerik */}
                        <div className="relative z-10 flex flex-col justify-between flex-1 max-w-sm lg:max-w-md">
                            <div>
                                <div className="inline-flex items-center gap-2 mb-8">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-azure-500/10 text-[10px] font-bold text-azure-600 uppercase tracking-[0.15em]">
                                        <FlaskConical className="w-3 h-3" />
                                        For-Labs Ekosistemi
                                    </span>
                                </div>

                                <h1 className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-slate-900">
                                    İleri Teknoloji
                                    <br />
                                    <span className="text-azure-600">Gıda ve Kimya</span>
                                    <br />
                                    Analiz Cihazları
                                </h1>

                                <p className="mt-5 text-[15px] lg:text-[16px] text-slate-400 leading-relaxed max-w-xs lg:max-w-sm">
                                    Üretim süreçlerinizi güvence altına alan, uluslararası regülasyonlara tam uyumlu endüstriyel laboratuvar sistemleri.
                                </p>
                            </div>

                            {/* Alt CTA alanı */}
                            <div className="mt-auto flex items-center gap-3 pt-6">
                                <Link
                                    to="/urunler"
                                    className="btn-azure !rounded-full !px-7 !py-3.5 !text-[13px]"
                                >
                                    Ürünleri Keşfet <ArrowUpRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/iletisim"
                                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-slate-200/60 text-[13px] font-semibold text-slate-500 hover:border-azure-200 hover:text-azure-600 hover:bg-azure-50/30 transition-all duration-300"
                                >
                                    Teklif İste
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ▓▓▓ SAĞ SÜTUN — 5 sütun, 2 kart dikey ▓▓▓ */}
                    <div className="md:col-span-5 flex flex-col gap-4 lg:gap-5">

                        {/* Üst kart — Analiz cihazı görseli + güven mesajı */}
                        <div className="bento-card relative overflow-hidden p-7 lg:p-8 flex-1 group">
                            {/* Lab analiz cihazı görseli — sağ tarafta */}
                            <div className="absolute -right-4 -bottom-2 w-[180px] h-[200px] lg:w-[220px] lg:h-[240px] hero-3d-float-delayed pointer-events-none select-none z-0">
                                <img
                                    src="/images/lab-equipment.png"
                                    alt="Gıda analiz cihazı"
                                    className="w-full h-full object-contain"
                                    draggable="false"
                                />
                            </div>
                            <div className="relative z-10 max-w-[55%]">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em] mb-4">
                                    <Microscope className="w-2.5 h-2.5" /> 50+ Marka
                                </span>
                                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 leading-snug">
                                    <span className="text-azure-600">Premium</span> Marka Ağı
                                </h2>
                                <p className="mt-3 text-[13px] text-slate-400 leading-relaxed">
                                    Dünyanın önde gelen üreticilerinden referans kalitede ölçüm cihazları.
                                </p>
                            </div>
                        </div>

                        {/* Alt kart — DNA helix + metrik */}
                        <div className="bento-card relative overflow-hidden p-7 lg:p-8 flex-1 group">
                            {/* DNA Helix floating — kartın sağını tamamen kaplar */}
                            <div className="absolute right-0 top-0 bottom-0 w-[130px] lg:w-[155px] hero-3d-float-slow pointer-events-none select-none z-0 flex items-center justify-end overflow-hidden">
                                <img
                                    src="/images/dna-helix.png"
                                    alt="DNA sarmalı"
                                    className="h-[105%] w-auto object-contain rotate-[6deg] translate-x-4 scale-110"
                                    draggable="false"
                                />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Ölçüm Kapasitesi</p>
                                <p className="text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-[-0.04em]">500<span className="text-azure-500">+</span></p>
                                <p className="mt-3 text-[13px] text-slate-400 leading-relaxed max-w-[70%]">
                                    Yüzlerce farklı kalite kontrol parametresini yüksek hassasiyetle ölçebilen donanım ve laboratuvar sistemleri.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── ROW 2: Analiz cihazı kategori kartları (4'lü grid) ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                    {CATEGORY_CARDS.map((cat, i) => {
                        const Icon = cat.icon
                        return (
                            <Link
                                key={cat.title}
                                to="/urunler"
                                className="group bento-card p-6 lg:p-7 flex flex-col justify-between min-h-[170px] relative overflow-hidden"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Stat watermark — sağ üst */}
                                <div className="absolute top-5 right-5 text-right">
                                    <p className="text-[15px] font-extrabold text-azure-500/20 leading-none group-hover:text-azure-500/35 transition-colors duration-500">{cat.stat}</p>
                                    <p className="text-[7px] font-bold text-slate-300/60 uppercase tracking-[0.15em] mt-0.5">{cat.statLabel}</p>
                                </div>

                                <div className={`w-11 h-11 rounded-xl ${cat.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-azure-500/8 transition-all duration-500`}>
                                    <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-bold text-slate-800 mb-1.5 group-hover:text-azure-600 transition-colors duration-300">{cat.title}</h3>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">{cat.desc}</p>
                                </div>

                                {/* Hover arrow */}
                                <div className="absolute bottom-5 right-5 w-7 h-7 rounded-lg bg-azure-50/0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-azure-50/80 transition-all duration-300">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-azure-500" />
                                </div>
                            </Link>
                        )
                    })}
                </div>


            </div>
        </section>
    )
}
