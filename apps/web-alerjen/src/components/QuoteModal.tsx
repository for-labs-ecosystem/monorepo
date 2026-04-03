import { useState, useRef } from 'react'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

interface QuoteModalProps {
    open: boolean
    onClose: () => void
    productId: number
    productName: string
}

export default function QuoteModal({ open, onClose, productId, productName }: QuoteModalProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    if (!open) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Anti-bot: honeypot dolu ise sessizce success göster
        if (honeypotRef.current?.value) {
            setStatus('success')
            setTimeout(() => {
                onClose()
                setStatus('idle')
            }, 2000)
            return
        }
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                message,
                product_id: productId,
                product_name: productName,
                type: 'product_quote',
            })
            setStatus('success')
            setTimeout(() => {
                onClose()
                setStatus('idle')
                setName('')
                setEmail('')
                setPhone('')
                setMessage('')
            }, 2000)
        } catch {
            setStatus('error')
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md" onClick={onClose} />

            {/* Modal — floating pebble */}
            <div className="relative w-full max-w-lg pebble-card !bg-white/90 overflow-hidden animate-fade-in-up">
                {/* Top accent — soft gradient whisper */}
                <div className="h-1 bg-gradient-to-r from-ocean-300/60 via-ocean-400/40 to-coral-300/40" />

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-300 z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8 lg:p-10">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-ocean-50 flex items-center justify-center mb-5">
                                <CheckCircle className="w-8 h-8 text-ocean-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">Talebiniz Alındı!</h3>
                            <p className="text-sm text-slate-400">En kısa sürede sizinle iletişime geçeceğiz.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-slate-600">Bu Ürün İçin Teklif Al</h3>
                                <div className="mt-3 inline-flex items-center gap-2.5 rounded-full bg-ocean-50/50 border border-ocean-100/40 px-4 py-2">
                                    <div className="w-2 h-2 rounded-full bg-ocean-400" />
                                    <span className="text-xs font-medium text-ocean-700 truncate max-w-[300px]">{productName}</span>
                                </div>
                            </div>

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <label className="block text-[13px] font-medium text-slate-500 mb-2">Mesajınız (opsiyonel)</label>
                                    <textarea
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ek bilgi veya özel talepleriniz..."
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
                                            name="fax_number"
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
                                    disabled={status === 'sending' || !kvkkAccepted}
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
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
