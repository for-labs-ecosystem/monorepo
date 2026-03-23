import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    LogOut,
    Package,
    Heart,
    MessageSquare,
    UserCircle,
    ShoppingBag,
    ShoppingCart,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
    Mail,
    Phone,
    Building2,
    CalendarDays,
    Shield,
    ChevronRight,
    Edit3,
    Save,
    Send,
    Loader2,
    X,
    ReceiptText,
    AlertCircle,
} from 'lucide-react'
import { useMemberAuth, useCart, useProducts, parseFavoriteIds, TOKEN_KEY } from '@forlabs/core'
import type { Product } from '@forlabs/shared'
import { getImageUrl } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedAddress {
    id: string
    type: 'individual' | 'corporate'
    title: string
    city: string
    district: string
    full_address: string
    tax_office?: string
    tax_number?: string
}

interface MemberOrder {
    id: number
    order_number: string
    status: string
    payment_status: string
    total: number
    currency: string
    items: string
    created_at: string
    customer_name: string
    shipping_address: string | null
}

interface MemberOrderDetail extends MemberOrder {
    parsed_items: Array<{
        product_id: number
        title?: string
        product_name?: string
        qty?: number
        quantity?: number
        unit_price?: number
        total_price?: number
    }>
    subtotal?: number
    tax?: number
    billing_address?: string | null
    customer_email?: string
    customer_phone?: string
    notes?: string | null
}

interface MemberInquiry {
    id: number
    status: 'new' | 'read' | 'replied' | 'archived'
    payload: Record<string, string> | null
    created_at: string
    updated_at: string
}

interface InquiryMessage {
    id: number
    sender: 'admin' | 'user'
    message: string
    created_at: string
}

type TabKey = 'orders' | 'favorites' | 'messages' | 'profile'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
}

function formatPrice(amount: number | null | undefined, currency = 'TRY') {
    if (amount == null) return '— ' + currency
    return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency
}

const ORDER_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    delivered: { label: 'Teslim Edildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    shipped:   { label: 'Kargoda',       color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: Truck },
    processing:{ label: 'Hazırlanıyor',  color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: Clock },
    pending:   { label: 'Bekliyor',      color: 'bg-slate-50 text-slate-600 border-slate-200',      icon: Clock },
    cancelled: { label: 'İptal Edildi',  color: 'bg-red-50 text-red-600 border-red-200',            icon: XCircle },
}

