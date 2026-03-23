import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/lib/i18n'
import { ArrowRight, Building2, Globe2, ShieldCheck, Beaker } from 'lucide-react'

const data = {
    tr: {
        heroBadge: "KURUMSAL",
        heroTitle: "Akademik Bilginin Endüstriyle Buluştuğu Ekosistem.",
        heroSubtitle: "30 yılı aşkın sektörel tecrübemizle; akademik metotları laboratuvarınızın operasyonel ihtiyaçlarıyla tek bir platformda birleştiriyoruz. Sadece donanım değil, uçtan uca \"Laboratuvar Zekâsı\" sunuyoruz.",
        aboutSectionTitle: "Yepyeni Bir Ekosistem",
        aboutSectionDesc1: "For-Labs, vitrinde modern ve sınırları zorlayan yepyeni bir dijital ekosistem olarak görünse de; temelinde Türkiye laboratuvar sektörüne yön veren 30 yılı aşkın devasa bir mühendislik ve akademik birikim yatmaktadır. Bizler, uluslararası standartlarda bir laboratuvar kurmanın, cihazları sadece yan yana dizmekten ibaret olmadığını binlerce anahtar teslim projeyle tecrübe ettik.",
        aboutSectionDesc2: "Bu derin tecrübeyle For-Labs'i sıradan bir e-ticaret sitesi olarak değil, bir ekosistem olarak inşa ettik. İster gıda kalite kontrol, ister ileri düzey farma Ar-Ge'si olsun; platformumuz sizi sadece cihazlarla baş başa bırakmaz. İhtiyacınız olan donanımı; o cihazın arkasındaki akademik makalelerle, uluslararası uygunluk standartlarıyla (ISO, FDA, GMP) ve uzman eğitim/kalibrasyon hizmetlerimizle kusursuzca eşleştirir.",
        aboutSectionDesc3: "Akademik bilgiyle doğru cihazların eşleştiği bu ekosistemde, bilimsel doğruluğu şansa bırakmıyoruz. Geliştirdiğimiz doğal dil destekli eşleştirme sihirbazı ve güçlü altyapımızla, haftalar süren laboratuvar projelendirme süreçlerini saniyelere indiriyoruz.",
        contactCta: "Bizimle İletişime Geçin",
        stats: [
            { num: "30+", label: "Yıl Sektör Deneyimi" },
            { num: "500+", label: "Kurulan Laboratuvar" },
            { num: "50+", label: "Global Partner" },
        ],
        valuesTitle: "İnandığımız Değerler",
        values: [
            {
                icon: Beaker,
                title: "Bilimsel Yaklaşım",
                desc: "İhtiyaçları analiz ederken, daima kanıta dayalı ve uluslararası standartlara uygun hareket ederiz."
            },
            {
                icon: Globe2,
                title: "Küresel Güç",
                desc: "Dünyanın önde gelen üreticileriyle kurduğumuz network sayesinde, sınırları kaldıran bir tedarik ağı sunarız."
            },
            {
                icon: ShieldCheck,
                title: "Güven ve Kalite",
                desc: "Kuruluş aşamasından satış sonrası desteğe kadar her adımda, şeffaflık ve müşteri memnuniyetini esas alırız."
            },
            {
                icon: Building2,
                title: "Modern Altyapı",
                desc: "Son teknoloji ürünlerle dijital dönüşüm araçlarımızı süreçlerinize hızlı ve kesintisiz entegre ederiz."
            }
        ]
    },
    en: {
        heroBadge: "CORPORATE",
        heroTitle: "The Ecosystem Where Academic Knowledge Meets Industry.",
        heroSubtitle: "With over 30 years of industry experience, we combine academic methods with the operational needs of your laboratory on a single platform. We offer not just hardware, but end-to-end \"Laboratory Intelligence\".",
        aboutSectionTitle: "A Brand New Ecosystem",
        aboutSectionDesc1: "While For-Labs appears as a modern and boundary-pushing brand new digital ecosystem on the surface, its foundation is built on over 30 years of massive engineering and academic accumulation that directs the Turkish laboratory sector. We have experienced through thousands of turnkey projects that building a laboratory at international standards is not just about lining up instruments side by side.",
        aboutSectionDesc2: "With this deep experience, we built For-Labs not as an ordinary e-commerce site, but as an ecosystem. Whether it is food quality control or advanced pharma R&D; our platform does not leave you alone with just instruments. It perfectly matches the hardware you need with the academic articles behind that instrument, international compliance standards (ISO, FDA, GMP), and our expert training/calibration services.",
        aboutSectionDesc3: "In this ecosystem where academic knowledge matches the right instruments, we do not leave scientific accuracy to chance. With the natural language supported matching wizard we developed and our robust infrastructure, we reduce laboratory project planning processes that take weeks to seconds.",
        contactCta: "Get in Touch With Us",
        stats: [
            { num: "30+", label: "Years Experience" },
            { num: "500+", label: "Laboratories Built" },
            { num: "50+", label: "Global Partners" },
        ],
        valuesTitle: "The Values We Believe In",
        values: [
            {
                icon: Beaker,
                title: "Scientific Approach",
                desc: "When analyzing needs, we always act based on evidence and international standards."
            },
            {
                icon: Globe2,
                title: "Global Power",
                desc: "Through our network with leading global manufacturers, we offer a supply chain that eliminates borders."
            },
            {
                icon: ShieldCheck,
                title: "Trust and Quality",
                desc: "From establishment to post-sales support, we base every step on transparency and customer satisfaction."
            },
            {
                icon: Building2,
                title: "Modern Infrastructure",
                desc: "We integrate state-of-the-art products and our digital transformation tools rapidly and seamlessly into your processes."
            }
        ]
    }
}

