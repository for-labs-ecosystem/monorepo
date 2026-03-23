import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
    ArrowLeft,
    Package,
    User,
    Phone,
    MapPin,
    FileText,
    Save,
    Truck,
    CreditCard,
    Calendar,
    Hash,
    Globe,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    StickyNote,
    Trash2,
    AlertTriangle,
    Loader2,
    ExternalLink,
    Check,
} from "lucide-react";

import type { Order } from "@forlabs/shared";

interface LocalParsedOrderItem {
    product_id: number;
    title: string;
    qty: number;
    unit_price: number;
}

interface Site {
    id: number;
    slug: string;
    name: string;
}

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    pending: { label: "Bekliyor", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
    paid: { label: "Başarılı", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    failed: { label: "Başarısız", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
    refunded: { label: "İade Edildi", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: RotateCcw },
};

const orderStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
    processing: { label: "İşleniyor", color: "bg-blue-50 text-blue-700 border-blue-200" },
    shipped: { label: "Kargoda", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    delivered: { label: "Teslim Edildi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "İptal Edildi", color: "bg-red-50 text-red-700 border-red-200" },
};

const paymentMethodLabels: Record<string, string> = {
    iyzico: "Iyzico Kredi Kartı",
    bank_transfer: "Havale / EFT",
    cash: "Nakit",
};

// Order lifecycle steps for the visual flow
const ORDER_FLOW_STEPS = [
    { key: "pending", label: "Sipariş Alındı", icon: Clock },
    { key: "processing", label: "Hazırlanıyor", icon: Package },
    { key: "shipped", label: "Kargoda", icon: Truck },
    { key: "delivered", label: "Teslim Edildi", icon: CheckCircle2 },
] as const;

function formatCurrency(amount: number, currency: string) {
    const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency === "TRY" ? `₺${formatted}` : `${formatted} ${currency}`;
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [orderStatus, setOrderStatus] = useState<string>("");
    const [adminNotes, setAdminNotes] = useState<string>("");
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [isDirty, setIsDirty] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data: sitesData } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const { data, isLoading } = useQuery({
        queryKey: ["order", id],
        queryFn: () => api.getOrder(Number(id)),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (updates: { status?: string; admin_notes?: string; tracking_number?: string }) =>
            api.updateOrder(Number(id), updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order", id] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders-pending-count"] });
            setIsDirty(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.deleteOrder(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders-pending-count"] });
            navigate("/orders");
        },
    });

    const order: Order | null = data?.data ?? null;
    const sites: Site[] = sitesData?.data || [];
    const site = order ? sites.find((s) => s.id === order.site_id) : null;

    // When detail page loads, the API auto-marks seen_at.
    const hasFlushed = useRef(false);
    useEffect(() => {
        if (order && !hasFlushed.current) {
            hasFlushed.current = true;
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders-pending-count"] });
        }
    }, [order, queryClient]);

    // Initialize form state when order loads
    if (order && !orderStatus && !isDirty) {
        setOrderStatus(order.status);
        setAdminNotes(order.admin_notes ?? "");
        setTrackingNumber(order.notes ?? "");
    }

    const handleSave = () => {
        const updates: Record<string, string> = {};
        if (orderStatus !== order?.status) updates.status = orderStatus;
        if (adminNotes !== (order?.admin_notes ?? "")) updates.admin_notes = adminNotes;
        if (trackingNumber !== (order?.notes ?? "")) updates.tracking_number = trackingNumber;
        if (Object.keys(updates).length > 0) {
            updateMutation.mutate(updates);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="card p-12 text-center">
                <Package size={40} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Sipariş bulunamadı</p>
                <button onClick={() => navigate("/orders")} className="btn btn-secondary mt-4">
                    Siparişlere Dön
                </button>
            </div>
        );
    }

    const items: LocalParsedOrderItem[] = (order.parsed_items as any) ?? [];
    const ps = paymentStatusConfig[order.payment_status] ?? paymentStatusConfig.pending;
    const os = orderStatusConfig[order.status] ?? orderStatusConfig.pending;
    const PaymentIcon = ps.icon;
    const isCancelled = order.status === "cancelled";
    const isPaid = order.payment_status === "paid";

    // Calculate current step index for the flow visualization
    const stepIndex = ORDER_FLOW_STEPS.findIndex(s => s.key === order.status);
    const currentStepIdx = isCancelled ? -1 : stepIndex >= 0 ? stepIndex : 0;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/orders")}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={18} className="text-slate-500" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl font-bold text-slate-900 font-mono">
                            {order.order_number}
                        </h1>
                        <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md border ${os.color}`}>
                            {os.label}
                        </span>
                        {site && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white rounded-lg shadow-md shadow-violet-200/50">
                                <Globe size={14} className="text-violet-200" />
                                <span className="text-[12px] font-black tracking-widest uppercase">
                                    {site.name}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(order.created_at).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ═══ LEFT — RECEIPT / FIŞ (2/3) ═══ */}
                <div className="lg:col-span-2 space-y-0 relative">
                    {site && (
                        <div className="absolute top-4 right-6 pointer-events-none select-none opacity-[0.03] rotate-12 origin-center">
                            <span className="text-6xl font-black uppercase tracking-tighter">
                                {site.name}
                            </span>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                        {site && <div className="h-1 bg-violet-500 w-full" />}

                        {/* ── Customer & Address Grid (3-col) ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <User size={14} className="text-indigo-500" />
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Müşteri</h4>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 mb-1">{order.customer_name}</p>
                                <a href={`mailto:${order.customer_email}`} className="text-xs text-indigo-600 hover:underline block mb-0.5">
                                    {order.customer_email}
                                </a>
                                {order.customer_phone && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Phone size={11} className="text-slate-400" />
                                        {order.customer_phone}
                                    </p>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin size={14} className="text-indigo-500" />
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Teslimat Adresi</h4>
                                </div>
                                {order.shipping_address ? (
                                    <p className="text-sm text-slate-700 leading-relaxed">{order.shipping_address}</p>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Belirtilmemiş</p>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={14} className="text-indigo-500" />
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fatura Bilgileri</h4>
                                </div>
                                {order.billing_address ? (
                                    <p className="text-sm text-slate-700 leading-relaxed">{order.billing_address}</p>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Teslimat adresi ile aynı</p>
                                )}

                                {order.customer_type === 'corporate' && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                                        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Kurumsal Bilgiler</h4>
                                        <p className="text-xs font-semibold text-slate-800">{order.company_name}</p>
                                        <p className="text-[11px] text-slate-500">{order.tax_office} VD.</p>
                                        <p className="text-[11px] text-slate-500">Vergi No: {order.tax_number}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Sipariş Kalemleri ── */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ürün</th>
                                        <th className="text-center px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Adet</th>
                                        <th className="text-right px-3 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Birim Fiyat</th>
                                        <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                        <Package size={15} className="text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                                                        {item.product_id > 0 && (
                                                            <p className="text-[11px] text-slate-400">SKU: {item.product_id}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center px-3 py-3.5">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                                                    {item.qty}
                                                </span>
                                            </td>
                                            <td className="text-right px-3 py-3.5 text-slate-600 tabular-nums">
                                                {formatCurrency(item.unit_price, order.currency)}
                                            </td>
                                            <td className="text-right px-5 py-3.5 font-semibold text-slate-800 tabular-nums">
                                                {formatCurrency(item.unit_price * item.qty, order.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Financial Summary ── */}
                        <div className="border-t border-slate-200 bg-slate-50/50">
                            <div className="max-w-xs ml-auto px-5 py-4 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Ara Toplam</span>
                                    <span className="text-slate-700 tabular-nums">{formatCurrency(order.subtotal, order.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">KDV</span>
                                    <span className="text-slate-700 tabular-nums">{formatCurrency(order.tax, order.currency)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                                    <span className="text-slate-900">Genel Toplam</span>
                                    <span className="text-indigo-600 tabular-nums">{formatCurrency(order.total, order.currency)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Ödeme Özeti ── */}
                        <div className={`border-t-2 ${order.payment_status === "paid" ? "border-emerald-300" :
                            order.payment_status === "failed" ? "border-red-300" : "border-amber-300"
                            }`}>
                            <div className={`px-5 py-4 ${ps.bg} border-b border-slate-100`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${order.payment_status === "paid" ? "bg-emerald-100" :
                                            order.payment_status === "failed" ? "bg-red-100" : "bg-amber-100"
                                            }`}>
                                            <PaymentIcon size={18} className={ps.color} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800">Ödeme Özeti</h4>
                                            <p className={`text-xs font-medium ${ps.color}`}>{ps.label}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${ps.bg} ${ps.color}`}>
                                        {ps.label}
                                    </span>
                                </div>
                            </div>
                            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Yöntem</p>
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard size={13} className="text-slate-400" />
                                        <p className="text-sm font-medium text-slate-700">
                                            {paymentMethodLabels[order.payment_method ?? "iyzico"] ?? order.payment_method ?? "Bilinmiyor"}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">İşlem No</p>
                                    <p className="text-sm font-mono font-medium text-slate-700">
                                        {order.iyzico_payment_id ? (
                                            <span className="flex items-center gap-1">
                                                <Hash size={12} className="text-slate-400" />
                                                {order.iyzico_payment_id}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Ödenen Tutar</p>
                                    <p className="text-sm font-bold text-slate-800 tabular-nums">
                                        {order.payment_status === "paid" ? formatCurrency(order.total, order.currency) : "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Ödeme Tarihi</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {order.payment_status === "paid" ? (
                                            new Date(order.updated_at).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT — OPERASYON MERKEZİ (1/3) ═══ */}
                <div className="space-y-5">
                    {/* ─── Order Flow Visualization ─── */}
                    <div className="card overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60">
                            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Sipariş Akışı</h3>
                            <p className="text-[10px] text-indigo-500/70 mt-0.5">Müşteri bu durumu gerçek zamanlı görür</p>
                        </div>
                        <div className="p-5">
                            {isCancelled ? (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <XCircle size={20} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Sipariş İptal Edildi</p>
                                        <p className="text-xs text-red-600/70">Bu sipariş iptal edilmiştir.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {ORDER_FLOW_STEPS.map((step, idx) => {
                                        const isCompleted = idx < currentStepIdx;
                                        const isCurrent = idx === currentStepIdx;
                                        const isUpcoming = idx > currentStepIdx;
                                        const StepIcon = step.icon;

                                        return (
                                            <div key={step.key} className="flex items-stretch gap-3">
                                                {/* Vertical line + dot */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isCompleted
                                                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                                                            : isCurrent
                                                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-100"
                                                                : "bg-slate-100 text-slate-400 border-2 border-dashed border-slate-200"
                                                            }`}
                                                    >
                                                        {isCompleted ? (
                                                            <Check size={14} strokeWidth={3} />
                                                        ) : (
                                                            <StepIcon size={14} />
                                                        )}
                                                    </div>
                                                    {idx < ORDER_FLOW_STEPS.length - 1 && (
                                                        <div className={`w-0.5 flex-1 my-1 rounded-full ${isCompleted ? "bg-emerald-300" : "bg-slate-200"}`} />
                                                    )}
                                                </div>
                                                {/* Label */}
                                                <div className={`pb-4 pt-1.5 ${idx === ORDER_FLOW_STEPS.length - 1 ? "pb-0" : ""}`}>
                                                    <p className={`text-sm font-medium ${isCompleted
                                                        ? "text-emerald-700"
                                                        : isCurrent
                                                            ? "text-indigo-700 font-bold"
                                                            : "text-slate-400"
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-[10px] text-indigo-500 mt-0.5 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                            Şu anki durum
                                                        </p>
                                                    )}
                                                    {isUpcoming && (
                                                        <p className="text-[10px] text-slate-300">Bekliyor</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Operasyon Merkezi ─── */}
                    <div className="card">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operasyon Merkezi</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Durum değişiklikleri müşterinin paneline yansır</p>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Status selector with visual feedback */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                                    <Truck size={13} className="text-slate-400" />
                                    Sipariş Durumu
                                </label>
                                <div className="space-y-1.5">
                                    {[
                                        { value: "pending", label: "Bekliyor", desc: "Sipariş alındı, henüz işleme başlanmadı", color: "amber" },
                                        { value: "processing", label: "Hazırlanıyor", desc: "Sipariş depoda hazırlanıyor", color: "blue" },
                                        { value: "shipped", label: "Kargoya Verildi", desc: "Kargo firmasına teslim edildi", color: "indigo" },
                                        { value: "delivered", label: "Teslim Edildi", desc: "Müşteriye başarıyla ulaştı", color: "emerald" },
                                        { value: "cancelled", label: "İptal Edildi", desc: "Sipariş iptal edildi", color: "red" },
                                    ].map((opt) => {
                                        const isSelected = orderStatus === opt.value;
                                        const colorClasses: Record<string, string> = {
                                            amber: isSelected ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30",
                                            blue: isSelected ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30",
                                            indigo: isSelected ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30",
                                            emerald: isSelected ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30",
                                            red: isSelected ? "border-red-400 bg-red-50 ring-2 ring-red-200" : "border-slate-200 hover:border-red-300 hover:bg-red-50/30",
                                        };

                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setOrderStatus(opt.value); setIsDirty(true); }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all ${colorClasses[opt.color]}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                                            {opt.label}
                                                        </p>
                                                        <p className={`text-[10px] ${isSelected ? "text-slate-600" : "text-slate-400"}`}>
                                                            {opt.desc}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-${opt.color}-500 text-white`}>
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tracking Number */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <Package size={13} className="text-slate-400" />
                                    Kargo Takip No
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => { setTrackingNumber(e.target.value); setIsDirty(true); }}
                                    placeholder="Örn: 1234567890"
                                    className="input w-full font-mono text-sm"
                                />
                            </div>

                            {/* Save */}
                            <button
                                onClick={handleSave}
                                disabled={!isDirty || updateMutation.isPending}
                                className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${isDirty
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        {isDirty ? "Değişiklikleri Kaydet" : "Güncel"}
                                    </>
                                )}
                            </button>

                            {updateMutation.isSuccess && (
                                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium">
                                    <CheckCircle2 size={13} />
                                    Kaydedildi — müşteri yeni durumu görebilir
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Fatura ─── */}
                    {isPaid && (
                        <div className="card">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-emerald-50/50">
                                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={12} />
                                    Fatura
                                </h3>
                            </div>
                            <div className="p-5">
                                <a
                                    href={api.getOrderInvoiceUrl(order.id!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                                >
                                    <ExternalLink size={14} />
                                    Faturayı Görüntüle / İndir
                                </a>
                            </div>
                        </div>
                    )}

                    {/* ─── İç Notlar ─── */}
                    <div className="card">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-1.5">
                                <StickyNote size={13} className="text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">İç Notlar</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Sadece admin ekibi görebilir</p>
                        </div>
                        <div className="p-5">
                            <textarea
                                value={adminNotes}
                                onChange={(e) => { setAdminNotes(e.target.value); setIsDirty(true); }}
                                placeholder="Sipariş hakkında not ekleyin..."
                                rows={4}
                                className="input w-full resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* ─── Danger Zone ─── */}
                    <div className="card border-red-100">
                        <div className="px-5 py-3.5 border-b border-red-100 bg-red-50/50">
                            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">Tehlikeli Alan</h3>
                        </div>
                        <div className="p-5">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                            >
                                <Trash2 size={14} />
                                Siparişi Sil
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-2">Bu işlem geri alınamaz.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Delete Confirm Modal ─── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-center text-base font-bold text-slate-900 mb-2">Siparişi Sil?</h3>
                        <p className="text-center text-sm text-slate-500 mb-2">
                            <strong className="font-mono text-slate-700">{order.order_number}</strong> numaralı sipariş kalıcı olarak silinecek.
                        </p>
                        <p className="text-center text-xs text-red-500 mb-6">
                            Bu işlem geri alınamaz. Sipariş ve tüm ilişkili kalemler silinir.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Siliniyor...
                                    </>
                                ) : (
                                    "Evet, Sil"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
