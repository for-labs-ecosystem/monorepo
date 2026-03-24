import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMemberAuth } from '@forlabs/core'
import { Loader2, AlertCircle } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
    oauth_cancelled: 'Google ile giriş iptal edildi.',
    oauth_config: 'Google OAuth yapılandırma hatası.',
    oauth_token: 'Google token alınamadı. Lütfen tekrar deneyin.',
    oauth_userinfo: 'Google hesap bilgisi alınamadı.',
    account_disabled: 'Hesabınız devre dışı bırakılmıştır.',
    oauth_error: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.',
}

export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { loginWithToken } = useMemberAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = searchParams.get('token')
        const errorCode = searchParams.get('error')

        const run = async () => {
            if (errorCode) {
                setError(ERROR_MESSAGES[errorCode] || 'Giriş sırasında bir hata oluştu.')
                return
            }
            if (!token) {
                setError('Geçersiz giriş yanıtı.')
                return
            }
            try {
                await loginWithToken(token)
                navigate('/hesabim', { replace: true })
            } catch {
                setError('Oturum açılamadı. Lütfen tekrar deneyin.')
            }
        }

        run()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle className="h-7 w-7 text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">Giriş Yapılamadı</h2>
                    <p className="text-sm text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/giris')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-sm text-slate-500">Giriş yapılıyor...</p>
            </div>
        </div>
    )
}
