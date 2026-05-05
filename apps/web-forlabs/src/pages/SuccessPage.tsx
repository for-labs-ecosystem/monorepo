import { CheckCircle2, Package, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { useCart } from '@/lib/cart'

export default function SuccessPage() {
    const [searchParams] = useSearchParams()
    const orderNumber = searchParams.get('order_number')
    const { lang } = useLanguage()
    const { clearCart } = useCart()

    useEffect(() => {
        clearCart()
    }, [clearCart])

    return (
        <div className="bg-slate-50 min-h-[70vh] py-20">
            <title>Sipariş Başarılı — For Labs</title>
            <div className="mx-auto max-w-2xl px-6 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>
                </div>

                <h1 className="mb-4 font-serif text-3xl font-medium text-slate-900 lg:text-4xl">
                    {lang === 'tr' ? 'Siparişiniz Alındı' : 'Order Received'}
                </h1>

                <p className="mb-10 text-lg text-slate-500">
                    {lang === 'tr'
                        ? 'Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu ve ödemeniz onaylandı.'
                        : 'Thank you. Your order has been successfully created and your payment is approved.'}
                </p>

                <div className="mb-10 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-center gap-3 text-brand-600">
                        <Package className="h-6 w-6" />
                        <span className="font-mono text-xl font-bold">{orderNumber || 'FL-UNKNOWN'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-1 text-[13px] font-medium text-slate-500">
                                {lang === 'tr' ? 'Sipariş Durumu' : 'Order Status'}
                            </p>
                            <p className="flex items-center gap-2 text-[14px] font-bold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                {lang === 'tr' ? 'Onaylandı' : 'Approved'}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="mb-1 text-[13px] font-medium text-slate-500">
                                {lang === 'tr' ? 'Ödeme Yöntemi' : 'Payment Method'}
                            </p>
                            <p className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                                <ShieldCheck className="h-4 w-4 text-brand-500" />
                                {lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Payment'}
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-[14px] leading-relaxed text-slate-500">
                        {lang === 'tr'
                            ? 'Siparişinizin detayları elektronik posta adresinize gönderilmiştir. Hesabınızdan sipariş durumunu takip edebilirsiniz.'
                            : 'Order details have been sent to your email address. You can track your order status from your account.'}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        to="/urunler"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-[15px] font-bold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 sm:w-auto"
                    >
                        {lang === 'tr' ? 'Alışverişe Devam Et' : 'Continue Shopping'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        to="/"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-[15px] font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                    >
                        {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Home'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
