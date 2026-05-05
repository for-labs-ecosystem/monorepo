import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Sparkles, Target, Users, ArrowRight } from 'lucide-react'
import { getPage, TiptapRenderer } from '@forlabs/core'
import type { Page } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

const VALUES = [
    { icon: ShieldCheck, title: 'Klinik Doğruluk', desc: 'Her ölçümün arkasında sektörel akreditasyon ve laboratuvar doğrulaması.' },
    { icon: Target, title: 'Sıfır Kontaminasyon', desc: 'Steril paketleme, izlenebilir lot kayıtları ve tek kullanımlık tasarım.' },
    { icon: Users, title: 'Uzman Destek', desc: 'Saha ve laboratuvar hijyen uzmanlarımız tüm uygulama soruları için yanınızda.' },
]

export default function AboutPage() {
    const { data } = useQuery({
        queryKey: ['page', 'kurumsal'],
        queryFn: () => getPage('kurumsal'),
    })

    const page = data?.data as Page | undefined

    return (
        <>
            <title>Kurumsal | HijyenKontrol</title>
            <meta name="description" content="HijyenKontrol; laboratuvar ve üretim tesislerinde klinik standartta hijyen denetimi için kurulmuş bir For-Labs Ekosistemi markasıdır." />

            <section className="relative">
                <div className="mx-auto max-w-[1100px] px-6 lg:px-10 pt-14 pb-12 lg:pt-20 lg:pb-16 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-uv-700 tracking-wide mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-uv-500" />
                        KURUMSAL
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight mb-5 leading-[1.05]">
                        {page?.title || 'Klinik Temizlik. Sektörel Standart.'}
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-[15.5px]">
                        HijyenKontrol; laboratuvarlar, gıda üretim tesisleri ve sağlık kurumları için klinik standartta hijyen denetimi araçları sunan bir For-Labs Ekosistemi markasıdır.
                    </p>
                </div>
            </section>

            {page?.cover_image_url && (
                <div className="mx-auto max-w-[1200px] px-6 lg:px-10 mb-16">
                    <div className="glass-card overflow-hidden">
                        <img
                            src={getImageUrl(page.cover_image_url) || ''}
                            alt={page.title}
                            className="w-full h-64 lg:h-96 object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Values */}
            <section className="relative py-12 lg:py-20">
                <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
                    <div className="grid md:grid-cols-3 gap-5">
                        {VALUES.map((v) => {
                            const Icon = v.icon
                            return (
                                <div key={v.title} className="glass-card p-7">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-uv-400 to-clean-500 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(6,182,212,0.4)] mb-5">
                                        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-slate-800 mb-2">{v.title}</h3>
                                    <p className="text-[13px] text-slate-500 leading-relaxed">{v.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CMS Content */}
            {page?.content && (
                <section className="relative pb-24">
                    <div className="mx-auto max-w-4xl px-6 lg:px-10">
                        <div className="glass-card p-8 lg:p-12">
                            <TiptapRenderer content={page.content} />
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="relative pb-24">
                <div className="mx-auto max-w-[900px] px-6 lg:px-10">
                    <div className="glass-card relative overflow-hidden p-10 lg:p-12 text-center">
                        <div className="glow-uv-beam" />
                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                                Tesisinize özel hijyen paketi ister misiniz?
                            </h2>
                            <p className="text-slate-500 mb-7 max-w-lg mx-auto">
                                Uzmanlarımız tesisinizin hijyen denetim ihtiyaçlarını analiz edip size özel bir teklif hazırlasın.
                            </p>
                            <Link to="/iletisim" className="btn-uv">
                                İletişime Geç
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
