import { Link } from 'react-router-dom'
import { ArrowRight, Microscope, Users, Globe, Award, Target, Lightbulb } from 'lucide-react'

const STATS = [
    { value: '500+', label: 'Analiz Parametresi' },
    { value: '30+', label: 'Yıllık Deneyim' },
    { value: '1.000+', label: 'Mutlu Müşteri' },
    { value: '50+', label: 'Partner Marka' },
]

const VALUES = [
    { icon: Microscope, title: 'Bilimsel Doğruluk', desc: 'Her önerimiz bilimsel verilere ve saha deneyimine dayanır. Doğru cihaz, doğru analiz.' },
    { icon: Target, title: 'Müşteri Odaklılık', desc: 'Prosesinizi anlamadan çözüm önermeyiz. İlk adım hep sizi dinlemektir.' },
    { icon: Lightbulb, title: 'Yenilikçi Yaklaşım', desc: 'Teknolojideki gelişmeleri yakından izler, en güncel çözümleri portföyümüze ekleriz.' },
    { icon: Users, title: 'Uzman Kadro', desc: 'Gıda mühendisi, kimyager ve biyologlardan oluşan multidisipliner teknik ekip.' },
    { icon: Globe, title: 'Global Erişim', desc: 'Dünya genelindeki referans üreticilerle doğrudan iş birliği ve distribütörlük.' },
    { icon: Award, title: 'Kalite Taahhüdü', desc: 'ISO standartlarına uygunluk, akredite kalibrasyon ve garanti koruması.' },
]

export default function AboutPage() {
    return (
        <>
            <title>Hakkımızda — GıdaKimya</title>
            <meta name="description" content="GıdaKimya, gıda sektörüne yönelik kalite kontrol ve analiz cihazları konusunda Türkiye'nin güvenilir partneridir." />

            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-azure-50/40 via-white to-frost-50" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl text-center lg:text-left">
                            <span className="text-[11px] font-semibold text-azure-500 uppercase tracking-[0.2em]">Hakkımızda</span>
                            <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight leading-[1.1]">
                                Gıda Sektörünün{' '}
                                <span className="text-azure-600">Güvenilir Teknoloji Partneri</span>
                            </h1>
                            <p className="mt-6 text-lg text-slate-400 leading-relaxed font-light">
                                GıdaKimya.com, For-Labs Ekosistemi bünyesinde gıda analiz ve kalite kontrol ekipmanları sunan bir dijital platformdur.
                            </p>
                        </div>

                        {/* Hero Image */}
                        <div className="relative w-full max-w-[500px] aspect-square lg:aspect-auto lg:h-[400px] shrink-0 animate-float">
                            <img 
                                src="/images/about-hero-3d.png" 
                                alt="Gıda/Kimya Enterprise Solutions" 
                                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 sm:mt-24">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="bento-card p-8 text-center">
                                <p className="text-3xl font-extrabold text-azure-600 mb-2">{stat.value}</p>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-azure-50/15 to-transparent">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-[11px] font-semibold text-azure-500 uppercase tracking-[0.2em]">Değerlerimiz</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Bizi Farklı Kılan</h2>
                        <p className="mt-4 text-slate-400 leading-relaxed max-w-xl mx-auto">
                            For-Labs ekosisteminin güçlü altyapısıyla yalnızca cihaz tedariki sağlamıyor, laboratuvar süreçlerinize değer katan, sürdürülebilir ve yenilikçi çözümler üretiyoruz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {VALUES.map((val) => {
                            const Icon = val.icon
                            return (
                                <div key={val.title} className="group bento-card p-8 flex flex-col">
                                    <div className="w-12 h-12 rounded-2xl bg-azure-50 flex items-center justify-center text-azure-500 mb-6 group-hover:scale-110 group-hover:bg-azure-100 transition-all duration-300">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-slate-700 mb-2 group-hover:text-azure-600 transition-colors duration-300">{val.title}</h3>
                                    <p className="text-[13px] text-slate-400 leading-relaxed flex-1">{val.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="bento-card-filled p-12 lg:p-16 text-center">
                        <h2 className="text-3xl font-bold text-white mb-5">Birlikte Çalışalım</h2>
                        <p className="text-azure-100/80 max-w-xl mx-auto leading-relaxed font-light mb-10">
                            Laboratuvarınızın veya üretim hattınızın analiz ihtiyaçlarını karşılayacak doğru çözümü birlikte belirleyelim.
                        </p>
                        <Link
                            to="/iletisim"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-azure-700 font-bold text-sm rounded-full hover:bg-azure-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            İletişime Geç <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
