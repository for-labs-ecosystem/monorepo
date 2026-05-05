import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    Send, CheckCircle, Loader2, ChevronRight, Package, ClipboardList,
    FlaskConical, ArrowRight, Building2, Mail, Phone as PhoneIcon, User as UserIcon,
} from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

type QuoteType = 'bulk_product' | 'project' | 'custom'

const QUOTE_OPTIONS: { type: QuoteType; icon: React.ElementType; label: string; desc: string }[] = [
    {
        type: 'bulk_product',
        icon: Package,
        label: 'Toplu Ürün Teklifi',
        desc: 'Mevcut katalogumuzdan birden fazla ATP test kiti, swab veya luminometre için toplu fiyat teklifi alın.',
    },
    {
        type: 'project',
        icon: FlaskConical,
        label: 'Proje Bazlı Teklif',
        desc: 'Üretim hattınız veya laboratuvarınız için kapsamlı hijyen denetim çözümü ve özel fiyatlandırma.',
    },
    {
        type: 'custom',
        icon: ClipboardList,
        label: 'Özel Talep',
        desc: 'Katalog dışı ürün, özel ambalaj, validasyon paketi veya farklı bir ihtiyacınız mı var? Bize yazın.',
    },
]

export default function QuotePage() {
    const [selectedType, setSelectedType] = useState<QuoteType | null>(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [details, setDetails] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedType) return
        if (honeypotRef.current?.value) {
            // Bot detected — fake success
            setStatus('success')
            return
        }
        setStatus('sending')
        try {
            const quoteLabel = QUOTE_OPTIONS.find((o) => o.type === selectedType)?.label ?? selectedType
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                company,
                quote_type: quoteLabel,
                message: details,
                type: 'quote',
            })
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <title>Teklif İste — HijyenKontrol</title>
            <meta
                name="description"
                content="ATP luminometreler, yüzey swab kitleri ve hijyen test çözümleri için toplu sipariş, proje bazlı veya özel teklif talep edin."
            />

            {/* ─── Unified Background Layers ─── */}
            <div className="absolute inset-0 bg-gradient-to-br from-uv-100 via-white to-clean-100/70 pointer-events-none" />
            <div className="absolute -top-40 -right-32 w-[620px] h-[620px] rounded-full bg-uv-300/25 blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 -left-32 w-[580px] h-[580px] rounded-full bg-clean-300/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-uv-200/15 blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 micro-grid opacity-[0.25] pointer-events-none" />

            {/* ─── Hero ─── */}
            <section className="relative">
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 mb-6">
                        <Link to="/" className="hover:text-uv-700 transition-colors duration-300">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-500">Teklif İste</span>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-white/80 px-3.5 py-1.5 text-[10.5px] font-bold text-slate-600 tracking-[0.22em] uppercase mb-6 shadow-[0_2px_12px_-4px_rgba(6,182,212,0.2)]">
                        <span className="status-led !w-1.5 !h-1.5" />
                        TESİSE ÖZEL TEKLİF
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-5">
                        Tesisiniz için{' '}
                        <span className="italic font-light bg-gradient-to-r from-uv-600 to-clean-600 bg-clip-text text-transparent">özel teklif</span>{' '}
                        hazırlayalım.
                    </h1>
                    <p className="text-[15.5px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Teklif türünüzü seçin, formu doldurun, uzman ekibimizle talebinizi inceleyip en kısa sürede size özel fiyatlandırma ile dönüş yapalım.
                    </p>
                </div>
            </section>

            {/* ─── Form ─── */}
            <section className="relative pb-24 -mt-2">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

                    {status === 'success' ? (
                        /* SUCCESS */
                        <div className="glass-card p-12 lg:p-16 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 rounded-full bg-clean-50 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-clean-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Teklif Talebiniz Alındı!</h2>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Uzman ekibimiz talebinizi inceleyip 1 iş günü içinde size özel fiyatlandırma ile dönüş yapacaktır.
                                Acil durumlar için <a href="tel:+908502340567" className="text-uv-700 font-semibold hover:underline">0 850 234 05 67</a> numaramızdan da bize ulaşabilirsiniz.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link to="/" className="btn-uv">Anasayfaya Dön</Link>
                                <Link
                                    to="/urunler"
                                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-uv-700 hover:text-uv-900 transition-colors"
                                >
                                    Ürünlere Göz At <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

                            {/* STEP 1 — Type selector */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-uv-500 to-clean-500 text-white text-[12px] font-bold">
                                            1
                                        </span>
                                        <h2 className="text-[15px] font-bold text-slate-800">Teklif Türünü Seçin</h2>
                                    </div>
                                    <p className="text-[12.5px] text-slate-500 pl-9 leading-relaxed">
                                        İhtiyacınıza en uygun teklif kategorisini belirleyin.
                                    </p>
                                </div>

                                {QUOTE_OPTIONS.map((opt) => {
                                    const Icon = opt.icon
                                    const isSelected = selectedType === opt.type
                                    return (
                                        <button
                                            key={opt.type}
                                            type="button"
                                            onClick={() => setSelectedType(opt.type)}
                                            className={`w-full text-left group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-uv-300 bg-uv-50/60 shadow-[0_8px_28px_-12px_rgba(6,182,212,0.4)]'
                                                    : 'border-slate-100 bg-white/70 hover:border-slate-200 hover:bg-slate-50/70'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-colors duration-300 ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-uv-500 to-clean-500 text-white'
                                                    : 'bg-slate-50 text-slate-400 group-hover:bg-uv-50 group-hover:text-uv-600'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-[14px] font-bold leading-snug transition-colors duration-300 ${
                                                    isSelected ? 'text-uv-800' : 'text-slate-700'
                                                }`}>
                                                    {opt.label}
                                                </p>
                                                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-uv-600 shrink-0 mt-1" />
                                            )}
                                        </button>
                                    )
                                })}

                                {/* Trust line */}
                                <div className="rounded-2xl border border-slate-100 bg-white/60 backdrop-blur-md px-5 py-4 mt-6">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2">
                                        Neden HijyenKontrol?
                                    </p>
                                    <ul className="space-y-1.5 text-[12.5px] text-slate-600 leading-relaxed">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-clean-500 shrink-0" />
                                            Global markaların orijinal ürünleri
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-clean-500 shrink-0" />
                                            Uluslararası akreditasyon (ISO 22196 uyumlu)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-clean-500 shrink-0" />
                                            1 iş günü içinde fiyat dönüşü
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* STEP 2 — Form */}
                            <div className="lg:col-span-7">
                                <div className="mb-6 flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-uv-500 to-clean-500 text-white text-[12px] font-bold">
                                        2
                                    </span>
                                    <h2 className="text-[15px] font-bold text-slate-800">Bilgilerinizi Doldurun</h2>
                                </div>

                                <div className="glass-card p-7 lg:p-9">
                                    <form onSubmit={handleSubmit} className="space-y-5">

                                        {/* Selected type indicator */}
                                        {selectedType && (
                                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-uv-50/60 border border-uv-100">
                                                <CheckCircle className="w-4 h-4 text-uv-600 shrink-0" />
                                                <span className="text-[12.5px] font-semibold text-uv-800">
                                                    {QUOTE_OPTIONS.find((o) => o.type === selectedType)?.label}
                                                </span>
                                                <span className="text-[11px] text-slate-400">— seçili teklif türü</span>
                                            </div>
                                        )}

                                        {/* Row 1 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                                                    <UserIcon className="inline w-3 h-3 mr-1 -mt-0.5" />Ad Soyad *
                                                </label>
                                                <input
                                                    type="text" required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Adınız ve soyadınız"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                                                    <Building2 className="inline w-3 h-3 mr-1 -mt-0.5" />Firma / Tesis Adı
                                                </label>
                                                <input
                                                    type="text"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                    placeholder="Firma veya kurum adı"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                                                    <Mail className="inline w-3 h-3 mr-1 -mt-0.5" />E-posta *
                                                </label>
                                                <input
                                                    type="email" required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="ornek@firma.com"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                                                    <PhoneIcon className="inline w-3 h-3 mr-1 -mt-0.5" />Telefon *
                                                </label>
                                                <input
                                                    type="tel" required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="05XX XXX XX XX"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div>
                                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                                                Teklif Detayları *
                                            </label>
                                            <textarea
                                                rows={6} required
                                                value={details}
                                                onChange={(e) => setDetails(e.target.value)}
                                                placeholder={
                                                    selectedType === 'bulk_product'
                                                        ? 'Hangi ürünlerden, kaçar adet teklif istiyorsunuz? (Ürün adı, miktarları ve varsa hedef teslimat tarihini yazın.)'
                                                        : selectedType === 'project'
                                                            ? 'Tesisinizin türü (gıda fabrikası / hastane / lab vb.), HACCP/ISO gereksinimleri, hedef test sayısı ve zaman planını kısaca açıklayın.'
                                                            : 'Talebinizi detaylı bir şekilde açıklayın. Katalog dışı ürün veya özel validasyon ihtiyacınızı belirtin.'
                                                }
                                                className="input-soft w-full resize-none"
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                                                <p className="text-[12.5px] text-red-700 font-medium">
                                                    Bir hata oluştu. Lütfen tekrar deneyin veya 0 850 234 05 67 numarasından bize ulaşın.
                                                </p>
                                            </div>
                                        )}

                                        {/* Honeypot */}
                                        <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                            <label>
                                                Lütfen bu alanı boş bırakın
                                                <input
                                                    type="text"
                                                    name="company_website"
                                                    ref={honeypotRef}
                                                    autoComplete="off"
                                                    tabIndex={-1}
                                                />
                                            </label>
                                        </div>

                                        {/* KVKK */}
                                        <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                            <input
                                                type="checkbox"
                                                checked={kvkkAccepted}
                                                onChange={(e) => setKvkkAccepted(e.target.checked)}
                                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-uv-500 focus:ring-uv-400 focus:ring-offset-0 accent-uv-500 cursor-pointer"
                                            />
                                            <span className="text-[11.5px] text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                                                <strong className="text-slate-700">KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin teklif sürecinde işlenmesine onay veriyorum.
                                            </span>
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={status === 'sending' || !selectedType || !kvkkAccepted}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-uv-500 via-uv-600 to-clean-500 text-white px-6 py-3.5 text-[13px] font-semibold tracking-[0.06em] shadow-[0_10px_28px_-8px_rgba(6,182,212,0.55)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(6,182,212,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                        >
                                            {status === 'sending' ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Gönderiliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Teklif Talebini Gönder
                                                </>
                                            )}
                                        </button>

                                        {!selectedType && (
                                            <p className="text-center text-[11.5px] text-slate-400">
                                                Lütfen önce sol panelden bir teklif türü seçin.
                                            </p>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
