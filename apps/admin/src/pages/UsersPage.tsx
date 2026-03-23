import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
    UserPlus,
    Shield,
    ShieldCheck,
    PenLine,
    Loader2,
    MoreHorizontal,
    Ban,
    CheckCircle2,
    Trash2,
    X,
    Crown,
} from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    super_admin: { label: "Super Admin", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
    admin: { label: "Admin", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
    editor: { label: "Editör", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.editor;
    const Icon = role === "super_admin" ? Crown : role === "admin" ? ShieldCheck : PenLine;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <Icon size={11} strokeWidth={2} />
            {cfg.label}
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} strokeWidth={2} />
            Aktif
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
            <Ban size={11} strokeWidth={2} />
            Askıda
        </span>
    );
}

function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [actionMenu, setActionMenu] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    // Modal form state
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState("editor");
    const [modalError, setModalError] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => api.getUsers(),
    });

    const createMutation = useMutation({
        mutationFn: (data: { email: string; role: string }) => api.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setShowModal(false);
            setNewEmail("");
            setNewRole("editor");
            setModalError("");
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { role?: string; is_active?: boolean } }) =>
            api.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setActionMenu(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setConfirmDelete(null);
        },
    });

    const users = data?.data ?? [];
    const isSuperAdmin = currentUser?.role === "super_admin";

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setModalError("");
        if (!newEmail.includes("@")) {
            setModalError("Geçerli bir e-posta adresi giriniz");
            return;
        }
        createMutation.mutate({ email: newEmail, role: newRole });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Kullanıcılar</h1>
                    <p className="page-subtitle">CMS paneline erişim yetkisi olan hesaplar</p>
                </div>
                {isSuperAdmin && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <UserPlus size={15} />
                        Yeni Kullanıcı Yetkilendir
                    </button>
                )}
            </div>

            {/* Info banner */}
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-indigo-700">
                <Shield size={14} strokeWidth={2} className="shrink-0" />
                <p className="text-xs leading-relaxed">
                    Giriş yöntemi yalnızca <strong>Google OAuth (SSO)</strong> ile çalışır. Buraya eklenen e-posta adresleri sisteme giriş yetkisi alır.
                    İsim ve avatar bilgileri ilk Google girişinde otomatik dolar.
                </p>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                </div>
            ) : users.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-sm text-slate-500">Henüz kullanıcı yok.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Rol</th>
                                <th>Durum</th>
                                <th>Son Giriş</th>
                                <th>Eklenme</th>
                                {isSuperAdmin && <th className="text-right">İşlem</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => {
                                const isRoot = u.email === "info@for-labs.com";
                                const isSelf = currentUser?.id === u.id;
                                return (
                                    <tr key={u.id}>
                                        {/* User cell — avatar + name + email */}
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img
                                                        src={u.avatar_url}
                                                        alt={u.name || u.email}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                                                        {(u.name || u.email).charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">
                                                        {u.name || <span className="text-slate-400 italic">Henüz giriş yapmadı</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td><RoleBadge role={u.role} /></td>

                                        {/* Status */}
                                        <td><StatusBadge active={u.is_active} /></td>

                                        {/* Last login */}
                                        <td className="text-xs text-slate-500 tabular-nums">{formatDate(u.last_login)}</td>

                                        {/* Created */}
                                        <td className="text-xs text-slate-500 tabular-nums">{formatDate(u.created_at)}</td>

                                        {/* Actions */}
                                        {isSuperAdmin && (
                                            <td className="text-right">
                                                {isRoot ? (
                                                    <span className="text-[10px] text-slate-400 italic">Root</span>
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>

                                                        {actionMenu === u.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 text-left">
                                                                    {/* Toggle active */}
                                                                    {!isSelf && (
                                                                        <button
                                                                            onClick={() => updateMutation.mutate({ id: u.id, data: { is_active: !u.is_active } })}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                                                                        >
                                                                            {u.is_active ? (
                                                                                <>
                                                                                    <Ban size={13} className="text-amber-500" />
                                                                                    <span className="text-slate-700">Askıya Al</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle2 size={13} className="text-emerald-500" />
                                                                                    <span className="text-slate-700">Aktif Et</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )}

                                                                    {/* Change role */}
                                                                    {u.role === "admin" ? (
                                                                        <button
                                                                            onClick={() => updateMutation.mutate({ id: u.id, data: { role: "editor" } })}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                                                                        >
                                                                            <PenLine size={13} className="text-sky-500" />
                                                                            <span className="text-slate-700">Editör Yap</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => updateMutation.mutate({ id: u.id, data: { role: "admin" } })}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                                                                        >
                                                                            <ShieldCheck size={13} className="text-indigo-500" />
                                                                            <span className="text-slate-700">Admin Yap</span>
                                                                        </button>
                                                                    )}

                                                                    {/* Delete */}
                                                                    {!isSelf && (
                                                                        <>
                                                                            <div className="border-t border-slate-100 my-1" />
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActionMenu(null);
                                                                                    setConfirmDelete(u.id);
                                                                                }}
                                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Trash2 size={13} />
                                                                                <span>Kalıcı Olarak Sil</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── "Yeni Kullanıcı Yetkilendir" Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">Yeni Kullanıcı Yetkilendir</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Google hesabına erişim izni ver</p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setModalError(""); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            {modalError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {modalError}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="label">Google / E-posta Adresi</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="ornek@gmail.com veya isim@for-labs.com"
                                    required
                                    autoFocus
                                    className="input"
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Bu kişi yalnızca bu Google hesabıyla giriş yapabilecek.
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="label">Rol Seçimi</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewRole("admin")}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                            newRole === "admin"
                                                ? "border-indigo-500 bg-indigo-50/50"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <ShieldCheck size={18} className={newRole === "admin" ? "text-indigo-500" : "text-slate-400"} strokeWidth={1.75} />
                                        <p className={`text-sm font-semibold mt-2 ${newRole === "admin" ? "text-indigo-700" : "text-slate-700"}`}>Admin</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Tüm içerikleri yönetir</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setNewRole("editor")}
                                        className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                            newRole === "editor"
                                                ? "border-sky-500 bg-sky-50/50"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <PenLine size={18} className={newRole === "editor" ? "text-sky-500" : "text-slate-400"} strokeWidth={1.75} />
                                        <p className={`text-sm font-semibold mt-2 ${newRole === "editor" ? "text-sky-700" : "text-slate-700"}`}>Editör</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">İçerik düzenler</p>
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setModalError(""); }}
                                    className="btn btn-secondary flex-1"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="btn btn-primary flex-1"
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <UserPlus size={14} />
                                    )}
                                    Yetkilendir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation Modal ─── */}
            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={20} className="text-red-500" strokeWidth={1.75} />
                        </div>
                        <h3 className="text-center text-base font-semibold text-slate-800 mb-1">
                            Kullanıcıyı Sil
                        </h3>
                        <p className="text-center text-sm text-slate-500 mb-6">
                            Bu işlem geri alınamaz. Kullanıcı sisteme erişimini kalıcı olarak kaybedecek.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="btn btn-secondary flex-1"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(confirmDelete)}
                                disabled={deleteMutation.isPending}
                                className="btn btn-danger flex-1"
                            >
                                {deleteMutation.isPending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
