import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Send, CheckCircle, Loader2, ChevronRight, Package, ClipboardList, FlaskConical, ArrowRight } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

type QuoteType = 'bulk_product' | 'project' | 'custom'

const QUOTE_OPTIONS: { type: QuoteType; icon: React.ElementType; label: string; desc: string }[] = [
    {
        type: 'bulk_product',
        icon: Package,
        label: 'Toplu Ürün Teklifi',
        desc: 'Mevcut katalogumuzdan birden fazla test kiti için toplu fiyat teklifi alın.',
    },
    {
        type: 'project',
        icon: FlaskConical,
        label: 'Proje Bazlı Teklif',
        desc: 'Üretim hattınıza veya laboratuvar projenize özel kapsamlı çözüm ve fiyatlandırma.',
    },
    {
        type: 'custom',
        icon: ClipboardList,
        label: 'Özel Talep',
        desc: 'Katalog dışı ürün, özel ambalaj veya farklı bir ihtiyacınız mı var? Bize yazın.',
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
        // Anti-bot: honeypot dolu ise sessizce success göster
        if (honeypotRef.current?.value) {
            setStatus('success')
            return
        }
        setStatus('sending')
        try {
            const quoteLabel = QUOTE_OPTIONS.find(o => o.type === selectedType)?.label ?? selectedType;
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
        <div className="min-h-screen">
            <title>Teklif İste — Alerjen</title>
            <meta name="description" content="Alerjen test kitleri için toplu sipariş, proje bazlı veya özel teklif talep edin." />

            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-peach-50/50 via-white to-mint-50/30" />
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-coral-200/8 blur-[80px]" style={{ willChange: 'transform' }} />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 mb-6">
                        <Link to="/" className="hover:text-ocean-500 transition-colors duration-300">Anasayfa</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-500">Teklif İste</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 tracking-tight">
                        Projeniz İçin<br />
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Teklif Alın</span>
                    </h1>
                    <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-light">
                        Teklif türünüzü seçin, formu doldurun — uzman ekibimiz en kısa sürede size özel fiyatlandırma ile dönüş yapacaktır.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="relative z-10 pb-20 lg:pb-32 -mt-4">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

                    {status === 'success' ? (
                        /* Success State */
                        <div className="pebble-card p-12 lg:p-16 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 rounded-full bg-ocean-50/60 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-ocean-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-700 mb-3">Teklif Talebiniz Alındı!</h2>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Uzman ekibimiz talebinizi inceleyecek ve en kısa sürede size özel fiyatlandırma ile dönüş yapacaktır.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link to="/" className="btn-warm">Anasayfaya Dön</Link>
                                <Link to="/urunler" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ocean-500 hover:text-ocean-600 transition-colors duration-300">
                                    Ürünlere Göz At <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

                            {/* Step 1: Quote Type Selection */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ocean-500 text-white text-[12px] font-bold">1</span>
                                        <h2 className="text-[15px] font-bold text-slate-700">Teklif Türünü Seçin</h2>
                                    </div>
                                    <p className="text-[12.5px] text-slate-400 pl-9 leading-relaxed">İhtiyacınıza en uygun teklif kategorisini belirleyin.</p>
                                </div>

                                {QUOTE_OPTIONS.map((opt) => {
                                    const Icon = opt.icon
                                    const isSelected = selectedType === opt.type
                                    return (
                                        <button
                                            key={opt.type}
                                            onClick={() => setSelectedType(opt.type)}
                                            className={`w-full text-left group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                isSelected
                                                    ? 'border-orange-300 bg-orange-50/60 shadow-lg shadow-orange-100/20'
                                                    : 'border-slate-100 bg-white/60 hover:border-slate-200 hover:bg-slate-50/50 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 transition-colors duration-300 ${
                                                isSelected ? 'bg-orange-100 text-orange-500' : 'bg-slate-50 text-slate-400 group-hover:text-ocean-500 group-hover:bg-ocean-50/50'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-[14px] font-semibold leading-snug transition-colors duration-300 ${
                                                    isSelected ? 'text-orange-600' : 'text-slate-600'
                                                }`}>
                                                    {opt.label}
                                                </p>
                                                <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Step 2: Form */}
                            <div className="lg:col-span-8">
                                <div className="mb-6 flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ocean-500 text-white text-[12px] font-bold">2</span>
                                    <h2 className="text-[15px] font-bold text-slate-700">Bilgilerinizi Doldurun</h2>
                                </div>

                                <div className="pebble-card p-8 lg:p-10 !bg-white/80">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Row 1: Name + Company */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-medium text-slate-500 mb-2">Ad Soyad *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Adınız ve soyadınız"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-slate-500 mb-2">Firma Adı</label>
                                                <input
                                                    type="text"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                    placeholder="Firma veya kurum adı"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Email + Phone */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-medium text-slate-500 mb-2">E-posta *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="ornek@firma.com"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-slate-500 mb-2">Telefon *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="05XX XXX XX XX"
                                                    className="input-soft w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Selected type indicator */}
                                        {selectedType && (
                                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ocean-50/40 border border-ocean-100/30">
                                                <CheckCircle className="w-4 h-4 text-ocean-500 shrink-0" />
                                                <span className="text-[12.5px] font-semibold text-ocean-600">
                                                    {QUOTE_OPTIONS.find(o => o.type === selectedType)?.label}
                                                </span>
                                                <span className="text-[11px] text-slate-400">— seçili teklif türü</span>
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div>
                                            <label className="block text-[13px] font-medium text-slate-500 mb-2">Teklif Detayları *</label>
                                            <textarea
                                                rows={5}
                                                required
                                                value={details}
                                                onChange={(e) => setDetails(e.target.value)}
                                                placeholder={
                                                    selectedType === 'bulk_product'
                                                        ? 'Hangi ürünlerden, kaçar adet teklif istiyorsunuz? (Ürün adı, miktarları ve varsa hedef teslimat tarihini yazın.)'
                                                        : selectedType === 'project'
                                                            ? 'Projenizin kapsamını, hedef metodolojiyi ve zaman planını kısaca açıklayın.'
                                                            : 'Talebinizi detaylı bir şekilde açıklayın...'
                                                }
                                                className="input-soft w-full resize-none"
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <p className="text-sm text-coral-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                        )}

                                        {/* Honeypot — anti-bot tuzağı */}
                                        <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                            <label>Lütfen bu alanı boş bırakın
                                                <input
                                                    type="text"
                                                    name="company_website"
                                                    ref={honeypotRef}
                                                    autoComplete="off"
                                                    tabIndex={-1}
                                                />
                                            </label>
                                        </div>

                                        {/* KVKK Onayı */}
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={kvkkAccepted}
                                                onChange={(e) => setKvkkAccepted(e.target.checked)}
                                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0 accent-orange-500 cursor-pointer"
                                            />
                                            <span className="text-[11.5px] text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                                                <strong className="text-slate-500">KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                                            </span>
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={status === 'sending' || !selectedType || !kvkkAccepted}
                                            className="w-full btn-warm disabled:opacity-50 disabled:cursor-not-allowed"
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
