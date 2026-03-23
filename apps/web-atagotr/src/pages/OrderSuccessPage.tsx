import { useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCart } from '@forlabs/core'

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams()
    const orderNumber = searchParams.get('order_number')
    const navigate = useNavigate()
    const { clearCart } = useCart()

    useEffect(() => {
        clearCart()
    }, [clearCart])

    useEffect(() => {
        document.title = 'Siparişiniz Alındı | ATAGO TR'
        if (!orderNumber) navigate('/', { replace: true })
    }, [orderNumber, navigate])

    if (!orderNumber) return null

    return (
        <div className="bg-slate-50 min-h-[75vh] py-20">
            <div className="mx-auto max-w-2xl px-6 text-center">

                {/* Animated check */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>
                </div>

                <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                    Siparişiniz Alındı
                </h1>
                <p className="mb-10 text-lg text-slate-500">
                    Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu ve ekibimize iletildi.
                </p>

                {/* Order card */}
                <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                    <div className="mb-6 flex items-center justify-center gap-3 text-primary-600">
                        <Package className="h-6 w-6" />
                        <span className="font-mono text-xl font-bold tracking-wide">{orderNumber}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-1 text-[13px] font-medium text-slate-500">Sipariş Durumu</p>
                            <p className="flex items-center gap-2 text-[14px] font-bold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Onaylandı
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-1 text-[13px] font-medium text-slate-500">Ödeme Yöntemi</p>
                            <p className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                                <ShieldCheck className="h-4 w-4 text-primary-500" />
                                Güvenli Ödeme
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-[14px] leading-relaxed text-slate-500">
                        Siparişinizin detayları elektronik posta adresinize gönderilmiştir.
                        Hesabınızdan sipariş durumunu takip edebilirsiniz.
                    </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        to="/urunler"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-[15px] font-bold text-white transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 sm:w-auto"
                    >
                        Alışverişe Devam Et
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        to="/hesabim"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-[15px] font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>

            </div>
        </div>
    )
}
