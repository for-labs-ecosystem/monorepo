import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, CheckCircle, Loader2, BookOpen } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'

export interface ArticleInquiryModalProps {
    open: boolean
    onClose: () => void
    article: {
        id: number
        title: string
    }
}

export default function ArticleInquiryModal({ open, onClose, article }: ArticleInquiryModalProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    // Body scroll lock
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    // ESC to close
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (honeypotRef.current?.value) {
            setStatus('success')
            setTimeout(() => { onClose(); resetForm() }, 2000)
            return
        }
        setStatus('sending')
        try {
            await submitInquiry({
                sender_name: name,
                sender_email: email,
                phone,
                message,
                article_id: article.id,
                article_title: article.title,
                type: 'article_inquiry',
            })
            setStatus('success')
            setTimeout(() => { onClose(); resetForm() }, 2500)
        } catch {
            setStatus('error')
        }
    }

    const resetForm = () => {
        setName(''); setEmail(''); setPhone(''); setMessage('')
        setKvkkAccepted(false); setStatus('idle')
    }

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.22)] overflow-hidden animate-fade-in-up flex flex-col max-h-[92dvh]">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all duration-200 z-10"
                    aria-label="Kapat"
                >
                    <X className="w-4 h-4" />
                </button>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-3">Talebiniz Alındı!</h3>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Sorunuz uzman ekibimize başarıyla ulaştı. En kısa sürede sizinle iletişime geçeceğiz.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col overflow-auto">
                        {/* Header Area inside forms */}
                        <div className="p-7 lg:px-10 lg:pt-10 lg:pb-6 border-b border-slate-100 bg-frost-50/50">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-azure-50/60 text-azure-500 mb-4 shadow-sm border border-azure-100/30">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Makale ile İlgili Soru Sorun</h2>
                            <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg mb-4">
                                <strong className="text-slate-700 font-medium">"{article.title}"</strong> konulu makalemizle ilgili aklınıza takılan soruları form üzerinden uzmanlarımıza iletebilirsiniz. Ekibimiz detaylı bir şekilde size dönüş yapacaktır.
                            </p>
                        </div>

                        {/* Form Area */}
                        <div className="p-7 lg:p-10 flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Adınız ve soyadınız"
                                        className="input-lab w-full"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">E-posta *</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ornek@firma.com"
                                            className="input-lab w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="05XX XXX XX XX"
                                            className="input-lab w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Sorunuz *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Makale hakkında öğrenmek istedikleriniz..."
                                        className="input-lab w-full resize-none"
                                    />
                                </div>

                                {/* Honeypot */}
                                <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                    <label>Lütfen bu alanı boş bırakın
                                        <input type="text" name="fax_number" ref={honeypotRef} autoComplete="off" tabIndex={-1} />
                                    </label>
                                </div>

                                {/* KVKK */}
                                <label className="flex items-start gap-3 cursor-pointer group mt-2">
                                    <input
                                        type="checkbox"
                                        checked={kvkkAccepted}
                                        onChange={(e) => setKvkkAccepted(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-azure-500 cursor-pointer"
                                    />
                                    <span className="text-[11.5px] text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                                        <strong className="text-slate-500">KVKK Aydınlatma Metni</strong>'ni okudum,
                                        kişisel verilerimin işlenmesine onay veriyorum.
                                    </span>
                                </label>

                                {status === 'error' && (
                                    <p className="text-sm text-red-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                )}

                                <div className="pt-4 border-t border-slate-100 mt-6">
                                    <button
                                        type="submit"
                                        disabled={status === 'sending' || !kvkkAccepted}
                                        className="w-full btn-azure !py-3.5 shadow-md shadow-azure-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Soruyu İlet</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
