import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemberAuth } from '@forlabs/core'
import { UserPlus, Eye, EyeOff, Loader2, ShieldCheck, Check } from 'lucide-react'

export default function RegisterPage() {
    const { register } = useMemberAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [consents, setConsents] = useState({
        kvkk: false,
        terms: false,
    })
    const allConsented = consents.kvkk && consents.terms

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.full_name || !form.email || !form.password) {
            setError('Zorunlu alanları doldurun.')
            return
        }
        if (form.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.')
            return
        }
        if (form.password !== form.confirmPassword) {
            setError('Şifreler eşleşmiyor.')
            return
        }
        if (!allConsented) {
            setError('Devam etmek için KVKK Aydınlatma Metni ve Kullanım Koşulları onayları gereklidir.')
            return
        }

        setLoading(true)
        try {
            await register({
                full_name: form.full_name,
                email: form.email,
                password: form.password,
                phone: form.phone || undefined,
                company_name: form.company_name || undefined,
            })
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
                        <UserPlus className="w-7 h-7 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Hesap Oluştur</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        For-Labs Ekosistemine kayıt olun.
                        <br />
                        Tek hesapla ATAGO TR, For-Labs ve tüm ekosistem sitelerine erişin.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad *</label>
                            <input
                                name="full_name" value={form.full_name} onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta *</label>
                            <input
                                name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="ornek@sirket.com"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                                <input
                                    name="phone" value={form.phone} onChange={handleChange}
                                    placeholder="+90 5XX"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Firma</label>
                                <input
                                    name="company_name" value={form.company_name} onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şifre *</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="En az 6 karakter"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şifre Tekrar *</label>
                            <input
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                autoComplete="new-password"
                                required
                            />
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
                                        <Link to="/kullanim-kosullari" target="_blank" className="font-medium text-primary-600 hover:underline">Kullanım Koşulları</Link>'nı ve <Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-primary-600 hover:underline">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
                                    </>
                                ),
                            },
                        ] as Array<{ key: 'kvkk' | 'terms'; label: React.ReactNode }>).map(({ key, label }) => (
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

                    <button
                        type="submit"
                        disabled={loading || !allConsented}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md shadow-primary-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Hesap oluşturuluyor...</>
                        ) : (
                            'Kayıt Ol'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-5">
                        Zaten hesabınız var mı?{' '}
                        <Link to="/giris" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                            Giriş Yap
                        </Link>
                    </p>
                </form>

                {/* Trust note */}
                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Bilgileriniz 256-bit SSL ile korunmaktadır.
                </div>
            </div>
        </div>
    )
}
