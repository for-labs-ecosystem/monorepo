import { Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck, Leaf, Users, Award, ArrowRight } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <title>Kurumsal — Alerjen</title>

            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 via-white to-peach-50/30" />
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-ocean-200/8 blur-[120px]" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-5">
                        <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-500">Kurumsal</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-600 tracking-tight">
                        Hakkımızda
                    </h1>
                    <p className="mt-5 text-lg text-slate-400 max-w-2xl leading-relaxed font-light">
                        Alerjen, For-Labs Ekosistemi bünyesinde gıda güvenliği ve alerjen test kitleri konusunda Türkiye'nin güvenilir bilgi portalı ve ürün vitrinidir.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                        {[
                            { icon: ShieldCheck, title: 'Güvenilirlik', desc: 'Uluslararası akreditasyona sahip, ISO uyumlu test kitleri sunuyoruz.' },
                            { icon: Leaf, title: 'Bilimsel Yaklaşım', desc: 'Tüm içeriklerimiz akademik kaynaklar ve saha deneyimleriyle desteklenir.' },
                            { icon: Users, title: 'Uzman Destek', desc: 'Gıda mühendisleri ve laboratuvar uzmanlarından oluşan teknik ekip.' },
                            { icon: Award, title: 'Ekosistem Gücü', desc: 'For-Labs bünyesindeki 7 markanın entegre bilgi birikimi ve lojistik ağı.' },
                        ].map((item) => (
                            <div key={item.title} className="pebble-card p-8">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50/50 text-ocean-400 mb-6">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-slate-600 mb-2.5">{item.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-mint-50/30 to-transparent">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-[11px] font-semibold text-ocean-500 uppercase tracking-[0.2em]">Misyonumuz</span>
                        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-600 tracking-tight">
                            Gıda Güvenliğini Demokratikleştirmek
                        </h2>
                        <p className="mt-7 text-base text-slate-400 leading-relaxed font-light">
                            Gıda üretim tesislerinden küçük işletmelere, restoran zincirlerinden okul mutfaklarına kadar
                            herkesin alerjen risklerini kolayca tespit edebilmesini sağlamak. Hızlı, güvenilir ve erişilebilir
                            test kitleri ile gıda güvenliği standartlarını yükseltmek temel hedefimizdir.
                        </p>
                        <div className="mt-10">
                            <Link
                                to="/iletisim"
                                className="btn-warm"
                            >
                                Bizimle İletişime Geçin
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
