import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const statusColors: Record<string, string> = {
    new: "bg-accent/10 text-accent border-accent/20",
    read: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    replied: "bg-success/10 text-success border-success/20",
    archived: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
    new: "Yeni",
    read: "Okundu",
    replied: "Yanıtlandı",
    archived: "Arşivlendi",
};

export default function InquiriesPage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["inquiries"],
        queryFn: () => api.getInquiries(),
    });

    const updateStatus = async (id: number, status: string) => {
        await api.updateInquiryStatus(id, status);
        queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    💬 Talepler
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Ziyaretçi iletişim ve teklif formları
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                </div>
            ) : !data?.data?.length ? (
                <div className="bg-card border border-border rounded-xl p-20 text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm text-muted-foreground">Henüz talep yok</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.data.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-card border border-border rounded-xl p-5 hover:border-accent/20 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-foreground">
                                            {item.name}
                                        </h3>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[item.status] || statusColors.new
                                                }`}
                                        >
                                            {statusLabels[item.status] || item.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {item.email} {item.phone && `· ${item.phone}`}
                                        {item.company && ` · ${item.company}`}
                                    </p>
                                    {item.subject && (
                                        <p className="text-sm text-card-foreground font-medium mb-1">
                                            {item.subject}
                                        </p>
                                    )}
                                    <p className="text-sm text-card-foreground">{item.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        {new Date(item.created_at).toLocaleString("tr-TR")}
                                    </p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    {item.status === "new" && (
                                        <button
                                            onClick={() => updateStatus(item.id, "read")}
                                            className="px-2.5 py-1.5 rounded-md text-xs bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                                        >
                                            Okundu
                                        </button>
                                    )}
                                    {(item.status === "new" || item.status === "read") && (
                                        <button
                                            onClick={() => updateStatus(item.id, "replied")}
                                            className="px-2.5 py-1.5 rounded-md text-xs bg-success/10 text-success hover:bg-success/20 transition-colors"
                                        >
                                            Yanıtlandı
                                        </button>
                                    )}
                                    {item.status !== "archived" && (
                                        <button
                                            onClick={() => updateStatus(item.id, "archived")}
                                            className="px-2.5 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                        >
                                            Arşivle
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
