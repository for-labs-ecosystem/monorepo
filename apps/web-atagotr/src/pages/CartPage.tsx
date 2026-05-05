import { Link } from 'react-router-dom'
import { useCart } from '@forlabs/core'
import { getImageUrl } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'

const VAT_RATE = 0.20

export default function CartPage() {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

    const vatAmount = totalPrice * VAT_RATE / (1 + VAT_RATE)
    const subtotalExVat = totalPrice - vatAmount

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <ShoppingBag className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Sepetiniz Boş</h1>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    Henüz sepetinize ürün eklemediniz. Ürünlerimizi keşfedin ve ihtiyacınız olan cihazları sepetinize ekleyin.
                </p>
                <Link
                    to="/urunler"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md"
                >
                    <ArrowLeft className="w-4 h-4" /> Ürünlere Göz At
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <title>Sepetim — Atago TR</title>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sepetim</h1>
                    <p className="text-slate-500 mt-1">{totalItems} ürün</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                    <Trash2 className="w-4 h-4" /> Sepeti Temizle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 sm:gap-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors"
                        >
                            {/* Image */}
                            <Link
                                to={`/urunler/${item.slug}`}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-lg p-2 flex items-center justify-center shrink-0"
                            >
                                <img
                                    src={getImageUrl(item.image_url)}
                                    alt={item.title}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </Link>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        {item.brand && (
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.brand}</p>
                                        )}
                                        <Link to={`/urunler/${item.slug}`} className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-2">
                                            {item.title}
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        title="Kaldır"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <Minus className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                    </div>

                                    {/* Line total */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900 tabular-nums">
                                            {(item.price * item.quantity).toLocaleString('tr-TR')} {item.currency}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-slate-400">Birim: {item.price.toLocaleString('tr-TR')} {item.currency}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-900 mb-5">Sipariş Özeti</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ara Toplam (KDV Hariç)</span>
                                <span className="font-medium text-slate-900 tabular-nums">{subtotalExVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">KDV (%{VAT_RATE * 100})</span>
                                <span className="font-medium text-slate-900 tabular-nums">{vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kargo</span>
                                <span className="font-medium text-green-600">Ücretsiz</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between">
                                <span className="font-bold text-slate-900">Toplam</span>
                                <span className="text-xl font-extrabold text-primary-700 tabular-nums">{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY</span>
                            </div>
                        </div>

                        <Link
                            to="/odeme"
                            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md shadow-primary-200"
                        >
                            Güvenli Ödeme Adımına Geç
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <Link
                            to="/urunler"
                            className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Alışverişe Devam Et
                        </Link>

                        {/* Trust badges */}
                        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                            {[
                                { icon: ShieldCheck, text: '256-bit SSL ile güvenli ödeme' },
                                { icon: Truck, text: 'Aynı gün kargo imkânı' },
                                { icon: RotateCcw, text: '14 gün koşulsuz iade garantisi' },
                            ].map((b) => (
                                <div key={b.text} className="flex items-center gap-2.5 text-xs text-slate-500">
                                    <b.icon className="w-4 h-4 text-primary-500 shrink-0" />
                                    {b.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
