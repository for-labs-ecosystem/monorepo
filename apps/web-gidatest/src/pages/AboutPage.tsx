import { Sprout, Target, Heart, Users } from 'lucide-react'

const VALUES = [
    { Icon: Target, title: 'Hassasiyet', text: 'Her ölçüm, her raporlamada bilimsel kesinlik ve tekrarlanabilirlik.' },
    { Icon: Heart, title: 'Şeffaflık', text: 'Akredite süreçler, açık metodoloji ve izlenebilir sonuçlar.' },
    { Icon: Users, title: 'Müşteri Ortaklığı', text: 'Tek seferlik satış değil, uzun vadeli teknik iş birliği.' },
    { Icon: Sprout, title: 'Sürdürülebilirlik', text: 'Tarladan sofraya sürdürülebilir gıda güvenliği vizyonu.' },
]

export default function AboutPage() {
    return (
        <div className="py-16 lg:py-24">
            <title>Hakkımızda — GıdaTest</title>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
                <div className="max-w-3xl mb-14">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-px bg-sage-400" />
                        <span className="label-eyebrow">Kurumsal</span>
                    </div>
                    <h1 className="heading-serif text-4xl lg:text-6xl mb-6 leading-tight">
                        Gıda güvenliği için<br />
                        <span className="italic text-sage-600">bilim odaklı bir ortak.</span>
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        GıdaTest, For-Labs Ekosistemi'nin akredite analiz koludur. Gıda endüstrisi, tarım laboratuvarları ve kamu kurumları için hassas cihazlar, hızlı test kitleri ve ISO 17025 akreditasyonlu analiz hizmetleri sunar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {VALUES.map((v, i) => (
                        <div key={v.title} className={`${i % 2 === 0 ? 'card-organic' : 'card-organic-alt'} p-8`}>
                            <div className="w-12 h-12 mb-5 bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center"
                                 style={{ borderTopLeftRadius: '0.9rem', borderBottomRightRadius: '0.9rem' }}>
                                <v.Icon className="w-5 h-5 text-sage-700" />
                            </div>
                            <h3 className="heading-serif text-xl text-forest-900 mb-2">{v.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{v.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
