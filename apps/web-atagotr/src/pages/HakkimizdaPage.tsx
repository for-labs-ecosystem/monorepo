import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    BadgeCheck,
    Blocks,
    Building2,
    ChevronRight,
    FlaskConical,
    Globe2,
    Handshake,
    LifeBuoy,
    ShieldCheck,
} from 'lucide-react'

export default function HakkimizdaPage() {
    useEffect(() => {
        document.title = 'Hakkımızda | ATAGO TR'
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
            meta.setAttribute(
                'content',
                'Atago TR hakkında bilgi alın. For-Labs ekosisteminin önemli bir parçası olarak, ürün portföyünü Türkiye\'nin yetkili distribütörü Protek Analitik iş birliğiyle sunan güvenilir laboratuvar çözüm sayfası.'
            )
        }
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="mx-auto max-w-350 px-4 pt-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-4xl bg-primary-900 text-white shadow-2xl shadow-primary-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.18),transparent_35%)]" />
                    <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-primary-100/70">
                            <Link to="/" className="transition-colors hover:text-white">Anasayfa</Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="text-white">Hakkımızda</span>
                        </div>

                        <div className="max-w-4xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary-100 backdrop-blur-md">
                                <Building2 className="h-3.5 w-3.5" />
                                Atago TR Hakkında
                            </span>
                            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                                Atago Ölçüm Cihazlarında Deneyimli Tedarik ve Destek Platformu
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-100/85 sm:text-base">
                                Küresel standartları belirleyen Atago ölçüm teknolojilerini, For-Labs ekosisteminin akademik yaklaşımı ve Protek Analitik uzmanlığıyla laboratuvarınıza taşıyoruz.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/urunler"
                                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-primary-900 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                                >
                                    Ürün Portföyünü İncele
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    to="/destek"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                                >
                                    Yardım & Destek
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="mx-auto max-w-350 px-4 pt-8 sm:px-6 lg:px-8">
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 lg:p-8">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-50 blur-3xl" />
                        <div className="relative">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shadow-sm">
                                <Handshake className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Konumumuz</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Güvenilir markaları doğru bağlamla buluşturan bir yapı
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                Atago TR, yalnızca ürün sergileyen bir sayfa değil; laboratuvar profesyonellerinin ürünleri daha net anlamasını, uygulama alanlarını daha sağlıklı değerlendirmesini ve ihtiyaç duyduklarında doğru destek kanalına daha hızlı ulaşmasını hedefleyen bir deneyim alanıdır.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-blue-50/80 p-6 shadow-sm lg:col-span-5 lg:p-8">
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                            <Globe2 className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ekosistem</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">For-Labs ağı içinde güçlü bir konum</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                            Bu yapı, For-Labs ekosisteminin önemli parçalarından biri olarak ürün, içerik ve destek deneyimini daha bütüncül hale getirir. Böylece kullanıcılar yalnızca katalog görmez; bilgiye, yönlendirmeye ve ihtiyaç duyduğu temas noktalarına da aynı bütün içinde ulaşır.
                        </p>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4 lg:p-8">
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                            <BadgeCheck className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ürün Kaynağı</p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">Yetkili distribütör güvencesi</h3>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            Atago TR ürün portföyünü, Türkiye'nin yetkili distribütörü Protek Analitik iş birliğiyle sunar. Bu yapı, kullanıcıların ürünleri daha güvenilir bir çerçevede değerlendirmesine yardımcı olur.
                        </p>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm lg:col-span-4 lg:p-8">
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary-200 shadow-sm">
                            <FlaskConical className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Odak Alanı</p>
                        <h3 className="mt-2 text-xl font-black tracking-tight">Ölçüm, analiz ve laboratuvar süreçleri</h3>
                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            Sayfa yapısı, refraktometrelerden laboratuvar ölçüm cihazlarına uzanan ürün evrenini daha anlaşılır biçimde sunmak için kurgulanmıştır. Teknik içeriği sadeleştirirken kurumsal güven hissini korur.
                        </p>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-amber-50/70 p-6 shadow-sm lg:col-span-4 lg:p-8">
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                            <LifeBuoy className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Yaklaşım</p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">Bilgi ve destek aynı akışta</h3>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            Ziyaretçi deneyimi, sadece ürün listelemek yerine içerik, yardım ve iletişim alanlarını aynı kurumsal akış içinde bir araya getirir. Bu sayede karar süreci daha berrak ilerler.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900">Şeffaf ve yalın anlatım</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            Ürün ve içerik katmanları, kafa karıştırmadan rehberlik edecek şekilde düzenlenir. Kullanıcı hangi noktada olursa olsun bir sonraki adımı daha rahat görür.
                        </p>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <Blocks className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900">Kategorize edilmiş ürün yaklaşımı</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            Portföy yapısı, kullanıcıların ürünü yalnızca marka veya model üzerinden değil, ihtiyaç ve kullanım senaryosu üzerinden de değerlendirebilmesine yardımcı olur.
                        </p>
                    </div>

                    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                            <Handshake className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900">Kurumsal güven hissi</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            Atago TR, güven veren görsel dilini, destek kanallarına açık erişimi ve net ürün sunumunu tek sayfa deneyiminde buluşturur.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
                <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Bir Sonraki Adım</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                İhtiyacınıza uygun ürünü inceleyin veya destek ekibiyle temas kurun
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                Ürün portföyünü keşfetmek, bilgi bankasına göz atmak veya doğrudan yardım almak için ilgili akışa geçebilirsiniz.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                            <Link
                                to="/urunler"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                            >
                                Ürünleri Gör
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                to="/bilgi-bankasi"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100"
                            >
                                Bilgi Bankası
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
