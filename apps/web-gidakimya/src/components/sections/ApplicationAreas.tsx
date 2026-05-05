
const APPLICATIONS = [
    {
        id: 1,
        title: 'Hammadde Kabul ve Tedarik',
        desc: 'Fabrikaya giren ham ürünlerin kalite ve kontaminasyon değerlerini kapıda doğrulayan sistemler.',
        image: '/images/app-1.png',
        imgStyle: 'w-36 h-36 -top-14 -right-8',
    },
    {
        id: 2,
        title: 'Gıda Güvenliği ve Regülasyon',
        desc: 'Tarladan paketlemeye uluslararası standartlara (BRC, IFS) uygun mikrobiyolojik doğrulama.',
        image: '/images/app-2.png',
        imgStyle: 'w-32 h-32 -top-12 -right-6',
    },
    {
        id: 3,
        title: 'Ar-Ge ve Ür-Ge Laboratuvarları',
        desc: 'Yeni ürün geliştirme ve formülasyon için yüksek hassasiyetli moleküler analiz sistemleri.',
        image: '/images/app-3.png',
        imgStyle: 'w-44 h-44 -top-18 -right-10',
    },
    {
        id: 4,
        title: 'Kalite Kontrol ve Üretim',
        desc: 'Üretimi durdurmadan anlık proses kontrolü sağlayan hızlı endüstriyel donanımlar.',
        image: '/images/app-4.png',
        imgStyle: 'w-40 h-40 -top-14 -right-8',
    },
    {
        id: 5,
        title: 'Raf Ömrü ve Ambalaj Testleri',
        desc: 'Ürünlerin dayanıklılık, oksidasyon ve ambalaj içi gaz ölçümleri için ileri donanımlar.',
        image: '/images/app-5.png',
        imgStyle: 'w-36 h-36 -top-12 -right-8',
    },
    {
        id: 6,
        title: 'Çevre, Su ve Hijyen Kontrolü',
        desc: 'Atık su analizlerinden yüzey hijyenine kadar çevresel regülasyonları karşılayan ölçüm altyapısı.',
        image: '/images/app-6.png',
        imgStyle: 'w-44 h-44 -top-16 -right-12',
    },
]

export default function ApplicationAreas() {
    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-20 lg:mb-28">
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-azure-50/80 border border-azure-100 text-[11px] font-extrabold text-azure-600 uppercase tracking-[0.2em] mb-6">
                        Endüstri Standartları
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-[-0.03em] leading-tight">
                        Sektörel Uygulama <span className="text-azure-600">Alanları</span>
                    </h2>
                    <p className="mt-5 text-[15px] text-slate-500 leading-relaxed">
                        Üretim hattının her aşamasında kaliteyi garanti altına alan spesifik analiz çözümleri.
                    </p>
                </div>

                {/* 3x2 Floating Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
                    {APPLICATIONS.map((item) => (
                        <div
                            key={item.id}
                            className="relative group rounded-2xl bg-white/70 border border-slate-100 hover:border-azure-200 transition-all duration-300 p-8 pt-12 shadow-sm hover:shadow-md overflow-visible"
                        >
                            {/* 3D floating image — kart dışına taşıyor */}
                            <div className={`absolute z-20 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100 ${item.imgStyle}`}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    draggable="false"
                                />
                            </div>

                            {/* Subtle line on hover */}
                            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-azure-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Ghost number */}
                            <div className="absolute -left-2 -top-4 text-[72px] font-black text-slate-900/[0.035] select-none pointer-events-none group-hover:text-azure-900/[0.05] transition-colors duration-500">
                                0{item.id}
                            </div>

                            {/* Content */}
                            <div className="relative z-10 pt-4">
                                <h3 className="text-[16px] font-bold text-slate-800 mb-2.5 group-hover:text-azure-700 transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="text-[13.5px] text-slate-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
