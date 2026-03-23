import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
    ShoppingCart,
    TrendingUp,
    Search,
    ChevronDown,
    ChevronRight,
    XCircle,
    Clock,
    Info,
    X,
    Trash2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

interface Order {
    id: number;
    site_id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: number;
    currency: string;
    payment_status: string;
    status: string;
    seen_at: string | null;
    created_at: string;
}

interface Site {
    id: number;
    slug: string;
    name: string;
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
    paid: { label: "Ödendi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    failed: { label: "Başarısız", color: "bg-red-50 text-red-700 border-red-200" },
    refunded: { label: "İade", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const orderStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
    processing: { label: "İşleniyor", color: "bg-blue-50 text-blue-700 border-blue-200" },
    shipped: { label: "Kargoda", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    delivered: { label: "Teslim Edildi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "İptal", color: "bg-red-50 text-red-700 border-red-200" },
};

/** Must match the pending-count API logic exactly: unseen orders */
function needsAttention(o: Order): boolean {
    return !o.seen_at;
}

export default function OrdersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [siteFilter, setSiteFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders-pending-count"] });
            setDeleteOrderId(null);
        },
    });

    const { data: sitesData } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const { data, isLoading } = useQuery({
        queryKey: ["orders", siteFilter, statusFilter, paymentFilter, searchQuery],
        queryFn: () =>
            api.getOrders({
                site_id: siteFilter,
                status: statusFilter === "all" ? undefined : statusFilter,
                payment_status: paymentFilter === "all" ? undefined : paymentFilter,
                search: searchQuery || undefined,
            }),
    });

    const sites: Site[] = sitesData?.data || [];
    const orders: Order[] = useMemo(() => (data?.data || []) as unknown as Order[], [data]);

    const totalRevenue = useMemo(
        () => orders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + (o.total ?? 0), 0),
        [orders]
    );

    const financialStats = useMemo(() => {
        const stats = {
            paid: 0,
            pending: 0,
            failed: 0,
            count: {
                paid: 0,
                pending: 0,
                failed: 0
            }
        };

        orders.forEach(o => {
            const amount = o.total ?? 0;
            if (o.payment_status === "paid") {
                stats.paid += amount;
                stats.count.paid++;
            } else if (o.payment_status === "pending") {
                stats.pending += amount;
                stats.count.pending++;
            } else if (o.payment_status === "failed") {
                stats.failed += amount;
                stats.count.failed++;
            }
        });

        return stats;
    }, [orders]);

    const pendingAttentionCount = useMemo(
        () => orders.filter(needsAttention).length,
        [orders]
    );

