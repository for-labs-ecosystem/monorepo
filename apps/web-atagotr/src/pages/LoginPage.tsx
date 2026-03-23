import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemberAuth } from '@forlabs/core'
import { LogIn, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const { login, isLoading: authLoading } = useMemberAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('E-posta ve şifre zorunludur.')
            return
        }

        setLoading(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Giriş yapılamadı. Bilgilerinizi kontrol edin.')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
                        <LogIn className="w-7 h-7 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Giriş Yap</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        For-Labs Ekosistemine hoş geldiniz.
                        <br />
                        Tek hesapla tüm ekosistem sitelerine erişin.
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
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta Adresi</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@sirket.com"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Şifre</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Şifrenizi girin"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    autoComplete="current-password"
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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md shadow-primary-200 disabled:opacity-60"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor...</>
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-5">
                        Hesabınız yok mu?{' '}
                        <Link to="/kayit" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                            Ücretsiz Kayıt Ol
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
