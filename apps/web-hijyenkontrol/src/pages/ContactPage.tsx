import { useState, useRef } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [kvkk, setKvkk] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (honeypotRef.current?.value) {
            setStatus('success')
            return
        }
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                company,
                subject,
                message,
                type: 'contact',
            })
            setStatus('success')
            setName(''); setEmail(''); setPhone(''); setCompany(''); setSubject(''); setMessage(''); setKvkk(false)
        } catch {
            setStatus('error')
        }
    }

    return (
        <>
            <title>İletişim | HijyenKontrol</title>
            <meta name="description" content="HijyenKontrol uzman ekibine ulaşın. Tesisinize özel hijyen test paketi için teklif alın." />

            <section className="relative">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 pb-10 lg:pt-20 lg:pb-14">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-uv-700 tracking-wide mb-5">
                            <Sparkles className="w-3.5 h-3.5 text-uv-500" />
                            İLETİŞİM
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-4 leading-[1.1]">
                            Hijyen uzmanlarımız <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-uv-500 to-clean-500 bg-clip-text text-transparent">size yardımcı olsun</span>
                        </h1>
                        <p className="text-slate-500 leading-relaxed">
                            Üretim tesisi denetimi, laboratuvar hijyen paketi veya hızlı patojen testleri için ekibimize ulaşın.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative pb-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
                        {/* Contact info */}
                        <div className="space-y-4">
                            <div className="glass-card p-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-uv-400 to-uv-600 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(6,182,212,0.45)] mb-4">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-[14px] font-bold text-slate-800 mb-1.5">Telefon</h3>
                                <a href="tel:+902121234567" className="text-[14px] text-slate-600 hover:text-uv-700 transition-colors">+90 (212) 123 45 67</a>
                                <p className="text-[11.5px] text-slate-400 mt-1.5">Pazartesi – Cuma · 09:00 – 18:00</p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-clean-400 to-clean-600 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(16,185,129,0.4)] mb-4">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-[14px] font-bold text-slate-800 mb-1.5">E-posta</h3>
                                <a href="mailto:info@hijyenkontrol.com" className="text-[14px] text-slate-600 hover:text-clean-700 transition-colors">info@hijyenkontrol.com</a>
                                <p className="text-[11.5px] text-slate-400 mt-1.5">24 saat içinde dönüş</p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-uv-500 to-clean-500 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(6,182,212,0.45)] mb-4">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-[14px] font-bold text-slate-800 mb-1.5">Merkez</h3>
                                <p className="text-[14px] text-slate-600 leading-relaxed">İstanbul, Türkiye</p>
                                <p className="text-[11.5px] text-slate-400 mt-1.5">For-Labs Ekosistemi üyesi</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="glass-card p-8 lg:p-10">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-clean-50 flex items-center justify-center mb-5">
                                        <CheckCircle className="w-10 h-10 text-clean-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Mesajınız İletildi</h3>
                                    <p className="text-slate-500 leading-relaxed max-w-sm">
                                        Ekibimiz en kısa sürede size dönüş yapacaktır. İlginiz için teşekkür ederiz.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
                                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-soft" placeholder="Adınız ve soyadınız" />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Firma</label>
                                            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-soft" placeholder="Firma adı (opsiyonel)" />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">E-posta *</label>
                                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-soft" placeholder="ornek@firma.com" />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
                                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-soft" placeholder="05XX XXX XX XX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Konu</label>
                                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-soft" placeholder="Talebiniz hakkında kısa bir başlık" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mesajınız *</label>
                                        <textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} className="input-soft resize-none" placeholder="İhtiyacınızı detaylandırın..." />
                                    </div>

                                    <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                        <label>Lütfen bu alanı boş bırakın
                                            <input type="text" name="fax_number" ref={honeypotRef} autoComplete="off" tabIndex={-1} />
                                        </label>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                                        <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-uv-500 cursor-pointer" />
                                        <span className="text-[12px] text-slate-500 leading-relaxed">
                                            <strong className="text-slate-600">KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                                        </span>
                                    </label>

                                    {status === 'error' && (
                                        <p className="text-sm text-red-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                    )}

                                    <button type="submit" disabled={status === 'sending' || !kvkk} className="btn-uv w-full disabled:opacity-40 disabled:cursor-not-allowed">
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Mesajı Gönder</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
