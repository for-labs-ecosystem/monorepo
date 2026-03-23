import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useLanguage } from '@/lib/i18n'
import { getImageUrl } from '@/lib/utils'
import { useEffect } from 'react'

export default function CartPage() {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
    const { lang } = useLanguage()
    const navigate = useNavigate()

    useEffect(() => {
        document.title = lang === 'tr' ? 'Sepetim | For Labs' : 'My Cart | For Labs'
    }, [lang])

    if (items.length === 0) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                    <ShoppingBag className="h-10 w-10" />
                </div>
                <h2 className="mt-6 font-serif text-2xl font-medium text-slate-900">
                    {lang === 'tr' ? 'Sepetiniz henüz boş' : 'Your cart is empty'}
                </h2>
                <p className="mt-2 text-[15px] text-slate-500 text-center max-w-md">
                    {lang === 'tr'
                        ? 'For Labs ekosistemindeki binlerce laboratuvar cihazı ve sarf malzemesini inceleyebilirsiniz.'
                        : 'You can explore thousands of laboratory devices and consumables in the For Labs ecosystem.'}
                </p>
                <Link
                    to="/urunler"
                    className="mt-8 flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20"
                >
                    {lang === 'tr' ? 'Ürünleri İncele' : 'Explore Products'}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        )
    }

    // Format currency
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
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-medium text-slate-900 lg:text-4xl">
                            {lang === 'tr' ? 'Alışveriş Sepeti' : 'Shopping Cart'}
                        </h1>
                        <p className="mt-2 text-[15px] text-slate-500">
                            {totalItems} {lang === 'tr' ? 'ürün' : 'items'}
                        </p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-[13px] font-medium text-slate-500 underline-offset-4 hover:text-red-500 hover:underline"
                    >
                        {lang === 'tr' ? 'Sepeti Temizle' : 'Clear Cart'}
                    </button>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                                {/* Image */}
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                                    {item.image_url ? (
                                        <img src={getImageUrl(item.image_url)} alt={item.title} className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <span className="text-[10px] font-medium text-slate-400">Görsel Yok</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                                {item.brand || 'STANDART'}
                                            </div>
                                            <Link to={`/urunler/${item.slug}`} className="line-clamp-2 text-[15px] font-medium text-slate-900 transition-colors hover:text-brand-600">
                                                {item.title}
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="mt-1 rounded-full p-2 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 hidden sm:flex"
                                            title="Kaldır"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 sm:pt-2 w-full">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center rounded-lg border border-slate-200">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <div className="flex h-8 w-10 items-center justify-center bg-slate-50 px-2 text-[13px] font-semibold text-slate-900">
                                                {item.quantity}
                                            </div>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">
                                                    {formatPrice(item.price * item.quantity, item.currency)}
                                                </div>
                                                {item.quantity > 1 && (
                                                    <div className="text-[11px] text-slate-500">
                                                        {formatPrice(item.price, item.currency)} / adet
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-slate-400 transition-colors hover:text-red-500 sm:hidden"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Sticky Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-28 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/40">
                            <h3 className="mb-6 text-lg font-bold text-slate-900">
                                {lang === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                            </h3>

                            <div className="space-y-4 text-[14px]">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>{lang === 'tr' ? 'Ara Toplam' : 'Subtotal'}</span>
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
                                    <span className="text-2xl font-black text-brand-600 tracking-tight">
                                        {formatPrice(grandTotal, currency)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/odeme')}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-[15px] font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                            >
                                {lang === 'tr' ? 'Güvenli Ödeme Yap' : 'Proceed to Checkout'}
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-center">
                                    <p className="text-[12px] font-medium text-brand-800 leading-relaxed">
                                        📦 <span className="font-bold">{lang === 'tr' ? 'Teslimat Süresi:' : 'Delivery Time:'}</span> {lang === 'tr' ? 'Stok durumuna göre 1-3 iş günü veya 4-6 hafta.' : '1-3 business days or 4-6 weeks depending on stock.'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-slate-500">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>{lang === 'tr' ? 'Iyzico güvencesiyle şifrelenir.' : 'Secured by Iyzico.'}</span>
                                </div>

                                {/* Iyzico placeholder logos */}
                                <div className="flex items-center justify-center pt-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                    <div className="flex items-center tracking-[-0.05em] text-[#003C9E]">
                                        <span className="text-xl font-black">iyzi</span>
                                        <span className="text-xl font-medium">co</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
