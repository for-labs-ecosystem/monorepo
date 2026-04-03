import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, CheckCircle, Loader2, Tag, Microscope, Building2 } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'

export interface QuoteProduct {
    id: number
    title: string
    image_url?: string | null
    brand?: string | null
    model_number?: string | null
    description?: string | null
    price?: number | null
    currency?: string | null
    sku?: string | null
}

interface QuoteModalProps {
    open: boolean
    onClose: () => void
    product: QuoteProduct
}

export default function QuoteModal({ open, onClose, product }: QuoteModalProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    // Body scroll kilit
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    // ESC tuşu ile kapat
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
                product_id: product.id,
                product_name: product.title,
                type: 'product_quote',
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

    const imgSrc = product.image_url ? getImageUrl(product.image_url) : null
    const priceLabel = product.price
        ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: product.currency || 'TRY', maximumFractionDigits: 0 }).format(product.price)
        : null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel — 2-column wide card */}
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.22)] overflow-hidden animate-fade-in-up flex flex-col max-h-[92dvh]">

                {/* Kapat butonu */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all duration-200 z-10"
                    aria-label="Kapat"
                >
                    <X className="w-4 h-4" />
                </button>

                {status === 'success' ? (
                    /* Başarı ekranı */
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-3">Talebiniz Alındı!</h3>
                        <p className="text-slate-400 leading-relaxed max-w-xs">
                            Uzman ekibimiz talebinizi inceleyecek, kısa sürede size özel fiyat teklifiyle dönüş yapacak.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row overflow-auto">

                        {/* Sol: Ürün Preview */}
                        <div className="sm:w-72 shrink-0 bg-gradient-to-br from-slate-50 to-orange-50/20 flex flex-col border-b sm:border-b-0 sm:border-r border-slate-100">
                            {/* Ürün görseli */}
                            <div className="h-52 sm:h-64 flex items-center justify-center p-8 bg-gradient-to-br from-orange-50/40 via-white to-slate-50/60">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={product.title}
                                        className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-sm"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <Microscope className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                            </div>

                            {/* Ürün bilgileri */}
                            <div className="p-6 space-y-4 flex flex-col flex-1">
                                <div>
                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Teklif İstenen Ürün</p>
                                    <h3 className="text-[15px] font-bold text-slate-700 leading-snug">{product.title}</h3>
                                </div>

                                {/* Meta badges */}
                                <div className="flex flex-wrap gap-2">
                                    {product.brand && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                                            <Building2 className="w-3 h-3 text-slate-400" />
                                            {product.brand}
                                        </span>
                                    )}
                                    {product.sku && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full font-mono">
                                            <Tag className="w-3 h-3" />
                                            {product.sku}
                                        </span>
                                    )}
                                </div>

                                {product.description && (
                                    <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-4">{product.description}</p>
                                )}

                                {priceLabel && (
                                    <div className="mt-auto pt-4 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Liste Fiyatı</p>
                                        <p className="text-xl font-bold text-orange-500">{priceLabel}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Teklif fiyatı farklı olabilir</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sağ: Form */}
                        <div className="flex-1 flex flex-col overflow-auto">
                            <div className="p-7 lg:p-9">
                                <h2 className="text-xl font-bold text-slate-700 mb-1">Teklif Formu</h2>
                                <p className="text-[13px] text-slate-400 mb-7 leading-relaxed">
                                    Bilgilerinizi doldurun, ekibimiz size özel fiyat teklifiyle en kısa sürede dönüş yapsın.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
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
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">E-posta *</label>
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
                                            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
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
                                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Mesajınız</label>
                                        <textarea
                                            rows={3}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Adet, teslimat beklentisi veya ek talepleriniz..."
                                            className="input-soft w-full resize-none"
                                        />
                                    </div>

                                    {/* Honeypot */}
                                    <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                        <label>Lütfen bu alanı boş bırakın
                                            <input type="text" name="fax_number" ref={honeypotRef} autoComplete="off" tabIndex={-1} />
                                        </label>
                                    </div>

                                    {/* KVKK */}
                                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                                        <input
                                            type="checkbox"
                                            checked={kvkkAccepted}
                                            onChange={(e) => setKvkkAccepted(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-orange-500 cursor-pointer"
                                        />
                                        <span className="text-[11.5px] text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                                            <strong className="text-slate-500">KVKK Aydınlatma Metni</strong>'ni okudum,
                                            kişisel verilerimin işlenmesine onay veriyorum.
                                        </span>
                                    </label>

                                    {status === 'error' && (
                                        <p className="text-sm text-red-500 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending' || !kvkkAccepted}
                                        className="w-full btn-warm disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Teklif Talebini Gönder</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
