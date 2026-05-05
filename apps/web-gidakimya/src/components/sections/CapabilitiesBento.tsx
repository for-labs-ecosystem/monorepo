import { Microscope, Truck, HeadphonesIcon, Award, Layers, RefreshCw } from 'lucide-react'

const CAPABILITIES = [
    { icon: Microscope, title: 'Uzman Teknik Danışmanlık', desc: 'Gıda mühendisleri ve kimyagerlerden oluşan ekibimiz, prosesinize en uygun analitik çözümü belirler.', stat: '25+', statLabel: 'YIL' },
    { icon: Layers, title: 'Çoklu Marka Portföyü', desc: 'Tek bir tedarikçiden dünya genelindeki referans analiz cihazı üreticilerine erişim.', stat: '50+', statLabel: 'MARKA' },
    { icon: Award, title: 'Akredite Standartlar', desc: 'ISO 17025, IEC ve gıda güvenliği standartlarına uygun, izlenebilir kalibrasyon desteği.', stat: 'ISO', statLabel: '17025' },
    { icon: Truck, title: 'Hızlı Lojistik', desc: 'Güçlü stok altyapısı ile kısa teslimat süreleri. Üretim hattınız aksatmaz.', stat: '48', statLabel: 'SAAT' },
    { icon: HeadphonesIcon, title: 'Satış Sonrası Destek', desc: 'Kurulum, eğitim, bakım ve kalibrasyon hizmetleri tek adreste.', stat: '7/24', statLabel: 'DESTEK' },
    { icon: RefreshCw, title: 'Garanti & Yedek Parça', desc: 'Fabrika garantisi, hızlı yedek parça temini ve uzaktan teknik destek.', stat: '2', statLabel: 'YIL GARANTİ' },
]

export default function CapabilitiesBento() {
    return (
        <section className="py-20 lg:py-28 relative">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] font-bold text-azure-500 uppercase tracking-[0.2em]">Neden Biz</span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.02em]">
                        Gıda Sektörünün Güvendiği Partner
                    </h2>
                    <p className="mt-5 text-slate-400 leading-relaxed">
                        Hammadde kabulünden son ürün sevkiyatına kadar tüm kritik kontrol noktalarında yanınızdayız.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {CAPABILITIES.map((cap, i) => {
                        const Icon = cap.icon
                        return (
                            <div
                                key={cap.title}
                                className="group bento-card p-8 flex flex-col justify-between relative overflow-hidden"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                {/* Stat badge — sağ üst köşe */}
                                <div className="absolute top-6 right-6 text-right">
                                    <p className="text-2xl font-extrabold text-azure-500/30 leading-none group-hover:text-azure-500/50 transition-colors duration-500">{cap.stat}</p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-0.5 group-hover:text-slate-400 transition-colors duration-500">{cap.statLabel}</p>
                                </div>

                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-azure-50 to-azure-100/50 flex items-center justify-center text-azure-500 mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-azure-500/10 transition-all duration-500">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-slate-800 mb-2.5 group-hover:text-azure-700 transition-colors duration-300">
                                        {cap.title}
                                    </h3>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">
                                        {cap.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
