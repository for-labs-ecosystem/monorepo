import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { MessageSquare, Clock, CheckCircle2, MailOpen, Archive } from "lucide-react";

const statusConfig = {
    new: { label: "Yeni", icon: MessageSquare, cls: "badge-danger" },
    read: { label: "Okundu", icon: MailOpen, cls: "badge-warning" },
    replied: { label: "Yanıtlandı", icon: CheckCircle2, cls: "badge-success" },
    archived: { label: "Arşivlendi", icon: Archive, cls: "badge-muted" },
};

const nextStatus: Record<string, string> = {
    new: "read", read: "replied", replied: "archived",
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const inquiries: any[] = data?.data || [];

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Talepler</h1>
                    <p className="page-subtitle">Müşteri iletişim formlarından gelen talepler</p>
                </div>
                <div className="flex items-center gap-2">
                    {["new", "read", "replied", "archived"].map((s) => {
                        const count = inquiries.filter((i) => i.status === s).length;
                        if (!count) return null;
                        const cfg = statusConfig[s as keyof typeof statusConfig];
                        return (
                            <span key={s} className={`badge ${cfg.cls}`}>
                                {count} {cfg.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            {inquiries.length === 0 ? (
                <div className="card p-12 text-center">
                    <MessageSquare size={32} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Henüz talep bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map((inq) => {
                        const cfg = statusConfig[inq.status as keyof typeof statusConfig] ?? statusConfig.new;
                        const StatusIcon = cfg.icon;
                        const next = nextStatus[inq.status];
                        const nextCfg = next ? statusConfig[next as keyof typeof statusConfig] : null;
                        return (
                            <div key={inq.id} className="card card-hover p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge ${cfg.cls} flex items-center gap-1`}>
                                                <StatusIcon size={10} />
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-slate-400">#{inq.id}</span>
                                            {inq.site_id && (
                                                <span className="badge badge-muted text-[10px]">
                                                    Site #{inq.site_id}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-slate-800 text-sm">
                                            {inq.name}
                                            {inq.company && (
                                                <span className="font-normal text-slate-500 ml-1">— {inq.company}</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">{inq.email}</p>
                                        {inq.message && (
                                            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 line-clamp-3">
                                                {inq.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <p className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock size={11} />
                                            {new Date(inq.created_at).toLocaleDateString("tr-TR")}
                                        </p>
                                        {next && nextCfg && (
                                            <button
                                                onClick={() => updateStatus(inq.id, next)}
                                                className="btn btn-secondary btn-sm text-xs"
                                            >
                                                {nextCfg.label} olarak işaretle
                                            </button>
                                        )}
                                        {inq.status === "archived" && (
                                            <span className="text-xs text-slate-400 italic">Tamamlandı</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
