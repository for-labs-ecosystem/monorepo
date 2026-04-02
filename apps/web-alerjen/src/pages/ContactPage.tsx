import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
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
            <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-accent-50/30" />
                <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        İletişim
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Test kitleri hakkında bilgi almak, toplu sipariş veya proje teklifi için bizimle iletişime geçin.
                    </p>
                </div>
            </section>

            <section className="py-12 lg:py-20">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Bize Ulaşın</h2>
                                <div className="space-y-5">
                                    <a href="tel:+902121234567" className="flex items-start gap-4 group">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Telefon</p>
                                            <p className="text-sm text-slate-500 group-hover:text-primary-600 transition-colors">+90 (212) 123 45 67</p>
                                        </div>
                                    </a>
                                    <a href="mailto:info@alerjen.net" className="flex items-start gap-4 group">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">E-posta</p>
                                            <p className="text-sm text-slate-500 group-hover:text-primary-600 transition-colors">info@alerjen.net</p>
                                        </div>
                                    </a>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Adres</p>
                                            <p className="text-sm text-slate-500">İstanbul, Türkiye</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-green-50 border border-green-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-bold text-green-800">WhatsApp ile Hızlı İletişim</span>
                                </div>
                                <p className="text-sm text-green-700 mb-4">Anında yanıt almak için WhatsApp üzerinden yazabilirsiniz.</p>
                                <a
                                    href="https://wa.me/905320000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-green-700 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp'tan Yazın
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 lg:p-10">
                                {status === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                                            <CheckCircle className="w-8 h-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Mesajınız İletildi!</h3>
                                        <p className="text-sm text-slate-500">En kısa sürede sizinle iletişime geçeceğiz.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-slate-900 mb-6">İletişim Formu</h2>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ad Soyad *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Adınız ve soyadınız"
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta *</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="ornek@firma.com"
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefon *</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="05XX XXX XX XX"
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mesajınız *</label>
                                                <textarea
                                                    rows={5}
                                                    required
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Hangi test kitleri hakkında bilgi almak istiyorsunuz?"
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                                                />
                                            </div>

                                            {status === 'error' && (
                                                <p className="text-sm text-red-600 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={status === 'sending'}
                                                className="w-full flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
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
