import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
    return (
        <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
                <div className="bento-card-filled relative overflow-hidden p-12 lg:p-20 text-center">
                    {/* Dekoratif orb'lar */}
                    <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-azure-400/8 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-[-40%] left-[-5%] w-[400px] h-[400px] rounded-full bg-lab-300/6 blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.03em] leading-tight">
                            Doğru Analiz Cihazını
                            <br />
                            <span className="text-azure-200">Birlikte Belirleyelim</span>
                        </h2>
                        <p className="mt-6 text-lg text-azure-100/70 max-w-2xl mx-auto leading-relaxed font-light">
                            Uzman ekibimiz, üretim hattınıza ve laboratuvarınıza en uygun analiz çözümünü belirlemek için yanınızda.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/iletisim"
                                className="inline-flex items-center gap-2.5 px-10 py-4.5 bg-white text-azure-700 font-bold text-sm rounded-full hover:bg-azure-50 hover:shadow-[0_16px_48px_-8px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all duration-300"
                            >
                                Ücretsiz Danışmanlık Al
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/urunler"
                                className="inline-flex items-center gap-2.5 px-10 py-4.5 bg-white/10 text-white border border-white/20 font-semibold text-sm rounded-full hover:bg-white/20 hover:-translate-y-1 backdrop-blur-sm transition-all duration-300"
                            >
                                Ürün Kataloğu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
