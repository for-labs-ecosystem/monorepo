import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ShoppingCart, TrendingUp } from "lucide-react";

const paymentStatus: Record<string, { label: string; cls: string }> = {
    pending: { label: "Bekliyor", cls: "badge-warning" },
    paid: { label: "Ödendi", cls: "badge-success" },
    failed: { label: "Başarısız", cls: "badge-danger" },
    refunded: { label: "İade", cls: "badge-muted" },
};

const fulfillmentStatus: Record<string, { label: string; cls: string }> = {
    pending: { label: "Hazırlanıyor", cls: "badge-warning" },
    processing: { label: "İşlemde", cls: "badge-accent" },
    shipped: { label: "Kargoda", cls: "badge-success" },
    delivered: { label: "Teslim", cls: "badge-success" },
    cancelled: { label: "İptal", cls: "badge-danger" },
};

export default function OrdersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => api.getOrders(),
    });

    const orders: any[] = data?.data || [];
    const totalRevenue = orders
        .filter((o) => o.payment_status === "paid")
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Siparişler</h1>
                    <p className="page-subtitle">E-ticaret sipariş takibi</p>
                </div>
                {totalRevenue > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                        <TrendingUp size={13} />
                        <span className="font-medium">
                            Toplam: ₺{totalRevenue.toLocaleString("tr-TR")}
                        </span>
                    </div>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <ShoppingCart size={32} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Henüz sipariş bulunmuyor</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sipariş No</th>
                                <th>Müşteri</th>
                                <th>Tutar</th>
                                <th>Ödeme</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const ps = paymentStatus[order.payment_status] ?? { label: order.payment_status, cls: "badge-muted" };
                                const fs = fulfillmentStatus[order.fulfillment_status] ?? { label: order.fulfillment_status, cls: "badge-muted" };
                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="font-mono text-xs font-medium text-slate-700">
                                                #{order.order_number ?? order.id}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{order.customer_name}</p>
                                                <p className="text-xs text-slate-400">{order.customer_email}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-semibold text-slate-800">
                                                ₺{(order.total_amount ?? 0).toLocaleString("tr-TR")}
                                            </span>
                                        </td>
                                        <td><span className={`badge ${ps.cls}`}>{ps.label}</span></td>
                                        <td><span className={`badge ${fs.cls}`}>{fs.label}</span></td>
                                        <td className="text-xs text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString("tr-TR")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
