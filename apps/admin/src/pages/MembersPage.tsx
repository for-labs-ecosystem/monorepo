import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Member } from "@forlabs/shared";
import {
    Users,
    Search,
    ChevronDown,
    Mail,
    Building2,
    Shield,
    ShieldCheck,
    UserX,
    UserCheck,
    X,
    Phone,
    Calendar,
    MapPin,
    Trash2,
    Plus,
    Loader2,
    Eye,
    AlertTriangle,
    Package,
    Clock,
    KeyRound,
    FileText,
} from "lucide-react";

interface Site {
    id: number;
    slug: string;
    name: string;
}

interface Address {
    id: string;
    type: "individual" | "corporate";
    title: string;
    city: string;
    district: string;
    full_address: string;
    company_name?: string;
    tax_office?: string;
    tax_number?: string;
}

interface MemberOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    currency: string;
    created_at: string;
}

/** Determine registration method from boolean indicators */
function getAuthMethod(member: Member & { has_password?: number; has_google?: number }): {
    label: string;
    color: string;
} {
    if (member.has_google) {
        return { label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (member.has_password) {
        return { label: "Şifre", color: "bg-slate-50 text-slate-600 border-slate-200" };
    }
    return { label: "—", color: "bg-slate-50 text-slate-400 border-slate-200" };
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
    processing: { label: "Hazırlanıyor", color: "bg-blue-50 text-blue-700 border-blue-200" },
    shipped: { label: "Kargoda", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    delivered: { label: "Teslim Edildi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "İptal", color: "bg-red-50 text-red-600 border-red-200" },
};

const paymentLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Ödeme Bekleniyor", color: "bg-amber-50 text-amber-600 border-amber-200" },
    paid: { label: "Ödendi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    failed: { label: "Başarısız", color: "bg-red-50 text-red-600 border-red-200" },
};

export default function MembersPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [siteFilter, setSiteFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

    // Fetch sites for filter dropdown
    const { data: sitesData } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    // Fetch members
    const { data, isLoading } = useQuery({
        queryKey: ["members", siteFilter, activeFilter, searchQuery],
        queryFn: () =>
            api.getMembers({
                site_id: siteFilter,
                is_active: activeFilter === "all" ? undefined : activeFilter,
                search: searchQuery || undefined,
            }),
    });

    // Fetch selected member detail
    const { data: memberDetail, isLoading: detailLoading } = useQuery({
        queryKey: ["member", selectedMemberId],
        queryFn: () => api.getMember(selectedMemberId!),
        enabled: !!selectedMemberId,
    });

    // Fetch selected member's orders
    const { data: memberOrdersData } = useQuery({
        queryKey: ["member-orders", selectedMemberId],
        queryFn: () => api.getMemberOrders(selectedMemberId!),
        enabled: !!selectedMemberId,
    });

    const sites: Site[] = sitesData?.data || [];
    const members = useMemo(() => data?.data || [], [data]);
    const memberOrders: MemberOrder[] = memberOrdersData?.data || [];

    // Toggle active status mutation
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: number }) =>
            api.updateMember(id, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["member"] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteMember(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            setSelectedMemberId(null);
            setShowDeleteConfirm(null);
        },
    });

    // Password reset mutation
    const resetPasswordMutation = useMutation({
        mutationFn: ({ id, password }: { id: string; password: string }) =>
            api.resetMemberPassword(id, password),
        onSuccess: () => {
            setPasswordMsg("Şifre başarıyla sıfırlandı.");
            setNewPassword("");
            setTimeout(() => { setPasswordMsg(null); setShowPasswordReset(false); }, 2000);
        },
        onError: (err: any) => setPasswordMsg(err.message || "Hata oluştu"),
    });

    // Stats
    const stats = useMemo(() => {
        const total = members.length;
        const active = members.filter((m: any) => m.is_active === 1).length;
        const inactive = total - active;
        const corporate = members.filter((m: any) => m.company_name).length;
        return { total, active, inactive, corporate };
    }, [members]);

    const selectedMember = memberDetail?.data;

    const formatPrice = (price: number, currency: string) =>
        new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY" }).format(price);

    return (
        <div className="flex">
            {/* Main content */}
            <div className={`flex-1 transition-all duration-300 ${selectedMemberId ? "mr-[440px]" : ""}`}>
                <div className="page-header flex items-center justify-between">
                    <div>
                        <h1 className="page-title">Üye Yönetimi</h1>
                        <p className="page-subtitle">
                            Platforma kayıtlı son kullanıcılar ve üye hesapları
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={13} />
                            Üye Ekle
                        </button>
                        {stats.total > 0 && (
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium">
                                    <Users size={12} />
                                    {stats.total} Üye
                                </span>
                                {stats.corporate > 0 && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-lg text-violet-700 font-medium">
                                        <Building2 size={12} />
                                        {stats.corporate} Kurumsal
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-60">
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Ad, e-posta veya şirket adı ara..."
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
                            <ChevronDown
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            {[
                                { value: "all", label: "Tümü", count: stats.total },
                                { value: "1", label: "Aktif", count: stats.active },
                                { value: "0", label: "Pasif", count: stats.inactive },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setActiveFilter(f.value)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${activeFilter === f.value
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {f.label}
                                    {f.count > 0 && (
                                        <span className="ml-1 text-xs opacity-60">
                                            ({f.count})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                {members.length === 0 && !isLoading ? (
                    <div className="card p-12 text-center">
                        <Users
                            size={40}
                            strokeWidth={1}
                            className="text-slate-300 mx-auto mb-3"
                        />
                        <p className="text-sm text-slate-500">
                            {searchQuery ||
                                siteFilter !== "all" ||
                                activeFilter !== "all"
                                ? "Filtrelere uygun üye bulunamadı"
                                : "Henüz kayıtlı üye bulunmuyor"}
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
                                    <th>Ad Soyad</th>
                                    <th>Şirket</th>
                                    <th>E-posta</th>
                                    <th>Site</th>
                                    <th>Kayıt Yöntemi</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>Durum</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member: any) => {
                                    const auth = getAuthMethod(member);
                                    const site = sites.find(
                                        (s) => s.id === member.site_id
                                    );
                                    const isActive = member.is_active === 1;
                                    const isSelected = selectedMemberId === member.id;

                                    return (
                                        <tr
                                            key={member.id}
                                            onClick={() => setSelectedMemberId(member.id)}
                                            className={`cursor-pointer transition-colors ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50/80"}`}
                                        >
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive
                                                            ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                                                            : "bg-slate-100 text-slate-400 border border-slate-200"
                                                            }`}
                                                    >
                                                        {member.full_name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "?"}
                                                    </div>
                                                    <span className="font-medium text-slate-800 text-sm">
                                                        {member.full_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {member.company_name ? (
                                                    <span className="flex items-center gap-1 text-xs text-violet-700">
                                                        <Building2 size={11} />
                                                        {member.company_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Mail size={11} className="text-slate-400" />
                                                    {member.email}
                                                </span>
                                            </td>
                                            <td>
                                                {site && (
                                                    <span className="px-1.5 py-px text-[9px] font-medium bg-violet-100 text-violet-700 rounded border border-violet-200">
                                                        {site.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border ${auth.color}`}
                                                >
                                                    {auth.label === "Google" ? (
                                                        <ShieldCheck size={10} />
                                                    ) : (
                                                        <Shield size={10} />
                                                    )}
                                                    {auth.label}
                                                </span>
                                            </td>
                                            <td className="text-xs text-slate-400 whitespace-nowrap">
                                                {new Date(
                                                    member.created_at
                                                ).toLocaleDateString("tr-TR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-red-50 text-red-600 border-red-200"
                                                        }`}
                                                >
                                                    {isActive ? "Aktif" : "Pasif"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMemberId(member.id);
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                                                    title="Detayları Gör"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Detail Sidebar ─── */}
            {selectedMemberId && (
                <div className="fixed right-0 top-0 h-full w-[440px] bg-white border-l border-slate-200 shadow-xl z-50 overflow-y-auto">
                    {/* Sidebar Header */}
                    <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="text-sm font-bold text-slate-900">Üye Detayı</h3>
                        <button
                            onClick={() => { setSelectedMemberId(null); setShowPasswordReset(false); }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {detailLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={20} className="animate-spin text-indigo-500" />
                        </div>
                    ) : selectedMember ? (
                        <div className="p-6 space-y-6">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${selectedMember.is_active === 1
                                        ? "bg-indigo-500/10 text-indigo-600 border-2 border-indigo-500/20"
                                        : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                                        }`}
                                >
                                    {selectedMember.full_name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900">{selectedMember.full_name}</p>
                                    <p className="text-xs text-slate-500">{selectedMember.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${selectedMember.is_active === 1
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-red-50 text-red-600 border-red-200"
                                                }`}
                                        >
                                            {selectedMember.is_active === 1 ? "Aktif" : "Pasif"}
                                        </span>
                                        {(() => {
                                            const auth = getAuthMethod(selectedMember as any);
                                            return (
                                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${auth.color}`}>
                                                    {auth.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="space-y-3">
                                {selectedMember.phone && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Phone size={14} className="text-slate-400" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Telefon</p>
                                            <p className="text-sm text-slate-700">{selectedMember.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedMember.company_name && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
                                        <Building2 size={14} className="text-violet-400" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Şirket</p>
                                            <p className="text-sm text-violet-700 font-medium">{selectedMember.company_name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <Calendar size={14} className="text-slate-400" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kayıt Tarihi</p>
                                        <p className="text-sm text-slate-700">
                                            {new Date(selectedMember.created_at!).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {(() => {
                                    const site = sites.find(s => s.id === selectedMember.site_id);
                                    return site ? (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Users size={14} className="text-slate-400" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Site</p>
                                                <p className="text-sm text-slate-700">{site.name}</p>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* ─── Member Orders ─── */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Package size={12} />
                                    Siparişler ({memberOrders.length})
                                </h4>
                                {memberOrders.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">Bu üyeye ait sipariş bulunmuyor.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {memberOrders.map((order) => {
                                            const sLabel = statusLabels[order.status] || statusLabels.pending;
                                            const pLabel = paymentLabels[order.payment_status] || paymentLabels.pending;
                                            const isPaid = order.payment_status === "paid";
                                            return (
                                                <div key={order.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-bold text-slate-800">#{order.order_number}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded border ${sLabel.color}`}>
                                                                {sLabel.label}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded border ${pLabel.color}`}>
                                                                {pLabel.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            <Clock size={10} />
                                                            {new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {formatPrice(order.total, order.currency)}
                                                            </span>
                                                            {isPaid && (
                                                                <a
                                                                    href={api.getOrderInvoiceUrl(order.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1 rounded border border-indigo-200 text-indigo-500 hover:bg-indigo-50 transition-colors"
                                                                    title="Faturayı Görüntüle"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FileText size={10} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Addresses */}
                            {(() => {
                                let addresses: Address[] = [];
                                try {
                                    addresses = selectedMember.addresses ? JSON.parse(selectedMember.addresses as string) : [];
                                } catch { addresses = []; }
                                if (addresses.length === 0) return null;
                                return (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <MapPin size={12} />
                                            Kayıtlı Adresler ({addresses.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {addresses.map((addr) => (
                                                <div key={addr.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-slate-700">{addr.title}</span>
                                                        <span className={`px-1 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${addr.type === "corporate" ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500"}`}>
                                                            {addr.type === "corporate" ? "Kurumsal" : "Bireysel"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">{addr.full_address}</p>
                                                    <p className="text-[10px] text-slate-400">{addr.district}, {addr.city}</p>
                                                    {addr.type === "corporate" && addr.company_name && (
                                                        <p className="text-[10px] text-violet-500 mt-0.5">
                                                            {addr.company_name} — VD: {addr.tax_office} — VN: {addr.tax_number}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ─── Password Reset ─── */}
                            <div className="border-t border-slate-100 pt-4">
                                {!showPasswordReset ? (
                                    <button
                                        onClick={() => { setShowPasswordReset(true); setNewPassword(""); setPasswordMsg(null); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        <KeyRound size={14} />
                                        Şifre Sıfırla
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <KeyRound size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Yeni Şifre Belirle</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Yeni şifre (en az 6 karakter)"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newPassword.length < 6) {
                                                        setPasswordMsg("En az 6 karakter gerekli.");
                                                        return;
                                                    }
                                                    resetPasswordMutation.mutate({ id: selectedMember.id!, password: newPassword });
                                                }}
                                                disabled={resetPasswordMutation.isPending}
                                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-all flex items-center gap-1.5"
                                            >
                                                {resetPasswordMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                                                Kaydet
                                            </button>
                                        </div>
                                        {passwordMsg && (
                                            <p className={`text-xs font-medium ${passwordMsg.includes("başarı") ? "text-emerald-600" : "text-red-600"}`}>
                                                {passwordMsg}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => { setShowPasswordReset(false); setPasswordMsg(null); }}
                                            className="text-xs text-slate-400 hover:text-slate-600"
                                        >
                                            Vazgeç
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() =>
                                        toggleActiveMutation.mutate({
                                            id: selectedMember.id!,
                                            is_active: selectedMember.is_active === 1 ? 0 : 1,
                                        })
                                    }
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-all ${selectedMember.is_active === 1
                                        ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                        }`}
                                >
                                    {selectedMember.is_active === 1 ? (
                                        <>
                                            <UserX size={14} />
                                            Devre Dışı Bırak
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck size={14} />
                                            Aktifleştir
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(selectedMember.id!)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 size={14} />
                                    Üyeyi Sil
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* ─── Create Member Modal ─── */}
            {showCreateModal && (
                <CreateMemberModal
                    sites={sites}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["members"] });
                        setShowCreateModal(false);
                    }}
                />
            )}

            {/* ─── Delete Confirm Modal ─── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-center text-base font-bold text-slate-900 mb-2">Üyeyi Sil?</h3>
                        <p className="text-center text-sm text-slate-500 mb-6">
                            Bu üye kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(showDeleteConfirm)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all"
                            >
                                {deleteMutation.isPending ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Create Member Modal Component ───
function CreateMemberModal({
    sites,
    onClose,
    onSuccess,
}: {
    sites: Site[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        company_name: "",
        site_id: sites[0]?.id || 1,
    });
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: () => api.createMember(form),
        onSuccess: () => onSuccess(),
        onError: (err: any) => setError(err.message || "Bir hata oluştu"),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.full_name || !form.email || !form.password) {
            setError("Ad Soyad, E-posta ve Şifre alanları zorunludur.");
            return;
        }
        createMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Yeni Üye Ekle</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Ad Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                            className="input w-full"
                            placeholder="Kullanıcının tam adı"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            E-posta <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                            className="input w-full"
                            placeholder="kullanici@ornek.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Şifre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.password}
                            onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                            className="input w-full"
                            placeholder="En az 6 karakter"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefon</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                                className="input w-full"
                                placeholder="+90 555 ..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Şirket</label>
                            <input
                                type="text"
                                value={form.company_name}
                                onChange={(e) => setForm(p => ({ ...p, company_name: e.target.value }))}
                                className="input w-full"
                                placeholder="Opsiyonel"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Site <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.site_id}
                            onChange={(e) => setForm(p => ({ ...p, site_id: Number(e.target.value) }))}
                            className="input w-full"
                        >
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                            Üye Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
