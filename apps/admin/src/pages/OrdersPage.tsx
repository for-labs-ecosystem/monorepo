import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const paymentColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    paid: "bg-success/10 text-success border-success/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    refunded: "bg-muted text-muted-foreground border-border",
};
const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    processing: "bg-accent/10 text-accent",
    shipped: "bg-purple-500/10 text-purple-400",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
};

export default function OrdersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => api.getOrders(),
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    🛒 Siparişler
                </h1>
                <p className="text-sm text-muted-foreground mt-1">E-ticaret siparişleri ve ödeme durumları</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                </div>
            ) : !data?.data?.length ? (
                <div className="bg-card border border-border rounded-xl p-20 text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm text-muted-foreground">Henüz sipariş yok</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Sipariş No</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Müşteri</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Toplam</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Ödeme</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Durum</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Tarih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.data.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-mono text-card-foreground">{order.order_number}</td>
                                        <td className="px-4 py-3 text-sm text-card-foreground">
                                            <div>{order.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-foreground">₺{order.total?.toLocaleString("tr-TR")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${paymentColors[order.payment_status]}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString("tr-TR")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