export default function CorporatePage() {
    const { lang } = useLanguage()
    const content = data[lang]

    useEffect(() => {
        document.title = lang === 'tr' ? 'Kurumsal | For-Labs' : 'Corporate | For-Labs'
        document.querySelector('meta[name="description"]')?.setAttribute(
            'content',
            lang === 'tr'
                ? 'Laboratuvar sektöründe yılların deneyimi, yüksek teknoloji ve güvenilir çözüm merkezi For-Labs.'
                : 'Years of experience, high technology, and a reliable solution center in the laboratory sector: For-Labs.'
        )
    }, [lang])

    return (
        <div className="min-h-screen bg-white">
            {/* Editorial Hero */}
            <section className="relative w-full overflow-hidden bg-white border-b border-slate-100">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-brand-200/20 blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-cyan-200/15 blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-size-[60px_60px]" />

                <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-16 lg:px-8 lg:pt-16 lg:pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="flex flex-col items-start gap-8 max-w-3xl">
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 px-4 py-1.5 bg-white/50 backdrop-blur-sm">
                                <Building2 className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                    {content.heroBadge}
                                </span>
                            </div>

                            <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                                {content.heroTitle}
                            </h1>

                            <p className="max-w-2xl text-base font-light leading-relaxed text-slate-500 sm:text-xl mt-4">
                                {content.heroSubtitle}
                            </p>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="w-full max-w-[500px] ml-auto">
                                <img
                                    src="/images/about-banner.png"
                                    alt="For-Labs"
                                    className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About & Stats Grid Layout */}
            <section className="bg-white py-24 lg:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                        {/* Left Column (Images/Stats) */}
                        <div className="lg:col-span-5 flex flex-col gap-10">
                            <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
                                <img
                                    src="/images/corporate-page.png"
                                    alt="Laboratory Facility"
                                    className="w-full h-full object-cover filter saturate-50 contrast-125"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-8">
                                {content.stats.map((stat, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <span className="font-serif text-3xl font-medium text-slate-900">{stat.num}</span>
                                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column (Text Content) */}
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <h2 className="font-serif text-2xl font-medium tracking-tight text-slate-900 md:text-4xl mb-8">
                                {content.aboutSectionTitle}
                            </h2>

                            <div className="space-y-6 text-sm leading-[1.8] font-light text-slate-600 md:text-base">
                                <p>{content.aboutSectionDesc1}</p>
                                <p>{content.aboutSectionDesc2}</p>
                                <p>{content.aboutSectionDesc3}</p>
                            </div>

                            <div className="mt-12 flex">
                                <Link
                                    to="/iletisim"
                                    className="inline-flex items-center gap-2 border-b border-slate-900 pb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 transition-all hover:text-brand-600 hover:border-brand-600 group"
                                >
                                    {content.contactCta}
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Core Values Bento-style */}
            <section className="bg-slate-50/50 py-24 lg:py-32 border-t border-slate-100">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-4xl text-center">
                            {content.valuesTitle}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {content.values.map((val, idx) => (
                            <div
                                key={idx}
                                className="group flex flex-col p-6 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-slate-300"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                                        <val.icon className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-serif text-lg font-medium text-slate-900">{val.title}</h3>
                                </div>
                                <p className="text-xs font-light leading-[1.8] text-slate-500">
                                    {val.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}
