import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, useMemberAuth, initializeCheckout } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import { ShieldCheck, Lock, ArrowLeft, CreditCard, Loader2, MapPin, Check, Building2 } from 'lucide-react'

interface SavedAddress {
    id: string
    type: 'individual' | 'corporate'
    title: string
    city: string
    district: string
    full_address: string
    company_name?: string
    tax_office?: string
    tax_number?: string
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart()
    const { member } = useMemberAuth()
    const navigate = useNavigate()

    const savedAddresses = useMemo<SavedAddress[]>(() => {
        if (!member?.addresses) return []
        try { return JSON.parse(member.addresses) } catch { return [] }
    }, [member?.addresses])

    const [form, setForm] = useState({
        customer_type: 'individual' as 'individual' | 'corporate',
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        tax_office: '',
        tax_number: '',
        shipping_address: '',
        billing_address: '',
        use_same_address: true,
        city: '',
        district: '',
        zip_code: '',
        notes: '',
    })
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const checkoutCompleted = useRef(false)

    const [consents, setConsents] = useState({
        kvkk: false,
        terms: false,
        privacy: false,
    })
    const allConsented = consents.kvkk && consents.terms && consents.privacy

    useEffect(() => {
        if (member) {
            setForm(prev => ({
                ...prev,
                full_name: prev.full_name || member.full_name || '',
                email: prev.email || member.email || '',
                phone: prev.phone || member.phone || '',
                company_name: prev.company_name || member.company_name || '',
            }))
        }
    }, [member])

    useEffect(() => {
        if (items.length === 0 && !checkoutCompleted.current) navigate('/sepet', { replace: true })
    }, [items, navigate])