    const statusCounts = useMemo(() => ({
        all: orders.length,
        attention: pendingAttentionCount,
        processing: orders.filter((o) => o.status === "processing").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
    }), [orders, pendingAttentionCount]);

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Siparişler</h1>
                    <p className="page-subtitle">E-ticaret sipariş takibi ve yönetimi</p>
                </div>
                <div className="flex items-center gap-2">
                    {totalRevenue > 0 && (
                        <button
                            onClick={() => setIsStatsModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                            <TrendingUp size={13} />
                            <span className="font-medium">
                                Toplam Gelir: ₺{totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            </span>
                            <Info size={12} className="ml-0.5 opacity-60" />
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics Modal */}
            {isStatsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-600" />
                                <h2 className="text-base font-bold text-slate-800">Finansal Özet</h2>
                            </div>
                            <button
                                onClick={() => setIsStatsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Paid Stats */}
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Toplam Gelir (Ödenen)</p>
                                    <p className="text-2xl font-black text-emerald-700">
                                        ₺{financialStats.paid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[11px] text-emerald-600/70 font-medium mt-1">
                                        {financialStats.count.paid} Başarılı İşlem
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp size={24} className="text-emerald-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Pending Stats */}
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-amber-600" />
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Bekleyen</p>
                                    </div>
                                    <p className="text-lg font-bold text-amber-700">
                                        ₺{financialStats.pending.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[10px] text-amber-600/70 font-medium">
                                        {financialStats.count.pending} İşlem
                                    </p>
                                </div>

                                {/* Failed Stats */}
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle size={14} className="text-red-600" />
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Başarısız</p>
                                    </div>
                                    <p className="text-lg font-bold text-red-700">
                                        ₺{financialStats.failed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[10px] text-red-600/70 font-medium">
                                        {financialStats.count.failed} İşlem
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <p className="text-[11px] text-slate-400 text-center italic">
                                    * İstatistikler şu anki filtrelere göre gerçek zamanlı hesaplanmaktadır.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setIsStatsModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                    {/* Backdrop Click */}
                    <div className="fixed inset-0 -z-10" onClick={() => setIsStatsModalOpen(false)} />
                </div>
            )}

            {/* Filters */}
            <div className="card p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-60">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Sipariş no, müşteri adı veya e-posta ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-9 w-full"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={siteFilter}
                            onChange={(e) => setSiteFilter(e.target.value)}
                            className="input pr-9 appearance-none cursor-pointer"
                        >
                            <option value="all">Tüm Siteler</option>
                            {sites.map((site) => (
                                <option key={site.id} value={String(site.id)}>{site.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="input pr-9 appearance-none cursor-pointer"
                        >
                            <option value="all">Tüm Ödemeler</option>
                            <option value="paid">Ödendi</option>
                            <option value="pending">Bekliyor</option>
                            <option value="failed">Başarısız</option>
                            <option value="refunded">İade</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2">
                        {[
                            { value: "all", label: "Tümü", count: statusCounts.all, accent: false },
                            { value: "attention", label: "Yeni / Bekleyen", count: statusCounts.attention, accent: true },
                            { value: "processing", label: "İşleniyor", count: statusCounts.processing, accent: false },
                            { value: "shipped", label: "Kargoda", count: statusCounts.shipped, accent: false },
                            { value: "delivered", label: "Teslim", count: statusCounts.delivered, accent: false },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${statusFilter === f.value
                                    ? f.accent ? "bg-red-50 text-red-700 border-red-300" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : f.accent && f.count > 0 ? "bg-red-50/50 text-red-600 border-red-200 hover:bg-red-50" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {f.accent && f.count > 0 && (
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                                )}
                                {f.label}
                                {f.count > 0 && (
                                    <span className="ml-1 text-xs opacity-60">({f.count})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            {orders.length === 0 && !isLoading ? (
                <div className="card p-12 text-center">
                    <ShoppingCart size={40} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                        {searchQuery || siteFilter !== "all" || statusFilter !== "all" || paymentFilter !== "all"
                            ? "Filtrelere uygun sipariş bulunamadı"
                            : "Henüz sipariş bulunmuyor"}
                    </p>
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sipariş No</th>
                                <th>Site</th>
                                <th>Müşteri</th>
                                <th className="text-right">Tutar</th>
                                <th>Ödeme</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .filter((o) => statusFilter === "attention" ? needsAttention(o) : true)
                                .map((order) => {
                                    const ps = paymentStatusConfig[order.payment_status] ?? { label: order.payment_status, color: "bg-slate-50 text-slate-600 border-slate-200" };
                                    const os = orderStatusConfig[order.status] ?? { label: order.status, color: "bg-slate-50 text-slate-600 border-slate-200" };
                                    const site = sites.find((s) => s.id === order.site_id);
                                    const isNew = needsAttention(order);
                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                            className={`cursor-pointer transition-colors ${isNew
                                                ? "bg-indigo-50/40 hover:bg-indigo-50/70 border-l-[3px] border-l-indigo-500"
                                                : "hover:bg-slate-50/80"
                                                }`}
                                        >
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {isNew && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                                                    )}
                                                    <span className={`font-mono text-xs font-semibold ${isNew ? "text-indigo-700" : "text-slate-800"}`}>
                                                        {order.order_number}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {site && (
                                                    <span className="px-1.5 py-px text-[9px] font-medium bg-violet-100 text-violet-700 rounded border border-violet-200">
                                                        {site.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{order.customer_name}</p>
                                                    <p className="text-xs text-slate-400">{order.customer_email}</p>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <span className="font-semibold text-slate-800">
                                                    {order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {order.currency === "TRY" ? "₺" : order.currency}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${ps.color}`}>
                                                    {ps.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${os.color}`}>
                                                    {os.label}
                                                </span>
                                            </td>
                                            <td className="text-xs text-slate-400 whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString("tr-TR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteOrderId(order.id); }}
                                                        className="p-1.5 rounded-lg border border-transparent text-slate-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                        title="Siparişi Sil"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                    <ChevronRight size={14} className="text-slate-300" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteOrderId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-center text-base font-bold text-slate-900 mb-2">Siparişi Sil?</h3>
                        <p className="text-center text-sm text-slate-500 mb-6">
                            Bu sipariş ve tüm ilişkili kalemler kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteOrderId(null)}
                                className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteOrderId)}
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
