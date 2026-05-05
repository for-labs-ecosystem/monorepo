import { useState } from 'react'
import { Send, Loader2, CheckCircle, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                message: `[Firma: ${company}] [Konu: ${subject}]\n\n${message}`,
                type: 'contact',
            })
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    return (
        <>
            <title>İletişim — GıdaKimya</title>
            <meta name="description" content="GıdaKimya ile iletişime geçin. Teklif talebi, teknik destek ve danışmanlık için bize ulaşın." />

            <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 lg:py-16">
                {/* Page Header */}
                <div className="mb-14 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[11px] font-semibold text-azure-500 uppercase tracking-[0.2em]">İletişim</span>
                        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Bize Ulaşın</h1>
                        <p className="mt-4 text-slate-400 leading-relaxed">
                            Teklif talebi, teknik danışmanlık veya herhangi bir sorunuz için formu doldurun veya iletişim bilgilerimizden bize ulaşın.
                        </p>
                    </div>

                    {/* WhatsApp CTA Card */}
                    <div className="bento-card p-6 border-emerald-100/50 bg-emerald-50/40 flex flex-col sm:flex-row items-center gap-5 lg:min-w-[340px]">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-[13px] font-bold text-emerald-800 mb-2">Hızlı Destek Hattı</h3>
                            <a
                                href="https://wa.me/902121234567"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-[11px] font-bold text-white hover:bg-emerald-600 transition-all shadow-sm w-full sm:w-auto uppercase tracking-wide"
                            >
                                WhatsApp'tan Yazın
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        {status === 'success' ? (
                            <div className="bento-card p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-3">Mesajınız İletildi!</h3>
                                <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                                    Ekibimiz en kısa sürede sizinle iletişime geçecektir. İlginiz için teşekkür ederiz.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bento-card p-8 lg:p-10 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
                                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız ve soyadınız" className="input-lab w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">E-posta *</label>
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@firma.com" className="input-lab w-full" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
                                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className="input-lab w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Firma</label>
                                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Firma adınız" className="input-lab w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Konu</label>
                                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-lab w-full">
                                        <option value="">Konu seçin</option>
                                        <option value="Teklif Talebi">Teklif Talebi</option>
                                        <option value="Teknik Destek">Teknik Destek</option>
                                        <option value="Kalibrasyon">Kalibrasyon</option>
                                        <option value="Kurulum & Eğitim">Kurulum & Eğitim</option>
                                        <option value="Genel Bilgi">Genel Bilgi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mesajınız *</label>
                                    <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mesajınızı buraya yazın..." className="input-lab w-full resize-none" />
                                </div>
                                <label className="flex items-start gap-3 cursor-pointer group pt-1">
                                    <input type="checkbox" checked={kvkkAccepted} onChange={(e) => setKvkkAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-azure-500 cursor-pointer" />
                                    <span className="text-[11.5px] text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                                        <strong className="text-slate-500">KVKK Aydınlatma Metni</strong>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                                    </span>
                                </label>
                                {status === 'error' && (
                                    <p className="text-sm text-red-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                )}
                                <button type="submit" disabled={status === 'sending' || !kvkkAccepted} className="w-full btn-azure disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                                    {status === 'sending' ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Mesajı Gönder</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="space-y-6">
                        {[
                            { icon: Phone, label: 'Telefon', value: '+90 (212) 123 45 67', href: 'tel:+902121234567' },
                            { icon: Mail, label: 'E-posta', value: 'info@gidakimya.com', href: 'mailto:info@gidakimya.com' },
                            { icon: MapPin, label: 'Adres', value: 'İstanbul, Türkiye', href: null },
                            { icon: Clock, label: 'Çalışma Saatleri', value: 'Pzt-Cum: 09:00 - 18:00', href: null },
                        ].map((item) => {
                            const Icon = item.icon
                            const Wrapper = item.href ? 'a' : 'div'
                            return (
                                <Wrapper
                                    key={item.label}
                                    {...(item.href ? { href: item.href } : {})}
                                    className="bento-card p-6 flex items-start gap-4 group"
                                >
                                    <div className="w-11 h-11 rounded-2xl bg-azure-50 flex items-center justify-center text-azure-500 shrink-0 group-hover:scale-110 group-hover:bg-azure-100 transition-all duration-300">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-[14px] font-semibold text-slate-600 group-hover:text-azure-600 transition-colors duration-300">{item.value}</p>
                                    </div>
                                </Wrapper>
                            )
                        })}

                    </div>
                </div>
            </div>
        </>
    )
}