    const vatRate = 0.20
    const tax = totalPrice * vatRate
    const grandTotal = totalPrice + tax

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        if (e.target.name === 'shipping_address') setSelectedAddressId(null)
    }

    const handleSelectAddress = (addr: SavedAddress) => {
        setSelectedAddressId(addr.id)
        const fullAddr = [addr.full_address, addr.district, addr.city].filter(Boolean).join(', ')
        setForm(prev => ({
            ...prev,
            shipping_address: fullAddr,
            city: addr.city,
            district: addr.district,
            customer_type: addr.type,
            company_name: addr.company_name || prev.company_name,
            tax_office: addr.tax_office || prev.tax_office,
            tax_number: addr.tax_number || prev.tax_number,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.full_name || !form.email || !form.phone || !form.shipping_address) {
            setError('Lütfen zorunlu alanları doldurun.')
            return
        }
        if (form.customer_type === 'corporate' && (!form.company_name || !form.tax_number)) {
            setError('Kurumsal fatura için şirket adı ve vergi numarası zorunludur.')
            return
        }
        if (!allConsented) {
            setError('Devam etmek için KVKK, Kullanım Koşulları ve Gizlilik Politikası onayları gereklidir.')
            return
        }

        setLoading(true)
        try {
            const finalBilling = form.use_same_address ? form.shipping_address : form.billing_address

            const payload = {
                customer_type: form.customer_type,
                customer_name: form.full_name,
                customer_email: form.email,
                customer_phone: form.phone,
                company_name: form.customer_type === 'corporate' ? form.company_name : '',
                tax_office: form.customer_type === 'corporate' ? form.tax_office : '',
                tax_number: form.customer_type === 'corporate' ? form.tax_number : '',
                shipping_address: form.shipping_address,
                billing_address: finalBilling,
                use_same_address: form.use_same_address,
                notes: form.notes || undefined,
                items: items.map(i => ({ product_id: i.id, qty: i.quantity })),
            }

            const res = await initializeCheckout(payload) as { data?: { checkout_url?: string; checkout_form_content?: string; order_number?: string; message?: string } }

            checkoutCompleted.current = true
            clearCart()

            if (res.data?.checkout_form_content) {
                const content = res.data.checkout_form_content
                if (content.startsWith('http')) {
                    window.location.href = content
                } else {
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = content
                    document.body.appendChild(tempDiv)
                    const scriptSrc = Array.from(tempDiv.querySelectorAll('script')).find((s: HTMLScriptElement) => s.src)?.src
                    if (scriptSrc) {
                        const script = document.createElement('script')
                        script.src = scriptSrc
                        script.async = true
                        document.body.appendChild(script)
                    }
                }
            } else if (res.data?.checkout_url) {
                window.location.href = res.data.checkout_url
            } else if (res.data?.order_number) {
                navigate(`/siparis-basarili?order_number=${res.data.order_number}`)
            } else {
                navigate('/siparis-basarili?order_number=FL-UNKNOWN')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ödeme başlatılamadı. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <title>Güvenli Ödeme — Atago TR</title>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link to="/sepet" className="text-slate-400 hover:text-primary-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Güvenli Ödeme</h1>
                <Lock className="w-4 h-4 text-green-500" />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Left: Form ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Member welcome banner */}
                        {member && (
                            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm shrink-0">
                                    {member.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{member.full_name}</p>
                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                </div>
                            </div>
                        )}

                        {/* İletişim & Fatura Bilgileri */}
                        <section className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-base font-bold text-slate-900 mb-5">İletişim & Fatura Bilgileri</h2>

                            {/* Bireysel / Kurumsal toggle */}
                            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, customer_type: 'individual' }))}
                                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${form.customer_type === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Bireysel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, customer_type: 'corporate' }))}
                                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${form.customer_type === 'corporate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Kurumsal
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ad Soyad *</label>
                                    <input
                                        name="full_name" value={form.full_name} onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">E-posta *</label>
                                    <input
                                        name="email" type="email" value={form.email} onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                                <div className={form.customer_type === 'individual' ? 'sm:col-span-2' : ''}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefon *</label>
                                    <input
                                        name="phone" value={form.phone} onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        placeholder="+90 5XX XXX XX XX"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Kurumsal alanlar */}
                            {form.customer_type === 'corporate' && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                    <div className="sm:col-span-2 flex items-center gap-2 mb-1">
                                        <Building2 className="w-4 h-4 text-violet-500" />
                                        <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Kurumsal Fatura Bilgileri</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Şirket Adı (Fatura Ünvanı) *</label>
                                        <input
                                            name="company_name" value={form.company_name} onChange={handleChange}
                                            required={form.customer_type === 'corporate'}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Şirketinizin tam ünvanını yazınız"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vergi Dairesi *</label>
                                        <input
                                            name="tax_office" value={form.tax_office} onChange={handleChange}
                                            required={form.customer_type === 'corporate'}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Örn: Zincirlikuyu VD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vergi No *</label>
                                        <input
                                            name="tax_number" value={form.tax_number} onChange={handleChange}
                                            required={form.customer_type === 'corporate'}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Teslimat Adresi */}
                        <section className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-base font-bold text-slate-900 mb-5">Teslimat Adresi</h2>

                            {/* Kayıtlı adresler picker */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                                        Kayıtlı Adreslerim
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {savedAddresses.map((addr) => (
                                            <button
                                                type="button"
                                                key={addr.id}
                                                onClick={() => handleSelectAddress(addr)}
                                                className={`text-left rounded-xl border p-3 transition-all ${selectedAddressId === addr.id
                                                    ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-800">{addr.title}</span>
                                                    <span className={`px-1 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${addr.type === 'corporate'
                                                        ? 'bg-violet-100 text-violet-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {addr.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                                                    </span>
                                                    {selectedAddressId === addr.id && (
                                                        <Check className="h-3.5 w-3.5 text-primary-600 ml-auto" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-snug truncate">{addr.full_address}</p>
                                                <p className="text-[10px] text-slate-400">{addr.district}, {addr.city}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teslimat Adresi *</label>
                                    <textarea
                                        name="shipping_address" value={form.shipping_address} onChange={handleChange}
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
                                        placeholder="Açık adresinizi yazınız..."
                                        required
                                    />
                                </div>

                                {/* Fatura adresi aynı mı checkbox */}
                                <label className="flex items-center gap-3 cursor-pointer py-1">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={form.use_same_address}
                                            onChange={(e) => setForm(p => ({ ...p, use_same_address: e.target.checked }))}
                                            className="h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-primary-600 checked:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 cursor-pointer"
                                        />
                                        {form.use_same_address && <Check className="absolute h-3 w-3 text-white pointer-events-none" strokeWidth={3} />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 select-none">
                                        Fatura adresim teslimat adresimle aynı
                                    </span>
                                </label>

                                {!form.use_same_address && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fatura Adresi *</label>
                                        <textarea
                                            name="billing_address" value={form.billing_address} onChange={handleChange}
                                            rows={3}
                                            required={!form.use_same_address}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
                                            placeholder="Fatura adresinizi yazınız..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sipariş Notu</label>
                                    <textarea
                                        name="notes" value={form.notes} onChange={handleChange} rows={2}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
                                        placeholder="Varsa eklemek istediğiniz not..."
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ── Sidebar: Order Summary ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-5">Sipariş Özeti</h2>

                            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 flex items-center justify-center shrink-0">
                                            <img src={getImageUrl(item.image_url)} alt="" className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-900 line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-slate-400">{item.quantity} adet</p>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 tabular-nums shrink-0">
                                            {(item.price * item.quantity).toLocaleString('tr-TR')} {item.currency}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-2.5 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Ara Toplam</span>
                                    <span className="tabular-nums">{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>KDV (%20)</span>
                                    <span className="tabular-nums">{tax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Kargo</span>
                                    <span className="text-green-600 font-medium">Ücretsiz</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 flex justify-between">
                                    <span className="font-bold text-slate-900">Toplam</span>
                                    <span className="text-xl font-extrabold text-primary-700 tabular-nums">
                                        {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY
                                    </span>
                                </div>
                            </div>

                            {/* ── Rıza Onayları ── */}
                            <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Onay Gerekli</p>

                                {([
                                    {
                                        key: 'kvkk' as const,
                                        label: (
                                            <>
                                                <Link to="/kvkk" target="_blank" className="font-medium text-primary-600 hover:underline">KVKK Aydınlatma Metni</Link>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.
                                            </>
                                        ),
                                    },
                                    {
                                        key: 'terms' as const,
                                        label: (
                                            <>
                                                <Link to="/kullanim-kosullari" target="_blank" className="font-medium text-primary-600 hover:underline">Kullanım Koşulları</Link>'nı okudum ve kabul ediyorum.
                                            </>
                                        ),
                                    },
                                    {
                                        key: 'privacy' as const,
                                        label: (
                                            <>
                                                <Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-primary-600 hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                                            </>
                                        ),
                                    },
                                ] as Array<{ key: 'kvkk' | 'terms' | 'privacy'; label: React.ReactNode }>).map(({ key, label }) => (
                                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                                        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={consents[key]}
                                                onChange={(e) => setConsents(p => ({ ...p, [key]: e.target.checked }))}
                                                className="h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-primary-600 checked:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 cursor-pointer"
                                            />
                                            {consents[key] && <Check className="absolute h-2.5 w-2.5 text-white pointer-events-none" strokeWidth={3} />}
                                        </div>
                                        <span className="text-xs text-slate-600 leading-snug select-none">{label}</span>
                                    </label>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !allConsented}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3.5 rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</>
                                ) : (
                                    <><CreditCard className="w-4 h-4" /> Ödemeyi Tamamla</>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                256-bit SSL ile güvenli ödeme
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
