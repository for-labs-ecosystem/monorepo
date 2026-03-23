import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Save, Trash2 } from "lucide-react";

/* ─── Bilingual Tab ─── */
export type Lang = "tr" | "en";

export function LangTabs({
    lang,
    onChange,
}: {
    lang: Lang;
    onChange: (l: Lang) => void;
}) {
    return (
        <div className="tab-list mb-6">
            {(["tr", "en"] as Lang[]).map((l) => (
                <button
                    key={l}
                    type="button"
                    onClick={() => onChange(l)}
                    className={`tab-btn ${lang === l ? "active" : ""}`}
                >
                    {l === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
                </button>
            ))}
        </div>
    );
}

/* ─── Field helpers ─── */
export function FormField({
    label,
    hint,
    required,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2 overflow-visible">
            <label className="label flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-slate-700 tracking-tight">{label}</span>
                {required && <span className="text-rose-500 text-sm">*</span>}
            </label>
            {hint && <p className="text-xs text-slate-500 leading-relaxed -mt-0.5 mb-2">{hint}</p>}
            {children}
        </div>
    );
}

/* ─── Main Page Layout ─── */
interface FormPageProps {
    title: string;
    subtitle?: string;
    backHref: string;
    onSave: () => Promise<void>;
    onDelete?: () => Promise<void>;
    isEdit?: boolean;
    saving?: boolean;
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export default function FormPage({
    title,
    subtitle,
    backHref,
    onSave,
    onDelete,
    isEdit = false,
    saving = false,
    children,
    sidebar,
}: FormPageProps) {
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!onDelete) return;
        setDeleting(true);
        try {
            await onDelete();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-350 mx-auto pb-20">
            {/* ── Header ── */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(backHref)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                        {subtitle && <p className="text-sm font-medium text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEdit && onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting || saving}
                            className="btn bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all h-10 px-4"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            <span className="font-bold text-xs uppercase tracking-wider">Kayıdı Sil</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate(backHref)}
                        className="btn bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 h-10 px-4"
                    >
                        <span className="font-bold text-xs uppercase tracking-wider">İptal</span>
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="btn btn-primary h-10 px-6 shadow-lg shadow-indigo-100"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="font-bold text-xs uppercase tracking-wider">
                            {saving ? "Kaydediliyor..." : isEdit ? "Değişiklikleri Kaydet" : "Yeni Kayıt Oluştur"}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left — main form (grows) */}
                <div className="lg:col-span-8 space-y-8">
                    {children}
                </div>

                {/* Right — sidebar (fixed width) */}
                {sidebar && (
                    <div className="lg:col-span-4 space-y-6">
                        {sidebar}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Sidebar Card helper ─── */
export function SidebarCard({
    title,
    icon,
    children,
    overflow = "hidden",
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    overflow?: "hidden" | "visible";
}) {
    return (
        <div className={`bg-white border border-slate-200/60 rounded-xl shadow-sm ${overflow === "visible" ? "overflow-visible" : "overflow-hidden"}`}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
                {icon && <span className="text-slate-500">{icon}</span>}
                <h3 className="text-xs font-semibold text-slate-700 tracking-tight">
                    {title}
                </h3>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}

/* ─── Section card within form ─── */
export function FormSection({
    title,
    description,
    icon,
    columns = 1,
    children,
}: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    columns?: 1 | 2;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-visible">
            {(title || description) && (
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
                    {icon && (
                        <div className="w-11 h-11 rounded-lg bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-600 shrink-0 shadow-sm ring-1 ring-slate-200/50">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h2>
                        {description && (
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
                        )}
                    </div>
                </div>
            )}
            <div className={`px-6 pb-6 pt-5 ${columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5' : 'space-y-5'}`}>
                {children}
            </div>
        </div>
    );
}
