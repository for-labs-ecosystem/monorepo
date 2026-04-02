import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
    Search,
    MessageSquare,
    X,
    Mail,
    Archive,
    MailOpen,
    Calendar,
    ChevronDown,
    Trash2,
    Send,
    Loader2,
    ArrowLeft,
} from "lucide-react";

interface Inquiry {
    id: number;
    site_id: number;
    sender_name: string;
    sender_email: string;
    payload: Record<string, string> | null;
    status: "new" | "read" | "replied" | "archived";
    member_id?: number | null;
    created_at: string;
    updated_at: string;
}

interface Site {
    id: number;
    slug: string;
    name: string;
}

const statusConfig = {
    new: { label: "Yeni", color: "bg-blue-50 text-blue-700 border-blue-200" },
    read: { label: "Okundu", color: "bg-amber-50 text-amber-700 border-amber-200" },
    replied: { label: "Yanıtlandı", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    archived: { label: "Arşivlendi", color: "bg-slate-50 text-slate-600 border-slate-200" },
};

/* Human-readable labels for common inquiry payload keys */
const FIELD_LABELS: Record<string, string> = {
    phone: "Telefon",
    company: "Firma",
    quote_type: "Teklif Türü",
    message: "Mesaj",
    type: "Talep Tipi",
    site_id: "Site ID",
};

const TYPE_LABELS: Record<string, string> = {
    quote: "Teklif Talebi",
    contact: "İletişim",
    general: "Genel",
};

function InquiryDrawer({
    inquiry,
    sites,
    onClose,
    onStatusUpdate,
    onDelete,
}: {
    inquiry: Inquiry;
    sites: Site[];
    onClose: () => void;
    onStatusUpdate: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}) {
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [viewMode, setViewMode] = useState<"details" | "chat">("details");
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 10);
    };

    useEffect(() => {
        if (viewMode === "chat") {
            scrollToBottom();
        }
    }, [messages, viewMode, loadingMessages]);

    const site = sites.find((s) => s.id === inquiry.site_id);
    const isUnread = inquiry.status === "new" || inquiry.status === "read";
    const payloadEntries = inquiry.payload ? Object.entries(inquiry.payload).filter(([key]) => key !== 'metadata') : [];

    const fetchMessages = useCallback(async () => {
        if (!inquiry.id) return;
        try {
            const res = await api.getInquiryMessages(inquiry.id);
            setMessages(res.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [inquiry.id]);

    useEffect(() => {
        if (viewMode === "chat") {
            const interval = setInterval(fetchMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [fetchMessages, viewMode]);

    const handleOpenChat = async () => {
        setViewMode("chat");
        setLoadingMessages(true);

        // If it was new, mark as read when entering chat
        if (inquiry.status === "new") {
            onStatusUpdate(inquiry.id, "read");
        }

        try {
            await fetchMessages();
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.replyToInquiry(inquiry.id, newMessage.trim());
            setMessages([...messages, res.data]);
            setNewMessage("");
            if (inquiry.status !== "replied") {
                onStatusUpdate(inquiry.id, "replied");
            }
            // Invalidate to update sidebar badge
            queryClient.invalidateQueries({ queryKey: ["inquiries-pending-count"] });
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleArchive = () => {
        onStatusUpdate(inquiry.id, "archived");
        onClose();
    };

    const handleMarkUnread = () => {
        onStatusUpdate(inquiry.id, "new");
        onClose();
    };

    const handleDelete = () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        onDelete(inquiry.id);
        onClose();
    };

    const mailtoLink = `mailto:${inquiry.sender_email}?subject=Re: İletişim Talebiniz`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />
            <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        {viewMode === "chat" && (
                            <button onClick={() => setViewMode("details")} className="p-1 -ml-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-slate-600" />
                            </button>
                        )}
                        <h2 className="text-lg font-semibold text-slate-900">
                            {viewMode === "chat" ? "Kullanıcı Mesajları" : "Talep Detayı"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {viewMode === "details" ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Header — sender + status badges */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${statusConfig[inquiry.status].color}`}>
                                            {statusConfig[inquiry.status].label}
                                        </span>
                                        {site && (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 rounded-md border border-violet-200">
                                                {site.name}
                                            </span>
                                        )}
                                        {/* Show quote type badge if present */}
                                        {inquiry.payload?.type && (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-md border border-orange-200">
                                                {TYPE_LABELS[inquiry.payload.type] ?? inquiry.payload.type}
                                            </span>
                                        )}
                                        {inquiry.payload?.quote_type && (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                                                📋 {inquiry.payload.quote_type}
                                            </span>
                                        )}
                                        {inquiry.member_id && (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                                                Üye Kullanıcı
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-slate-900">{inquiry.sender_name}</h3>
                                </div>
                            </div>

                            {/* New Message Alert for Member Inquiries */}
                            {inquiry.status === "new" && inquiry.member_id && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900">Yeni Bir Mesajınız Var!</p>
                                            <p className="text-xs text-indigo-600">Kullanıcı sohbet üzerinden size bir yanıt gönderdi.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleOpenChat}
                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shrink-0"
                                    >
                                        Mesajlara Git
                                    </button>
                                </div>
                            )}

                            {/* Fixed contact info card */}
                            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Mail size={16} className="text-slate-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 mb-0.5">E-posta</p>
                                        <a href={`mailto:${inquiry.sender_email}`} className="text-sm text-indigo-600 hover:underline">
                                            {inquiry.sender_email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar size={16} className="text-slate-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 mb-0.5">Tarih</p>
                                        <p className="text-sm text-slate-700">
                                            {new Date(inquiry.created_at).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic payload fields */}
                            {payloadEntries.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Form Verileri</p>
                                    {payloadEntries.map(([key, value]) => {
                                        let displayValue = String(value);
                                        if (key === 'site_id' || key === 'site id') {
                                            const siteObj = sites.find((s) => String(s.id) === String(value));
                                            if (siteObj) {
                                                displayValue = `${value} (${siteObj.name})`;
                                            }
                                        }
                                        return (
                                            <div key={key}>
                                                <p className="text-xs text-slate-500 mb-1 font-medium capitalize">
                                                    {FIELD_LABELS[key] ?? key.replace(/_/g, " ")}
                                                </p>
                                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                                    {key === 'type' ? (TYPE_LABELS[displayValue] ?? displayValue) : displayValue}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {payloadEntries.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Form verisi bulunmuyor.</p>
                            )}
                        </div>

                        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                            <div className="flex items-center gap-2">
                                {inquiry.member_id ? (
                                    <button
                                        onClick={handleOpenChat}
                                        className="flex-1 btn btn-primary flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <MessageSquare size={16} />
                                        Mesajlara Dön
                                    </button>
                                ) : (
                                    <a
                                        href={mailtoLink}
                                        className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                                    >
                                        <Mail size={16} />
                                        E-posta ile Yanıtla
                                    </a>
                                )}
                                {isUnread && (
                                    <button
                                        onClick={handleMarkUnread}
                                        className="btn btn-secondary flex items-center gap-2"
                                    >
                                        <MailOpen size={16} />
                                        Okunmadı
                                    </button>
                                )}
                                <button
                                    onClick={handleArchive}
                                    className="btn btn-secondary flex items-center gap-2"
                                >
                                    <Archive size={16} />
                                    Arşivle
                                </button>
                            </div>
                            <button
                                onClick={handleDelete}
                                onBlur={() => setConfirmDelete(false)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${confirmDelete
                                    ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                                    : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                                    }`}
                            >
                                <Trash2 size={15} />
                                {confirmDelete ? "Emin misiniz? Tekrar tıklayın" : "Talebi Sil"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 scroll-smooth">
                            {/* Original inquiry as first message */}
                            <div className="flex flex-col items-start">
                                <div className="max-w-[85%] bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                    {Object.entries(inquiry.payload || {}).map(([key, value]) => {
                                        if (key === 'inquiryType' || key === 'subject') return null
                                        return (
                                            <div key={key} className="mb-2 last:mb-0">
                                                <span className="block text-[10px] uppercase font-bold opacity-70 mb-0.5">{key}</span>
                                                <span className="text-sm whitespace-pre-wrap">{String(value)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(inquiry.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {loadingMessages ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isAdmin = msg.sender === 'admin'
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isAdmin
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                                                {!isAdmin && <span className="font-bold text-slate-500 mr-1">{inquiry.sender_name} </span>}
                                                <Calendar className="w-3 h-3" />
                                                {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Yanıtınızı yazın..."
                                    className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors max-h-32 min-h-[44px]"
                                    rows={Math.min(Math.max(newMessage.split('\n').length, 1), 5)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage(e)
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-11 h-11 shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-colors"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function InquiriesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [siteFilter, setSiteFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    const { data: sitesData } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const { data, isLoading } = useQuery({
        queryKey: ["inquiries", siteFilter, statusFilter, searchQuery],
        queryFn: () =>
            api.getInquiries({
                site_id: siteFilter,
                status: statusFilter === "all" ? undefined : statusFilter,
                search: searchQuery || undefined,
            }),
        refetchInterval: 5000, // Poll every 5s
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.updateInquiryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inquiries"] });
            queryClient.invalidateQueries({ queryKey: ["inquiries-pending-count"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteInquiry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inquiries"] });
            queryClient.invalidateQueries({ queryKey: ["inquiries-pending-count"] });
        },
    });

    const sites: Site[] = sitesData?.data || [];
    const inquiries: Inquiry[] = useMemo(() => data?.data || [], [data]);

    const handleRowClick = (inquiry: Inquiry) => {
        if (inquiry.status === "new") {
            updateStatusMutation.mutate({ id: inquiry.id, status: "read" });
        }
        setSelectedInquiry(inquiry);
    };

    const handleStatusUpdate = (id: number, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    const statusCounts = useMemo(() => {
        return {
            all: inquiries.length,
            new: inquiries.filter((i) => i.status === "new").length,
            unread: inquiries.filter((i) => i.status === "new" || i.status === "read").length,
            archived: inquiries.filter((i) => i.status === "archived").length,
        };
    }, [inquiries]);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gelen Kutusu</h1>
                    <p className="page-subtitle">Müşteri iletişim talepleri ve mesajları</p>
                </div>
            </div>

            <div className="card p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-60">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="İsim veya e-posta ile ara..."
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
                                <option key={site.id} value={String(site.id)}>
                                    {site.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2">
                        {[
                            { value: "all", label: "Tümü", count: statusCounts.all },
                            { value: "new", label: "Yeni", count: statusCounts.new },
                            { value: "unread", label: "Okunmayanlar", count: statusCounts.unread },
                            { value: "archived", label: "Arşiv", count: statusCounts.archived },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${statusFilter === filter.value
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {filter.label} {filter.count > 0 && <span className="ml-1 text-xs">({filter.count})</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {inquiries.length === 0 ? (
                <div className="card p-12 text-center">
                    <MessageSquare size={40} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                        {searchQuery || siteFilter !== "all" || statusFilter !== "all"
                            ? "Filtrelere uygun talep bulunamadı"
                            : "Henüz talep bulunmuyor"}
                    </p>
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="card divide-y divide-slate-100">
                    {inquiries.map((inquiry) => {
                        const isNew = inquiry.status === "new";
                        const isRead = inquiry.status === "read";
                        const isUnread = isNew || isRead;
                        const site = sites.find((s) => s.id === inquiry.site_id);
                        const payload = inquiry.payload ?? {};

                        const COMPANY_KEYS = ["şirket adı", "şirket", "kurum", "firma", "kuruluş", "organization", "company"];
                        const SUBJECT_KEYS = ["konu", "talep türü", "talep tipi", "hizmet", "ürün", "subject", "aciliyet", "quote_type"];
                        const MESSAGE_KEYS = ["mesaj", "açıklama", "not", "message", "description", "arıza tanımı"];

                        const findByKeys = (keys: string[]) => {
                            const entry = Object.entries(payload).find(([k]) => keys.includes(k.toLowerCase()));
                            return entry?.[1] ?? null;
                        };

                        const company = findByKeys(COMPANY_KEYS);
                        const subject = findByKeys(SUBJECT_KEYS);
                        const messageRaw = findByKeys(MESSAGE_KEYS) ??
                            Object.values(payload).find((v) => v.length > 40) ?? "";
                        const messagePreview = messageRaw.length > 110
                            ? messageRaw.substring(0, 110) + "…"
                            : messageRaw;

                        const borderClass = isNew
                            ? "border-l-2 border-l-blue-500 bg-blue-50/30"
                            : isRead
                                ? "border-l-2 border-l-emerald-400 bg-emerald-50/20"
                                : "";

                        return (
                            <div
                                key={inquiry.id}
                                onClick={() => handleRowClick(inquiry)}
                                className={`px-5 py-5 cursor-pointer transition-all hover:bg-slate-50/80 ${borderClass}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Line 1: Name · email · company · badges — all inline */}
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`text-sm ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                                                {inquiry.sender_name}
                                            </span>
                                            <span className="text-slate-300 text-xs">·</span>
                                            <span className="text-xs text-indigo-500">{inquiry.sender_email}</span>
                                            {company && (
                                                <>
                                                    <span className="text-slate-300 text-xs">·</span>
                                                    <span className="text-xs text-slate-500">{company}</span>
                                                </>
                                            )}
                                            {isNew && (
                                                <span className={`ml-0.5 px-1.5 py-px text-[9px] font-bold text-white rounded-full leading-none ${inquiry.member_id ? "bg-indigo-600" : "bg-blue-500"}`}>
                                                    {inquiry.member_id ? "YENİ MESAJ" : "YENİ"}
                                                </span>
                                            )}
                                            {site && (
                                                <span className="px-1.5 py-px text-[9px] font-medium bg-violet-100 text-violet-700 rounded border border-violet-200 leading-none">
                                                    {site.name}
                                                </span>
                                            )}
                                        </div>
                                        {/* Line 2: Subject */}
                                        {subject && (
                                            <p className={`text-xs mb-0.5 ${isUnread ? "font-medium text-slate-700" : "text-slate-500"}`}>
                                                {subject}
                                            </p>
                                        )}
                                        {/* Line 3: Message preview */}
                                        {messagePreview && (
                                            <p className="text-xs text-slate-400 line-clamp-1">
                                                {messagePreview}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 whitespace-nowrap pt-0.5 shrink-0">
                                        {new Date(inquiry.created_at).toLocaleDateString("tr-TR", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedInquiry && (
                <InquiryDrawer
                    inquiry={selectedInquiry}
                    sites={sites}
                    onClose={() => setSelectedInquiry(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={(id) => deleteMutation.mutate(id)}
                />
            )}
        </div>
    );
}
