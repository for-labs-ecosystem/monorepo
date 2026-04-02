import { useState } from 'react'
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
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    if (!open) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Top accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Talebiniz Alındı!</h3>
                            <p className="text-sm text-slate-500">En kısa sürede sizinle iletişime geçeceğiz.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Bu Ürün İçin Teklif Al</h3>
                                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5">
                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                    <span className="text-xs font-semibold text-primary-700 truncate max-w-[300px]">{productName}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mesajınız (opsiyonel)</label>
                                    <textarea
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ek bilgi veya özel talepleriniz..."
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
