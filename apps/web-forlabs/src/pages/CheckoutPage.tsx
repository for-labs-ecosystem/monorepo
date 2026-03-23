import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Lock, Loader2, Check, MapPin } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useLanguage } from '@/lib/i18n'
import { initializeCheckout } from '@/lib/api'
import { useMemberAuth } from '@/lib/auth'
import { getImageUrl } from '@/lib/utils'

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
    const { items, totalPrice, totalItems } = useCart()
    const { lang } = useLanguage()
    const { member } = useMemberAuth()
    const navigate = useNavigate()

    // Parse saved addresses from member profile
    const savedAddresses = useMemo<SavedAddress[]>(() => {
        if (!member?.addresses) return []
        try { return JSON.parse(member.addresses) } catch { return [] }
    }, [member?.addresses])

    const [form, setForm] = useState({
        customer_type: 'individual',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        billing_address: '',
        use_same_address: true,
        company_name: '',
        tax_office: '',
        tax_number: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

    const [consents, setConsents] = useState({
        kvkk: false,
        terms: false,
        privacy: false,
    })
    const allConsented = consents.kvkk && consents.terms && consents.privacy

    // Auto-fill form when member is available
    useEffect(() => {
        if (member) {
            setForm(prev => ({
                ...prev,
                customer_name: prev.customer_name || member.full_name || '',
                customer_email: prev.customer_email || member.email || '',
                customer_phone: prev.customer_phone || member.phone || '',
                company_name: prev.company_name || member.company_name || '',
            }))
        }
    }, [member])

    useEffect(() => {
        document.title = lang === 'tr' ? 'Güvenli Ödeme | For Labs' : 'Secure Checkout | For Labs'
        if (items.length === 0) {
            navigate('/sepet', { replace: true })
        }
    }, [lang, items, navigate])

    const handleSelectAddress = (addr: SavedAddress) => {
        setSelectedAddressId(addr.id)
        const fullAddr = [addr.full_address, addr.district, addr.city].filter(Boolean).join(', ')
        setForm(prev => ({
            ...prev,
            shipping_address: fullAddr,
            customer_type: addr.type,
            company_name: addr.company_name || prev.company_name,
            tax_office: addr.tax_office || prev.tax_office,
            tax_number: addr.tax_number || prev.tax_number,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!allConsented) {
            setError(
                lang === 'tr'
                    ? 'Devam etmek için KVKK, Kullanım Koşulları ve Gizlilik Politikası onayları gereklidir.'
                    : 'You must accept the KVKK, Terms of Use and Privacy Policy to continue.'
            )
            return
        }

        setLoading(true)
        setError(null)

        try {
            const finalBilling = form.use_same_address ? form.shipping_address : form.billing_address
            const finalCompany = form.customer_type === 'corporate' ? form.company_name : ''
            const finalTaxOffice = form.customer_type === 'corporate' ? form.tax_office : ''
            const finalTaxNumber = form.customer_type === 'corporate' ? form.tax_number : ''

            const body = {
                ...form,
                billing_address: finalBilling,
                company_name: finalCompany,
                tax_office: finalTaxOffice,
                tax_number: finalTaxNumber,
                items: items.map(item => ({ product_id: item.id, qty: item.quantity })),
            }

            const res = await initializeCheckout(body)

            if (res.data.checkout_form_content) {
                if (res.data.checkout_form_content.startsWith('http')) {
                    window.location.href = res.data.checkout_form_content
                } else {
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = res.data.checkout_form_content
                    document.body.appendChild(tempDiv)
                    const scriptSource = Array.from(tempDiv.querySelectorAll('script')).find(s => s.src)?.src
                    if (scriptSource) {
                        const script = document.createElement('script')
                        script.src = scriptSource
                        script.async = true
                        document.body.appendChild(script)
                    }
                }
            } else if (res.data.message && res.data.message.includes('Iyzico keys not configured')) {
                navigate(`/siparis-basarili?order_number=${res.data.order_number}`)
            }

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Ödeme başlatılırken bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        // If user manually edits address, unselect saved address
        if (e.target.name === 'shipping_address') {
            setSelectedAddressId(null)
        }
    }

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: currency || 'TRY',
        }).format(price)
    }

    const subtotal = totalPrice
    const tax = subtotal * 0.20
    const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 500
    const grandTotal = subtotal + tax + shipping
    const currency = items[0]?.currency || 'TRY'

    return (
        <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-medium text-slate-900 lg:text-4xl">
                            {lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Checkout'}
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-[14px] text-slate-500">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            {lang === 'tr' ? 'Iyzico güvencesiyle şifrelenir.' : 'Secured by Iyzico.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
                    {/* Form Section */}
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm lg:col-span-7 xl:col-span-8 lg:p-10">

                        {/* Logged-in user welcome banner */}
                        {member && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                                    {member.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{member.full_name}</p>
                                    <p className="text-xs text-slate-500">{member.email}</p>
                                </div>
                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-md">
                                    {lang === 'tr' ? 'Üye' : 'Member'}
                                </span>
                            </div>
                        )}

                        <h2 className="mb-6 text-xl font-medium text-slate-900">
                            {lang === 'tr' ? 'İletişim & Teslimat Bilgileri' : 'Contact & Shipping Info'}
                        </h2>

                        {error && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-[14px] font-medium text-red-600 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Kurumsal / Bireysel Seçimi */}
                            <div className="flex rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, customer_type: 'individual' }))}
                                    className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-all ${form.customer_type === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {lang === 'tr' ? 'Bireysel' : 'Individual'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, customer_type: 'corporate' }))}
                                    className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-all ${form.customer_type === 'corporate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {lang === 'tr' ? 'Kurumsal' : 'Corporate'}
                                </button>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700">
                                        {lang === 'tr' ? 'Ad Soyad' : 'Full Name'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        name="customer_name"
                                        value={form.customer_name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                        placeholder={lang === 'tr' ? 'Adınız ve soyadınız' : 'Your full name'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700">
                                        {lang === 'tr' ? 'E-posta' : 'Email'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        name="customer_email"
                                        value={form.customer_email}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                        placeholder="ornek@sirket.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700">
                                    {lang === 'tr' ? 'Telefon Numarası' : 'Phone Number'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    name="customer_phone"
                                    value={form.customer_phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                    placeholder="+90 555 000 0000"
                                />
                            </div>

                            {form.customer_type === 'corporate' && (
                                <div className="grid gap-6 md:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/50 p-5 mt-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[13px] font-bold text-slate-700">
                                            {lang === 'tr' ? 'Şirket Adı (Fatura Ünvanı)' : 'Company Name'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required={form.customer_type === 'corporate'}
                                            name="company_name"
                                            value={form.company_name}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                            placeholder={lang === 'tr' ? 'Şirketinizin tam ünvanını yazınız' : 'Full company name'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-700">
                                            {lang === 'tr' ? 'Vergi Dairesi' : 'Tax Office'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required={form.customer_type === 'corporate'}
                                            name="tax_office"
                                            value={form.tax_office}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                            placeholder={lang === 'tr' ? 'Örn: Zincirlikuyu VD' : 'Tax office'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-700">
                                            {lang === 'tr' ? 'Vergi No' : 'Tax NO'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required={form.customer_type === 'corporate'}
                                            name="tax_number"
                                            value={form.tax_number}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Saved Addresses Picker */}
                            {savedAddresses.length > 0 && (
                                <div>
                                    <label className="text-[13px] font-bold text-slate-700 mb-2 block">
                                        <MapPin className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                                        {lang === 'tr' ? 'Kayıtlı Adreslerim' : 'My Saved Addresses'}
                                    </label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {savedAddresses.map((addr) => (
                                            <button
                                                type="button"
                                                key={addr.id}
                                                onClick={() => handleSelectAddress(addr)}
                                                className={`text-left rounded-xl border p-3 transition-all ${selectedAddressId === addr.id
                                                    ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-800">{addr.title}</span>
                                                    <span className={`px-1 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${addr.type === 'corporate'
                                                        ? 'bg-violet-100 text-violet-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {addr.type === 'corporate' ? (lang === 'tr' ? 'Kurumsal' : 'Corp.') : (lang === 'tr' ? 'Bireysel' : 'Individual')}
                                                    </span>
                                                    {selectedAddressId === addr.id && (
                                                        <Check className="h-3.5 w-3.5 text-brand-600 ml-auto" />
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
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700">
                                        {lang === 'tr' ? 'Teslimat Adresi' : 'Shipping Address'} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        name="shipping_address"
                                        value={form.shipping_address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                        placeholder={lang === 'tr' ? 'Açık adresinizi yazınız...' : 'Enter your shipping address...'}
                                    />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer py-1">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={form.use_same_address}
                                            onChange={(e) => setForm(p => ({ ...p, use_same_address: e.target.checked }))}
                                            className="h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-brand-600 checked:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:ring-offset-2 hover:border-brand-500 cursor-pointer"
                                        />
                                        {form.use_same_address && <Check className="absolute h-3 w-3 text-white pointer-events-none" strokeWidth={3} />}
                                    </div>
                                    <span className="text-[14px] font-medium text-slate-700 select-none">
                                        {lang === 'tr' ? 'Fatura adresim teslimat adresimle aynı' : 'My billing address is same as shipping address'}
                                    </span>
                                </label>

                                {!form.use_same_address && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[13px] font-bold text-slate-700">
                                            {lang === 'tr' ? 'Fatura Adresi' : 'Billing Address'} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required={!form.use_same_address}
                                            name="billing_address"
                                            value={form.billing_address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                            placeholder={lang === 'tr' ? 'Fatura adresinizi yazınız...' : 'Enter your billing address...'}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ── Rıza Onayları ── */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {lang === 'tr' ? 'Onay Gerekli' : 'Required Consents'}
                                </p>

                                {([
                                    {
                                        key: 'kvkk' as const,
                                        label: lang === 'tr' ? (
                                            <><Link to="/kvkk" target="_blank" className="font-medium text-brand-600 hover:underline">KVKK Aydınlatma Metni</Link>'ni okudum, kişisel verilerimin işlenmesine onay veriyorum.</>
                                        ) : (
                                            <>I have read and consent to the processing of my personal data as described in the <Link to="/kvkk" target="_blank" className="font-medium text-brand-600 hover:underline">Data Protection Notice</Link>.</>
                                        ),
                                    },
                                    {
                                        key: 'terms' as const,
                                        label: lang === 'tr' ? (
                                            <><Link to="/kullanim-kosullari" target="_blank" className="font-medium text-brand-600 hover:underline">Kullanım Koşulları</Link>'nı okudum ve kabul ediyorum.</>
                                        ) : (
                                            <>I have read and accept the <Link to="/kullanim-kosullari" target="_blank" className="font-medium text-brand-600 hover:underline">Terms of Use</Link>.</>
                                        ),
                                    },
                                    {
                                        key: 'privacy' as const,
                                        label: lang === 'tr' ? (
                                            <><Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-brand-600 hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.</>
                                        ) : (
                                            <>I have read and accept the <Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>.</>
                                        ),
                                    },
                                ] as Array<{ key: 'kvkk' | 'terms' | 'privacy'; label: React.ReactNode }>).map(({ key, label }) => (
                                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                                        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={consents[key]}
                                                onChange={(e) => setConsents(p => ({ ...p, [key]: e.target.checked }))}
                                                className="h-4 w-4 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-brand-600 checked:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 cursor-pointer"
                                            />
                                            {consents[key] && <Check className="absolute h-2.5 w-2.5 text-white pointer-events-none" strokeWidth={3} />}
                                        </div>
                                        <span className="text-[12px] text-slate-600 leading-snug select-none">{label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !allConsented}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-[15px] font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {lang === 'tr' ? 'İleri: Kredi Kartı Bilgileri' : 'Continue to Payment'}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                                <p className="mt-4 text-center text-[12px] text-slate-500">
                                    {lang === 'tr' ? 'Bir sonraki adımda güvenli ödeme sayfasına yönlendirileceksiniz.' : 'You will be redirected to the secure payment page in the next step.'}
                                </p>
                            </div>
                        </form>

                        <div className="mt-8 flex justify-center pt-2 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <div className="flex items-center tracking-[-0.05em] text-[#003C9E]">
                                <span className="text-xl font-black">iyzi</span>
                                <span className="text-xl font-medium">co</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sticky Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-28 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/40 lg:p-8">
                            <h3 className="mb-6 text-lg font-bold text-slate-900">
                                {lang === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                            </h3>

                            <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-1">
                                                {item.image_url ? (
                                                    <img src={getImageUrl(item.image_url)} alt={item.title} className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <span className="text-[8px] text-slate-300">Görsel</span>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col justify-center space-y-1">
                                                <div className="line-clamp-2 text-[13px] font-medium text-slate-900 leading-snug">
                                                    {item.title}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[12px] text-slate-500">Adet: {item.quantity}</span>
                                                    <span className="font-bold text-slate-900">{formatPrice(item.price * item.quantity, item.currency)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 text-[14px] border-t border-slate-100 pt-6">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{lang === 'tr' ? 'Ara Toplam' : 'Subtotal'} ({totalItems} ürün)</span>
                                    <span className="font-medium text-slate-900">{formatPrice(subtotal, currency)}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{lang === 'tr' ? 'Kargo' : 'Shipping'}</span>
                                    <span className="text-[13px] text-slate-900 font-medium">
                                        {shipping === 0 ? (lang === 'tr' ? 'Ücretsiz' : 'Free') : formatPrice(shipping, currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{lang === 'tr' ? 'KDV (%20)' : 'Tax (20%)'}</span>
                                    <span className="text-[13px] text-slate-900 font-medium">{formatPrice(tax, currency)}</span>
                                </div>

                                <div className="my-4 h-px bg-slate-100" />

                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-slate-900">
                                            {lang === 'tr' ? 'Genel Toplam' : 'Total'}
                                        </span>
                                        <span className="text-[11px] text-slate-500">(KDV Dahil)</span>
                                    </div>
                                    <span className="text-3xl font-black text-brand-600 tracking-tight">
                                        {formatPrice(grandTotal, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
