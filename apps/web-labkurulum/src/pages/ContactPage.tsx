import { useState } from 'react'
import { submitInquiry } from '@forlabs/core'
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react'

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function ContactPage() {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await submitInquiry({
                site_id: Number(SITE_ID),
                sender_name: form.full_name,
                sender_email: form.email,
                phone: form.phone || undefined,
                company: form.company || undefined,
                subject: form.subject || 'Teklif Talebi',
                message: form.message,
                type: 'quote',
            })
            setSuccess(true)
        } catch {
            setError('Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <title>İletişim & Teklif Al — Lab Kurulum</title>
            <meta name="description" content="Laboratuvar kurulum projeniz için ücretsiz fizibilite ve teklif talebi gönderin." />

            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <span className="text-[11px] font-mono font-bold text-brand-600 uppercase tracking-[0.2em]">// İletişim</span>
                    <h1 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">Teklif Al & Proje Başlat</h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-xl">
                        Proje detaylarınızı paylaşın, mühendislik ekibimiz size en kısa sürede dönüş yapsın.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        {success ? (
                            <div className="border border-emerald-200 rounded-md bg-emerald-50 p-10 text-center">
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-emerald-800 mb-2">Talebiniz Alındı!</h2>
                                <p className="text-sm text-emerald-700">
                                    Mühendislik ekibimiz en kısa sürede sizinle iletişime geçecektir.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="border border-slate-200 rounded-md bg-white p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                    <div>
                                        <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Ad Soyad *
                                        </label>
                                        <input
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                            E-posta *
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Telefon
                                        </label>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                            Kurum / Firma
                                        </label>
                                        <input
                                            name="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                                        />
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                        Konu
                                    </label>
                                    <select
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400"
                                    >
                                        <option value="">Konu Seçin</option>
                                        <option value="Laboratuvar Kurulum Teklifi">Laboratuvar Kurulum Teklifi</option>
                                        <option value="Ekipman Tedarik Talebi">Ekipman Tedarik Talebi</option>
                                        <option value="Akreditasyon Danışmanlığı">Akreditasyon Danışmanlığı</option>
                                        <option value="Eğitim Hizmeti">Eğitim Hizmeti</option>
                                        <option value="Genel Bilgi">Genel Bilgi</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                        Proje Detayları *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Laboratuvar tipiniz, ihtiyacınız olan ekipmanlar, tahmini bütçe aralığınız ve zaman planınız hakkında bilgi verin..."
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 border border-red-200 rounded-sm bg-red-50 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-7 py-3 rounded-sm bg-brand-600 text-white text-sm font-bold uppercase tracking-wider transition-all hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed dimension-line"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {submitting ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact sidebar */}
                    <div className="space-y-6">
                        <div className="border border-slate-200 rounded-md bg-white p-6">
                            <h3 className="text-xs font-mono font-bold text-brand-800 uppercase tracking-widest mb-4">İletişim Bilgileri</h3>
                            <div className="space-y-4 text-sm">
                                <a href="tel:+902121234567" className="flex items-center gap-3 text-slate-600 hover:text-brand-600 transition-colors">
                                    <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                                    +90 (212) 123 45 67
                                </a>
                                <a href="mailto:info@labkurulum.com" className="flex items-center gap-3 text-slate-600 hover:text-brand-600 transition-colors">
                                    <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                                    info@labkurulum.com
                                </a>
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                    İstanbul, Türkiye
                                </div>
                            </div>
                        </div>

                        <div className="border border-green-200 rounded-md bg-green-50/50 p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-100 rounded-full opacity-50 transition-transform group-hover:scale-110" />
                            <h3 className="relative z-10 text-xs font-mono font-bold text-green-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                WhatsApp Aktif
                            </h3>
                            <p className="relative z-10 text-sm text-green-700 leading-relaxed mb-5">
                                Projenizi hızlıca başlatmak veya anlık sorularınız için WhatsApp üzerinden bize yazabilirsiniz.
                            </p>
                            <a 
                                href="https://wa.me/905320000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-10 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-green-600 text-white text-[13px] font-bold uppercase tracking-wider transition-all hover:bg-green-700 hover:shadow-lg active:scale-[0.98]"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.888-.656-1.488-1.467-1.662-1.764-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp Chat
                            </a>
                        </div>

                        <div className="border border-accent-200 rounded-md bg-accent-50 p-6">
                            <h3 className="text-xs font-mono font-bold text-accent-800 uppercase tracking-widest mb-2">Hızlı Dönüş Garantisi</h3>
                            <p className="text-sm text-accent-700 leading-relaxed">
                                Tüm teklif taleplerine 24 saat içinde mühendislik ekibimiz tarafından dönüş yapılır.
                            </p>
                        </div>

                        <div className="border border-slate-200 rounded-md bg-slate-50 p-6">
                            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest mb-3">Standartlarımız</h3>
                            <div className="flex flex-wrap gap-2">
                                {['ISO 17025', 'GLP', 'GMP', 'ISO 9001'].map((std) => (
                                    <span key={std} className="text-[10px] font-mono font-semibold text-brand-600 px-2.5 py-1 border border-brand-200 rounded-sm bg-white">
                                        {std}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
