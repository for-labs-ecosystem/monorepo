import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, CheckCircle, Loader2, Tag, Sprout, Building2 } from 'lucide-react'
import { submitInquiry } from '@forlabs/core'
import { getImageUrl, formatPrice } from '@/lib/utils'

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
    type?: 'product_quote' | 'service_quote'
}

export default function QuoteModal({ open, onClose, product, type = 'product_quote' }: QuoteModalProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [company, setCompany] = useState('')
    const [message, setMessage] = useState('')
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const honeypotRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    const resetForm = () => {
        setName(''); setEmail(''); setPhone(''); setCompany(''); setMessage('')
        setKvkkAccepted(false); setStatus('idle')
    }

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
                company,
                message,
                product_id: product.id,
                product_name: product.title,
                type,
            })
            setStatus('success')
            setTimeout(() => { onClose(); resetForm() }, 2500)
        } catch {
            setStatus('error')
        }
    }

    if (!open) return null

    const imgSrc = product.image_url ? getImageUrl(product.image_url) : null
    const priceLabel = product.price ? formatPrice(product.price, product.currency || 'TRY') : null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-forest-900/40 backdrop-blur-md" onClick={onClose} />

            <div
                className="relative w-full max-w-3xl bg-oat-50 shadow-[0_32px_80px_-12px_rgba(26,51,32,0.35)] border border-stone-200 overflow-hidden animate-fade-in-up flex flex-col max-h-[92dvh]"
                style={{ borderTopLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-oat-100 hover:bg-sage-100 text-stone-500 hover:text-forest-900 transition-all duration-200 z-10"
                    style={{ borderTopLeftRadius: '0.6rem', borderBottomRightRadius: '0.6rem' }}
                    aria-label="Kapat"
                >
                    <X className="w-4 h-4" />
                </button>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 bg-sage-100 flex items-center justify-center mb-6"
                             style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                            <CheckCircle className="w-10 h-10 text-sage-600" />
                        </div>
                        <h3 className="heading-serif text-2xl mb-3">Talebiniz Alındı!</h3>
                        <p className="text-stone-600 leading-relaxed max-w-xs">
                            Uzman ekibimiz talebinizi inceleyecek, en kısa sürede size özel teklifle dönüş yapacak.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row overflow-auto">
                        {/* Sol: Ürün preview */}
                        <div className="sm:w-72 shrink-0 bg-gradient-to-br from-sage-50 via-oat-50 to-harvest-50 flex flex-col border-b sm:border-b-0 sm:border-r border-stone-200">
                            <div className="h-52 sm:h-64 flex items-center justify-center p-8 relative overflow-hidden">
                                <div className="glow-sage" style={{ width: 280, height: 280, top: '-20%', left: '-30%' }} />
                                {imgSrc ? (
                                    <img src={imgSrc} alt={product.title} className="relative max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-md" />
                                ) : (
                                    <div className="relative w-24 h-24 bg-sage-100 flex items-center justify-center"
                                         style={{ borderTopLeftRadius: '1.25rem', borderBottomRightRadius: '1.25rem' }}>
                                        <Sprout className="w-10 h-10 text-sage-500" />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-4 flex flex-col flex-1">
                                <div>
                                    <p className="label-eyebrow mb-1.5">Talep Edilen Ürün</p>
                                    <h3 className="text-[15px] font-bold text-forest-900 leading-snug heading-serif">{product.title}</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {product.brand && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 bg-oat-50 border border-stone-200 px-2.5 py-1"
                                              style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                                            <Building2 className="w-3 h-3 text-stone-400" />
                                            {product.brand}
                                        </span>
                                    )}
                                    {product.sku && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 bg-oat-200 border border-stone-200 px-2.5 py-1 font-mono"
                                              style={{ borderTopLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                                            <Tag className="w-3 h-3" />
                                            {product.sku}
                                        </span>
                                    )}
                                </div>

                                {product.description && (
                                    <p className="text-[12px] text-stone-600 leading-relaxed line-clamp-4">{product.description}</p>
                                )}

                                {priceLabel && (
                                    <div className="mt-auto pt-4 border-t border-stone-200">
                                        <p className="label-eyebrow mb-1">Liste Fiyatı</p>
                                        <p className="text-xl font-bold text-sage-700 heading-serif">{priceLabel}</p>
                                        <p className="text-[10px] text-stone-400 mt-0.5">Teklif fiyatı farklı olabilir</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sağ: Form */}
                        <div className="flex-1 flex flex-col overflow-auto">
                            <div className="p-7 lg:p-9">
                                <h2 className="heading-serif text-2xl mb-1">Sipariş Formu</h2>
                                <p className="text-[13px] text-stone-500 mb-7 leading-relaxed">
                                    Bilgilerinizi doldurun, ekibimiz size en kısa sürede dönüş yapsın.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Ad Soyad *</label>
                                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız ve soyadınız" className="input-organic" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-eyebrow block mb-1.5">E-posta *</label>
                                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@firma.com" className="input-organic" />
                                        </div>
                                        <div>
                                            <label className="label-eyebrow block mb-1.5">Telefon *</label>
                                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className="input-organic" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Firma</label>
                                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Firma adı (opsiyonel)" className="input-organic" />
                                    </div>

                                    <div>
                                        <label className="label-eyebrow block mb-1.5">Mesajınız</label>
                                        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Adet, teslimat beklentisi veya ek talepleriniz..." className="input-organic resize-none" />
                                    </div>

                                    <div className="absolute opacity-0 -z-10 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                        <label>Lütfen bu alanı boş bırakın
                                            <input type="text" name="fax_number" ref={honeypotRef} autoComplete="off" tabIndex={-1} />
                                        </label>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                                        <input type="checkbox" checked={kvkkAccepted} onChange={(e) => setKvkkAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 border-stone-300 accent-sage-600 cursor-pointer" />
                                        <span className="text-[11.5px] text-stone-500 leading-relaxed group-hover:text-stone-700 transition-colors">
                                            <strong className="text-forest-800">KVKK Aydınlatma Metni</strong>'ni okudum,
                                            kişisel verilerimin işlenmesine onay veriyorum.
                                        </span>
                                    </label>

                                    {status === 'error' && (
                                        <p className="text-sm text-harvest-700 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                                    )}

                                    <button type="submit" disabled={status === 'sending' || !kvkkAccepted} className="w-full btn-organic disabled:opacity-40 disabled:cursor-not-allowed mt-1">
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Sipariş Talebini Gönder</>
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
