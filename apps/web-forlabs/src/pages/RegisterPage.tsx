import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, Building2, AlertCircle, Check } from 'lucide-react'
import { useLanguage, t } from '@/lib/i18n'
import { useMemberAuth } from '@/lib/auth'

export default function RegisterPage() {
    const { lang } = useLanguage()
    const { register, loginWithGoogle } = useMemberAuth()
    const navigate = useNavigate()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [consents, setConsents] = useState({
        kvkk: false,
        terms: false,
    })
    const allConsented = consents.kvkk && consents.terms

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!allConsented) {
            setError(
                lang === 'tr'
                    ? 'Devam etmek için KVKK Aydınlatma Metni ve Kullanım Koşulları onayları gereklidir.'
                    : 'You must accept the KVKK Notice and Terms of Use to continue.'
            )
            return
        }
        setLoading(true)
        try {
            await register({
                full_name: fullName,
                email,
                password,
                phone: phone || undefined,
                company_name: companyName || undefined,
            })
            navigate('/hesabim')
        } catch (err: any) {
            setError(err.message || 'Kayıt oluşturulamadı.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <title>Kayıt Ol — For Labs</title>
            <div className="w-full max-w-md">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    {t('common.home', lang)}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-medium text-slate-900 mb-2">
                        {t('auth.registerTitle', lang)}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {t('auth.hasAccount', lang)}{' '}
                        <Link to="/giris-yap" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                            {t('auth.loginLink', lang)}
                        </Link>
                    </p>
                </div>

                {/* Google Button */}
                <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {t('auth.googleLogin', lang)}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                            {t('auth.orSeparator', lang)}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                            {t('auth.fullName', lang)} *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                            {t('auth.email', lang)} *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                            {t('auth.password', lang)} *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="En az 6 karakter"
                                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                                {t('auth.phone', lang)}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="05XX XXX XXXX"
                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                                {t('auth.companyName', lang)}
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                                />
                            </div>
                        </div>
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
                                    <>I have read and consent to the <Link to="/kvkk" target="_blank" className="font-medium text-brand-600 hover:underline">Data Protection Notice</Link>.</>
                                ),
                            },
                            {
                                key: 'terms' as const,
                                label: lang === 'tr' ? (
                                    <><Link to="/kullanim-kosullari" target="_blank" className="font-medium text-brand-600 hover:underline">Kullanım Koşulları</Link>'nı ve <Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-brand-600 hover:underline">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.</>
                                ) : (
                                    <>I have read and accept the <Link to="/kullanim-kosullari" target="_blank" className="font-medium text-brand-600 hover:underline">Terms of Use</Link> and <Link to="/gizlilik-politikasi" target="_blank" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>.</>
                                ),
                            },
                        ] as Array<{ key: 'kvkk' | 'terms'; label: React.ReactNode }>).map(({ key, label }) => (
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

                    <button
                        type="submit"
                        disabled={loading || !allConsented}
                        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? t('auth.registering', lang) : t('auth.registerBtn', lang)}
                    </button>
                </form>
            </div>
        </div>
    )
}
