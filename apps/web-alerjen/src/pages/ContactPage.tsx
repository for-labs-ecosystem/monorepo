import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                message,
                type: 'contact',
            })
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    return (
        <div className="min-h-screen">
            <title>İletişim — Alerjen</title>

            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 via-white to-peach-50/30" />
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-ocean-200/8 blur-[120px]" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="w-full max-w-md order-2 lg:order-1">
                            <div className="pebble-card p-8 !bg-white/80">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-2xl bg-green-50/80 flex items-center justify-center">
                                         <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                         </svg>
                                    </div>
                                    <span className="text-[15px] font-semibold text-slate-600">WhatsApp ile Hızlı İletişim</span>
                                </div>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed font-light">Anında yanıt almak için WhatsApp üzerinden yazabilirsiniz.</p>
                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-[#20bd5c] hover:-translate-y-1 active:scale-95 transition-all duration-300"
                                >
                                    WhatsApp'tan Yazın
                                </a>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 lg:pl-12">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-600 tracking-tight">
                                İletişim
                            </h1>
                            <p className="mt-5 text-lg text-slate-400 max-w-xl leading-relaxed font-light">
                                Test kitleri hakkında bilgi almak, toplu sipariş veya proje teklifi için bizimle iletişime geçin.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 lg:py-24">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-10">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-600 mb-7">Bize Ulaşın</h2>
                                <div className="space-y-6">
                                    <a href="tel:+902121234567" className="flex items-start gap-4 group">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50/50 text-ocean-400 shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-600">Telefon</p>
                                            <p className="text-sm text-slate-400 group-hover:text-ocean-500 transition-colors duration-300 font-light">+90 (212) 123 45 67</p>
                                        </div>
                                    </a>
                                    <a href="mailto:info@alerjen.net" className="flex items-start gap-4 group">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50/50 text-ocean-400 shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-600">E-posta</p>
                                            <p className="text-sm text-slate-400 group-hover:text-ocean-500 transition-colors duration-300 font-light">info@alerjen.net</p>
                                        </div>
                                    </a>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50/50 text-ocean-400 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-600">Adres</p>
                                            <p className="text-sm text-slate-400 font-light">İstanbul, Türkiye</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="pebble-card p-8 lg:p-10 !bg-white/80">
                                {status === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-14 text-center">
                                        <div className="w-16 h-16 rounded-full bg-ocean-50/50 flex items-center justify-center mb-5">
                                            <CheckCircle className="w-8 h-8 text-ocean-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-600 mb-2">Mesajınız İletildi!</h3>
                                        <p className="text-sm text-slate-400 font-light">En kısa sürede sizinle iletişime geçeceğiz.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-slate-600 mb-7">İletişim Formu</h2>
                                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                            <div>
                                                <label className="block text-[13px] font-medium text-slate-500 mb-2">Mesajınız *</label>
                                                <textarea
                                                    rows={5}
                                                    required
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Hangi test kitleri hakkında bilgi almak istiyorsunuz?"
                                                    className="input-soft w-full resize-none"
                                                />
                                            </div>

                                            {status === 'error' && (
                                                <p className="text-sm text-coral-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={status === 'sending'}
                                                className="w-full btn-warm disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {status === 'sending' ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Gönderiliyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        Mesajı Gönder
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
