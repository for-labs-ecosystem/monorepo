import { Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck, FlaskConical, Users, Award } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <title>Kurumsal — Alerjen</title>

            {/* Hero */}
            <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-accent-50/30" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-600">Kurumsal</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Hakkımızda
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Alerjen, For-Labs Ekosistemi bünyesinde gıda güvenliği ve alerjen test kitleri konusunda Türkiye'nin güvenilir bilgi portalı ve ürün vitrinidir.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShieldCheck, title: 'Güvenilirlik', desc: 'Uluslararası akreditasyona sahip, ISO uyumlu test kitleri sunuyoruz.' },
                            { icon: FlaskConical, title: 'Bilimsel Yaklaşım', desc: 'Tüm içeriklerimiz akademik kaynaklar ve saha deneyimleriyle desteklenir.' },
                            { icon: Users, title: 'Uzman Destek', desc: 'Gıda mühendisleri ve laboratuvar uzmanlarından oluşan teknik ekip.' },
                            { icon: Award, title: 'Ekosistem Gücü', desc: 'For-Labs bünyesindeki 7 markanın entegre bilgi birikimi ve lojistik ağı.' },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-5">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 lg:py-24 bg-slate-50/70">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-[0.15em]">Misyonumuz</span>
                        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Gıda Güvenliğini Demokratikleştirmek
                        </h2>
                        <p className="mt-6 text-base text-slate-600 leading-relaxed">
                            Gıda üretim tesislerinden küçük işletmelere, restoran zincirlerinden okul mutfaklarına kadar
                            herkesin alerjen risklerini kolayca tespit edebilmesini sağlamak. Hızlı, güvenilir ve erişilebilir
                            test kitleri ile gıda güvenliği standartlarını yükseltmek temel hedefimizdir.
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/iletisim"
                                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 transition-all duration-200"
                            >
                                Bizimle İletişime Geçin
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