function getOrderStatus(status: string) {
    return ORDER_STATUS[status] ?? { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200', icon: Package }
}

// ─── API fetch (token-authenticated) ─────────────────────────────────────────

async function fetchMemberOrders(): Promise<MemberOrder[]> {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('No token')
    const res = await fetch(`${API_BASE}/api/member-auth/orders?site_id=${SITE_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json() as { data?: MemberOrder[]; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'Failed to fetch orders')
    return json.data ?? []
}

async function fetchOrderDetail(orderId: number): Promise<MemberOrderDetail> {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('No token')
    const res = await fetch(`${API_BASE}/api/member-auth/orders/${orderId}?site_id=${SITE_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json() as { data?: MemberOrderDetail; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'Failed to fetch order detail')
    return json.data!
}

async function fetchMemberInquiries(token: string): Promise<MemberInquiry[]> {
    const res = await fetch(`${API_BASE}/api/member-auth/inquiries?site_id=${SITE_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json() as { data?: MemberInquiry[]; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'Failed to fetch inquiries')
    return json.data ?? []
}

async function fetchInquiryMessages(inquiryId: number, token: string): Promise<InquiryMessage[]> {
    const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${inquiryId}/messages?site_id=${SITE_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json() as { data?: InquiryMessage[]; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'Failed to fetch inquiry messages')
    return json.data ?? []
}

async function markInquiryAsRead(inquiryId: number, token: string) {
    const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${inquiryId}/read?site_id=${SITE_ID}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(json.error ?? 'Failed to mark inquiry as read')
    }
}

async function postInquiryMessage(inquiryId: number, token: string, message: string): Promise<InquiryMessage> {
    const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${inquiryId}/messages?site_id=${SITE_ID}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
    const json = await res.json() as { data?: InquiryMessage; error?: string }
    if (!res.ok || !json.data) throw new Error(json.error ?? 'Failed to send inquiry message')
    return json.data
}

async function deleteMemberInquiry(inquiryId: number, token: string) {
    const res = await fetch(`${API_BASE}/api/member-auth/inquiries/${inquiryId}?site_id=${SITE_ID}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json().catch(() => ({})) as { error?: string }
    if (!res.ok) throw new Error(json.error ?? 'Failed to delete inquiry')
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['member-order-detail', orderId],
        queryFn: () => fetchOrderDetail(orderId),
    })

    const s = data ? getOrderStatus(data.status) : null
    const StatusIcon = s?.icon ?? Package

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <ReceiptText className="w-5 h-5 text-primary-600" />
                        <h2 className="text-base font-bold text-slate-800">Sipariş Detayı</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-sm">Sipariş detayı yüklenemedi.</p>
                        </div>
                    )}

                    {data && s && (
                        <div className="space-y-5">
                            {/* Meta row */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Sipariş No</p>
                                    <p className="text-lg font-bold text-slate-800">#{data.order_number}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(data.created_at)}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {s.label}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="bg-slate-50 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ürün</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Adet</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.parsed_items.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0 bg-white">
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {item.title || item.product_name || `Ürün #${item.product_id}`}
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-500">
                                                    {item.qty ?? item.quantity ?? 1}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                                                    {formatPrice(
                                                        item.total_price ?? ((item.unit_price ?? 0) * (item.qty ?? item.quantity ?? 1)),
                                                        data.currency
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-1.5">
                                    {data.subtotal != null && (
                                        <div className="flex justify-between text-sm text-slate-500">
                                            <span>Ara Toplam</span>
                                            <span className="tabular-nums">{formatPrice(data.subtotal, data.currency)}</span>
                                        </div>
                                    )}
                                    {data.tax != null && (
                                        <div className="flex justify-between text-sm text-slate-500">
                                            <span>KDV</span>
                                            <span className="tabular-nums">{formatPrice(data.tax, data.currency)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold text-slate-800 border-t border-slate-200 pt-2 mt-2">
                                        <span>Genel Toplam</span>
                                        <span className="tabular-nums">{formatPrice(data.total, data.currency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping address */}
                            {data.shipping_address && (
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Teslimat Adresi</p>
                                    <p className="text-sm text-slate-700">{data.shipping_address}</p>
                                </div>
                            )}

                            {/* Tracking note */}
                            {data.notes && (
                                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">Kargo Takip No</p>
                                    <p className="text-sm font-bold text-primary-800">{data.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['member-orders', SITE_ID],
        queryFn: fetchMemberOrders,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">Siparişler yüklenemedi. Lütfen sayfayı yenileyin.</p>
            </div>
        )
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Henüz siparişiniz bulunmamaktadır</h3>
                <p className="text-sm text-slate-400 mb-6">İlk siparişinizi verin, ürünlerinizin durumunu buradan takip edin.</p>
                <Link
                    to="/urunler"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Ürünlere Göz At
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {orders.map(order => {
                    const s = getOrderStatus(order.status)
                    const StatusIcon = s.icon
                    let itemCount = 0
                    try { itemCount = (JSON.parse(order.items) as unknown[]).length } catch { itemCount = 1 }

                    return (
                        <div key={order.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-0.5">Sipariş No</p>
                                        <p className="text-sm font-bold text-slate-800">#{order.order_number}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {s.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 text-xs text-slate-500 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        {formatDate(order.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        {itemCount} ürün
                                    </span>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400">Toplam</p>
                                        <p className="text-base font-bold text-slate-800 tabular-nums">
                                            {formatPrice(order.total, order.currency)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 rounded-b-xl">
                                <button
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                                >
                                    Sipariş Detayı
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </>
    )
}

// ─── Favorites Tab ────────────────────────────────────────────────────────────

function FavoritesTab() {
    const { member, toggleFavoriteProduct } = useMemberAuth()
    const { addItem, isInCart } = useCart()
    const { data: allProductsData } = useProducts()
    const allProducts = (allProductsData?.data ?? []) as Product[]

    const favIds = parseFavoriteIds(member?.favorite_products)
    const favProducts = allProducts.filter(p => favIds.includes(p.id))

    if (favProducts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Favori listeniz boş</h3>
                <p className="text-sm text-slate-400 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek kolayca takip edebilirsiniz.</p>
                <Link
                    to="/urunler"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Ürünlere Göz At
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {favProducts.map(product => {
                const inCart = isInCart(product.id)
                return (
                    <div
                        key={product.id}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group relative flex items-stretch overflow-hidden"
                    >
                        <button
                            onClick={() => toggleFavoriteProduct(product.id)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                            title="Favorilerden kaldır"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <Link to={`/urunler/${product.slug}`} className="w-32 sm:w-40 shrink-0 bg-slate-50 flex items-center justify-center p-3 border-r border-slate-100 relative">
                            <img
                                src={getImageUrl(product.image_url)}
                                alt={product.title}
                                className="w-full h-full max-h-32 object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                            />
                        </Link>
                        
                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 min-w-0 pr-12">
                            <div>
                                <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider mb-1">{product.brand ?? 'ATAGO'}</p>
                                <Link to={`/urunler/${product.slug}`} className="block">
                                    <h4 className="text-sm sm:text-base font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors leading-snug">{product.title}</h4>
                                </Link>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                                {product.price != null ? (
                                    <p className="text-lg font-bold text-slate-800 tabular-nums">
                                        {Number(product.price).toLocaleString('tr-TR')} <span className="text-xs font-bold text-slate-400">{product.currency}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-slate-400">Fiyat sorunuz</p>
                                )}

                                <button
                                    onClick={() => {
                                        if (product.price == null) return
                                        addItem({
                                            id: product.id,
                                            slug: product.slug,
                                            title: product.title,
                                            image_url: product.image_url ?? null,
                                            price: product.price,
                                            currency: product.currency ?? 'TRY',
                                            brand: product.brand ?? null,
                                        })
                                    }}
                                    disabled={product.price == null}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 w-full sm:w-auto ${
                                        inCart
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : product.price == null
                                                ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                                    }`}
                                >
                                    {inCart ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Sepette</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>{product.price == null ? 'Fiyat Sorunuz' : 'Sepete Ekle'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Messages Tab ─────────────────────────────────────────────────────────────

function MessagesTab({ token }: { token: string | null }) {
    const queryClient = useQueryClient()
    const [selectedInquiry, setSelectedInquiry] = useState<MemberInquiry | null>(null)
    const [newMessage, setNewMessage] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inquiriesQuery = useQuery({
        queryKey: ['member-inquiries', SITE_ID, token],
        queryFn: () => fetchMemberInquiries(token as string),
        enabled: Boolean(token),
        refetchInterval: 5000,
    })

    const messagesQuery = useQuery({
        queryKey: ['member-inquiry-messages', SITE_ID, selectedInquiry?.id, token],
        queryFn: () => fetchInquiryMessages(selectedInquiry!.id, token as string),
        enabled: Boolean(token && selectedInquiry),
        refetchInterval: selectedInquiry ? 5000 : false,
    })

    const readMutation = useMutation({
        mutationFn: (inquiryId: number) => markInquiryAsRead(inquiryId, token as string),
        onSuccess: (_, inquiryId) => {
            queryClient.setQueryData<MemberInquiry[]>(
                ['member-inquiries', SITE_ID, token],
                (previous) =>
                    previous?.map((item) =>
                        item.id === inquiryId
                            ? { ...item, status: 'read' }
                            : item
                    ) ?? previous
            )
            void queryClient.invalidateQueries({ queryKey: ['member-inquiries', SITE_ID, token] })
        },
    })

    const replyMutation = useMutation({
        mutationFn: (message: string) => postInquiryMessage(selectedInquiry!.id, token as string, message),
        onSuccess: (message) => {
            setNewMessage('')
            queryClient.setQueryData<InquiryMessage[]>(
                ['member-inquiry-messages', SITE_ID, selectedInquiry?.id, token],
                (previous) => previous ? [...previous, message] : [message]
            )
            void queryClient.invalidateQueries({ queryKey: ['member-inquiries', SITE_ID, token] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (inquiryId: number) => deleteMemberInquiry(inquiryId, token as string),
        onSuccess: (_, inquiryId) => {
            queryClient.setQueryData<MemberInquiry[]>(
                ['member-inquiries', SITE_ID, token],
                (previous) => previous?.filter((item) => item.id !== inquiryId) ?? previous
            )
            queryClient.removeQueries({ queryKey: ['member-inquiry-messages', SITE_ID, inquiryId, token] })
            setSelectedInquiry(null)
            setConfirmDelete(false)
            void queryClient.invalidateQueries({ queryKey: ['member-inquiries', SITE_ID, token] })
        },
    })

    useEffect(() => {
        if (!selectedInquiry || !messagesQuery.data) return
        window.setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 10)
    }, [messagesQuery.data, selectedInquiry])

    const openInquiry = async (inquiry: MemberInquiry) => {
        const nextInquiry = inquiry.status === 'replied'
            ? { ...inquiry, status: 'read' as const }
            : inquiry

        setSelectedInquiry(nextInquiry)
        setConfirmDelete(false)
        if (inquiry.status === 'replied') {
            readMutation.mutate(inquiry.id)
        }
    }

    const handleSendMessage = async (event?: React.FormEvent) => {
        if (event) event.preventDefault()
        if (!selectedInquiry || !newMessage.trim() || replyMutation.isPending) return
        await replyMutation.mutateAsync(newMessage.trim())
    }

    const getStatusLabel = (status: MemberInquiry['status']) => {
        switch (status) {
            case 'replied':
                return 'Yanıtlandı'
            case 'read':
                return 'Okundu'
            case 'new':
                return 'Yeni'
            default:
                return 'Arşivlendi'
        }
    }

    const getStatusClasses = (status: MemberInquiry['status']) => {
        switch (status) {
            case 'replied':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700'
            case 'read':
                return 'border-blue-200 bg-blue-50 text-blue-700'
            case 'new':
                return 'border-amber-200 bg-amber-50 text-amber-700'
            default:
                return 'border-slate-200 bg-slate-50 text-slate-600'
        }
    }

    const getLastActivityAt = (inquiry: MemberInquiry) => new Date(inquiry.updated_at || inquiry.created_at).getTime()

    const initialInquiryMessage =
        typeof selectedInquiry?.payload?.message === 'string'
            ? selectedInquiry.payload.message.trim()
            : ''

    if (inquiriesQuery.isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
        )
    }

    const inquiries = [...(inquiriesQuery.data ?? [])].sort((a, b) => getLastActivityAt(b) - getLastActivityAt(a))
    const messages = messagesQuery.data ?? []

    if (inquiries.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <MessageSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">Henüz mesajınız yok</h3>
                    <p className="max-w-md text-sm text-slate-400">Destek, teklif ve teknik servis taleplerinize dair tüm yanıtlar burada görünecektir.</p>
                    <Link
                        to="/destek"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Destek Talebi Oluştur
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {inquiries.map((inquiry) => {
                    const payload = inquiry.payload || {}
                    const subject = payload.subject || payload.inquiry_category_label || 'Destek Talebi'
                    const preview = payload.message || 'Yeni mesaj ayrıntısı bulunmuyor.'

                    return (
                        <button
                            key={inquiry.id}
                            onClick={() => void openInquiry(inquiry)}
                            className="group flex w-full flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg sm:flex-row sm:items-center"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    <h3 className="truncate text-base font-bold text-slate-900">{subject}</h3>
                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClasses(inquiry.status)}`}>
                                        {getStatusLabel(inquiry.status)}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-sm leading-6 text-slate-500">{preview}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(inquiry.updated_at || inquiry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-500" />
                            </div>
                        </button>
                    )
                })}
            </div>

            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
                    <div className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-4xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900">
                                    {selectedInquiry.payload?.subject || selectedInquiry.payload?.inquiry_category_label || 'Destek Talebi'}
                                </h2>
                                <p className="mt-1 text-xs font-medium text-slate-400">Talep #{selectedInquiry.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!selectedInquiry) return
                                        if (confirmDelete) {
                                            deleteMutation.mutate(selectedInquiry.id)
                                            return
                                        }
                                        setConfirmDelete(true)
                                    }}
                                    disabled={deleteMutation.isPending}
                                    className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                                        confirmDelete
                                            ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                                            : 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100'
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    {deleteMutation.isPending ? 'Siliniyor...' : confirmDelete ? 'Onayla' : 'Sil'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmDelete(false)
                                        setSelectedInquiry(null)
                                    }}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-6">
                            {!messagesQuery.isLoading && messages.length === 0 && initialInquiryMessage && (
                                <div className="flex flex-col items-end">
                                    <div className="max-w-[85%] rounded-3xl rounded-tr-sm bg-primary-600 px-4 py-3 text-white shadow-md">
                                        <p className="text-sm font-medium whitespace-pre-wrap">{initialInquiryMessage}</p>
                                    </div>
                                    <span className="mt-1.5 flex items-center gap-1 px-1 text-[10px] font-medium text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        {new Date(selectedInquiry.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}

                            {messagesQuery.isLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isUser = message.sender === 'user'

                                    return (
                                        <div key={message.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${isUser ? 'rounded-tr-sm bg-primary-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
                                                <p className="text-sm font-medium whitespace-pre-wrap">{message.message}</p>
                                            </div>
                                            <span className="mt-1.5 flex items-center gap-1 px-1 text-[10px] font-medium text-slate-400">
                                                {!isUser && <span className="mr-1 font-bold text-slate-500">Atago TR</span>}
                                                <Clock className="h-3 w-3" />
                                                {new Date(message.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="border-t border-slate-100 bg-white p-4">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                                <textarea
                                    value={newMessage}
                                    onChange={(event) => setNewMessage(event.target.value)}
                                    placeholder="Yanıtınızı buraya yazın..."
                                    className="min-h-12 max-h-32 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                                    rows={Math.min(Math.max(newMessage.split('\n').length, 1), 5)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault()
                                            void handleSendMessage()
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || replyMutation.isPending}
                                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                    {replyMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// ─── Address Form (shared helper) ────────────────────────────────────────────

const EMPTY_ADDRESS: SavedAddress = {
    id: '', type: 'individual', title: '', city: '', district: '', full_address: '',
    tax_office: '', tax_number: '',
}

function AddressForm({
    value,
    onChange,
    onSave,
    onCancel,
    saving,
    saveLabel = 'Kaydet',
}: {
    value: SavedAddress
    onChange: (a: SavedAddress) => void
    onSave: () => void
    onCancel: () => void
    saving: boolean
    saveLabel?: string
}) {
    const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400'
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <select
                    value={value.type}
                    onChange={e => onChange({ ...value, type: e.target.value as SavedAddress['type'] })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white"
                >
                    <option value="individual">Bireysel</option>
                    <option value="corporate">Kurumsal</option>
                </select>
                <input
                    type="text"
                    placeholder="Adres başlığı (örn. Ev, İş)"
                    value={value.title}
                    onChange={e => onChange({ ...value, title: e.target.value })}
                    className={`flex-1 ${inp}`}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Şehir" value={value.city}
                    onChange={e => onChange({ ...value, city: e.target.value })} className={inp} />
                <input type="text" placeholder="İlçe" value={value.district}
                    onChange={e => onChange({ ...value, district: e.target.value })} className={inp} />
            </div>
            <textarea
                placeholder="Açık adres"
                value={value.full_address}
                onChange={e => onChange({ ...value, full_address: e.target.value })}
                rows={2}
                className={`${inp} resize-none`}
            />
            {value.type === 'corporate' && (
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Vergi Dairesi" value={value.tax_office ?? ''}
                        onChange={e => onChange({ ...value, tax_office: e.target.value })} className={inp} />
                    <input type="text" placeholder="Vergi No" value={value.tax_number ?? ''}
                        onChange={e => onChange({ ...value, tax_number: e.target.value })} className={inp} />
                </div>
            )}
            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={onSave}
                    disabled={saving || !value.title || !value.city || !value.full_address}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Kaydediliyor...' : saveLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    İptal
                </button>
            </div>
        </div>
    )
}

// ─── Profile & Addresses Tab ──────────────────────────────────────────────────

function ProfileTab({ member, onUpdate }: {
    member: {
        full_name: string
        email: string
        phone: string | null
        company_name: string | null
        addresses: string | null
    }
    onUpdate: (data: Record<string, string | null>) => Promise<void>
}) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        full_name: member.full_name,
        phone: member.phone ?? '',
        company_name: member.company_name ?? '',
    })
    const [saving, setSaving] = useState(false)

    // ── Address state ──
    const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
        if (!member.addresses) return []
        try {
            const p: unknown = JSON.parse(member.addresses)
            return Array.isArray(p) ? (p as SavedAddress[]) : []
        } catch { return [] }
    })
    const [addrSaving, setAddrSaving] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newAddr, setNewAddr] = useState<SavedAddress>({ ...EMPTY_ADDRESS })
    // editingAddrId: id of the address currently being edited (null = none)
    const [editingAddrId, setEditingAddrId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<SavedAddress>({ ...EMPTY_ADDRESS })

    const persistAddresses = useCallback(async (updated: SavedAddress[]) => {
        setAddrSaving(true)
        try {
            await onUpdate({ addresses: JSON.stringify(updated) })
            setAddresses(updated)
        } finally {
            setAddrSaving(false)
        }
    }, [onUpdate])

    // ── Profile save ──
    const handleSaveProfile = useCallback(async () => {
        setSaving(true)
        try {
            await onUpdate({
                full_name: form.full_name,
                phone: form.phone || null,
                company_name: form.company_name || null,
            })
            setEditing(false)
        } catch { /* error handled upstream */ } finally {
            setSaving(false)
        }
    }, [form, onUpdate])

    // ── Address handlers ──
    const handleAddAddress = async () => {
        const addr = { ...newAddr, id: crypto.randomUUID() }
        await persistAddresses([...addresses, addr])
        setNewAddr({ ...EMPTY_ADDRESS })
        setShowAddForm(false)
    }

    const handleStartEdit = (addr: SavedAddress) => {
        setEditingAddrId(addr.id)
        setEditDraft({ ...addr })
        setShowAddForm(false)
    }

    const handleSaveEdit = async () => {
        const updated = addresses.map(a => a.id === editingAddrId ? editDraft : a)
        await persistAddresses(updated)
        setEditingAddrId(null)
    }

    const handleRemove = async (id: string) => {
        await persistAddresses(addresses.filter(a => a.id !== id))
    }

    return (
        <div className="space-y-6">
            {/* ── Personal Info Card ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">Kişisel Bilgiler</h3>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Düzenle
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditing(false)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                İptal
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="inline-flex items-center gap-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">E-posta</label>
                                <input type="email" value={member.email} disabled
                                    className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Telefon</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+90 5XX XXX XX XX"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Firma</label>
                                <input
                                    type="text"
                                    value={form.company_name}
                                    onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                                    placeholder="Firma adınız"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                            <div className="flex items-start gap-3">
                                <UserCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Ad Soyad</p>
                                    <p className="text-sm font-semibold text-slate-800">{member.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">E-posta</p>
                                    <p className="text-sm font-semibold text-slate-800">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Telefon</p>
                                    <p className="text-sm font-semibold text-slate-800">{member.phone || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Firma</p>
                                    <p className="text-sm font-semibold text-slate-800">{member.company_name || '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Addresses Card ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Kayıtlı Adresler</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            For-Labs Ekosisteminde kayıtlı adresleriniz tüm sitelerde geçerlidir.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowAddForm(v => !v); setEditingAddrId(null) }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 border border-primary-200 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Yeni Adres
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Add new form */}
                    {showAddForm && (
                        <div className="border border-primary-200 bg-primary-50/30 rounded-xl p-4">
                            <p className="text-xs font-bold text-primary-700 mb-3">Yeni Adres Ekle</p>
                            <AddressForm
                                value={newAddr}
                                onChange={setNewAddr}
                                onSave={handleAddAddress}
                                onCancel={() => { setShowAddForm(false); setNewAddr({ ...EMPTY_ADDRESS }) }}
                                saving={addrSaving}
                                saveLabel="Ekle"
                            />
                        </div>
                    )}

                    {/* Existing addresses */}
                    {addresses.length === 0 && !showAddForm && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                <MapPin className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-400">Henüz kayıtlı adresiniz bulunmamaktadır.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                {editingAddrId === addr.id ? (
                                    // ── Inline edit form ──
                                    <div className="p-4">
                                        <p className="text-xs font-bold text-slate-600 mb-3">Adresi Düzenle</p>
                                        <AddressForm
                                            value={editDraft}
                                            onChange={setEditDraft}
                                            onSave={handleSaveEdit}
                                            onCancel={() => setEditingAddrId(null)}
                                            saving={addrSaving}
                                        />
                                    </div>
                                ) : (
                                    // ── Display view ──
                                    <>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                                <span className="text-sm font-bold text-slate-700">{addr.title}</span>
                                                <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    addr.type === 'corporate'
                                                        ? 'bg-violet-50 text-violet-600 border border-violet-200'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {addr.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">{addr.full_address}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {[addr.district, addr.city].filter(Boolean).join(', ')}
                                            </p>
                                            {addr.type === 'corporate' && addr.tax_number && (
                                                <p className="text-xs text-slate-400 mt-0.5">VN: {addr.tax_number}</p>
                                            )}
                                        </div>
                                        <div className="flex border-t border-slate-100 bg-slate-50/50">
                                            <button
                                                onClick={() => handleStartEdit(addr)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                                Düzenle
                                            </button>
                                            <div className="w-px bg-slate-100" />
                                            <button
                                                onClick={() => handleRemove(addr.id)}
                                                disabled={addrSaving}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-3 h-3" />
                                                Sil
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────

const TABS: Array<{ key: TabKey; label: string; icon: typeof Package }> = [
    { key: 'orders',   label: 'Siparişlerim',    icon: Package },
    { key: 'favorites',label: 'Favorilerim',      icon: Heart },
    { key: 'messages', label: 'Mesajlar',         icon: MessageSquare },
    { key: 'profile',  label: 'Profil & Adresler',icon: UserCircle },
]

export default function AccountPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { member, isLoading, logout, updateProfile } = useMemberAuth()
    const token = localStorage.getItem(TOKEN_KEY)
    const tabParam = searchParams.get('tab') as TabKey | null
    const [activeTab, setActiveTab] = useState<TabKey>(tabParam && ['orders', 'favorites', 'messages', 'profile'].includes(tabParam) ? tabParam : 'orders')

    useEffect(() => {
        if (tabParam && ['orders', 'favorites', 'messages', 'profile'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    useEffect(() => {
        if (!isLoading && !member) {
            navigate('/giris', { replace: true })
        }
    }, [isLoading, member, navigate])

    const inquiriesBadgeQuery = useQuery({
        queryKey: ['member-inquiries', SITE_ID, token],
        queryFn: () => fetchMemberInquiries(token as string),
        enabled: Boolean(token && member),
        refetchInterval: 5000,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!member) return null

    const memberSince = member.created_at
        ? new Date(member.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
        : null
    const unopenedMessageCount = (inquiriesBadgeQuery.data ?? []).filter((inquiry) => inquiry.status === 'replied').length

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* ── Profile Header ── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-primary-700">
                                {member.full_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                <h1 className="text-lg font-bold text-slate-800">{member.full_name}</h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 border border-primary-200 text-[10px] font-semibold text-primary-700">
                                    <Shield className="w-3 h-3" />
                                    For-Labs Ekosistem Hesabı
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">{member.email}</p>
                            {memberSince && (
                                <p className="text-xs text-slate-300 mt-0.5">Üye: {memberSince}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/') }}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all self-start sm:self-center"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="border-b border-slate-200 mb-6">
                <nav className="flex -mb-px overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'border-primary-600 text-primary-700'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.key === 'messages' && unopenedMessageCount > 0 && (
                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        {unopenedMessageCount}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* ── Tab Content ── */}
            <div className="min-h-[400px]">
                {activeTab === 'orders'    && <OrdersTab />}
                {activeTab === 'favorites' && <FavoritesTab />}
                {activeTab === 'messages'  && <MessagesTab token={token} />}
                {activeTab === 'profile'   && (
                    <ProfileTab
                        member={member}
                        onUpdate={async (data) => { await updateProfile(data) }}
                    />
                )}
            </div>
        </div>
    )
}
