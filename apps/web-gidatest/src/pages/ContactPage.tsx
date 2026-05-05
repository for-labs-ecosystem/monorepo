import { useState, useRef } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [message, setMessage] = useState('')
    const [kvkk, setKvkk] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (honeypotRef.current?.value) { setStatus('success'); return }
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                company,
                message,
                type: 'general',
            })
            setStatus('success')
            setName(''); setEmail(''); setPhone(''); setCompany(''); setMessage(''); setKvkk(false)
        } catch {
            setStatus('error')
        }
    }

    return (
        <div className="py-16 lg:py-24">
            <title>İletişim — GıdaTest</title>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
                <div className="max-w-2xl mb-14">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-px bg-sage-400" />
                        <span className="label-eyebrow">İletişim</span>
                    </div>
                    <h1 className="heading-serif text-4xl lg:text-5xl mb-5">
                        Sorularınız için <span className="italic text-sage-600">buradayız.</span>
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed">
                        Analiz talebi, ürün bilgisi veya danışmanlık — formu doldurun, 24 saat içinde dönüş yapalım.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="card-organic p-6">
                            <div className="w-10 h-10 bg-sage-100 flex items-center justify-center mb-4"
                                 style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                <Phone className="w-4 h-4 text-sage-700" />
                            </div>
                            <h3 className="font-bold text-forest-900 mb-1">Telefon</h3>
                            <a href="tel:+902121234567" className="text-stone-600 hover:text-sage-700 text-sm">+90 (212) 123 45 67</a>
                        </div>
                        <div className="card-organic-alt p-6">
                            <div className="w-10 h-10 bg-sage-100 flex items-center justify-center mb-4"
                                 style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                <Mail className="w-4 h-4 text-sage-700" />
                            </div>
                            <h3 className="font-bold text-forest-900 mb-1">E-posta</h3>
                            <a href="mailto:info@gidatest.com" className="text-stone-600 hover:text-sage-700 text-sm">info@gidatest.com</a>
                        </div>
                        <div className="card-organic p-6">
                            <div className="w-10 h-10 bg-sage-100 flex items-center justify-center mb-4"
                                 style={{ borderTopLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                <MapPin className="w-4 h-4 text-sage-700" />
                            </div>
                            <h3 className="font-bold text-forest-900 mb-1">Adres</h3>
                            <p className="text-stone-600 text-sm">İstanbul, Türkiye</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="card-organic p-8 lg:p-10">
                            {status === 'success' ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-sage-100 flex items-center justify-center mb-6 mx-auto"
                                         style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                                        <CheckCircle className="w-10 h-10 text-sage-600" />
                                    </div>
                                    <h2 className="heading-serif text-2xl mb-3">Mesajınız Alındı!</h2>
                                    <p className="text-stone-600">En kısa sürede size dönüş yapacağız.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Ad Soyad *</label>
                                        <input required value={name} onChange={(e) => setName(e.target.value)} className="input-organic" placeholder="Adınız ve soyadınız" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-eyebrow block mb-1.5">E-posta *</label>
                                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-organic" placeholder="ornek@firma.com" />
                                        </div>
                                        <div>
                                            <label className="label-eyebrow block mb-1.5">Telefon</label>
                                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-organic" placeholder="05XX XXX XX XX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Firma</label>
                                        <input value={company} onChange={(e) => setCompany(e.target.value)} className="input-organic" />
                                    </div>
                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Mesaj *</label>
                                        <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="input-organic resize-none" placeholder="Talebinizi veya sorunuzu yazın..." />
                                    </div>

                                    <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true">
                                        <input type="text" name="fax_number" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                                        <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 w-4 h-4 accent-sage-600" />
                                        <span className="text-[11.5px] text-stone-500">
                                            <strong className="text-forest-800">KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                                        </span>
                                    </label>

                                    {status === 'error' && (
                                        <p className="text-sm text-harvest-700">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                    )}

                                    <button disabled={status === 'sending' || !kvkk} className="btn-organic w-full disabled:opacity-40 disabled:cursor-not-allowed">
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
            </div>
        </div>
    )
}
