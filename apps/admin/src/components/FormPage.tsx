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
        <div className="tab-list">
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
        <div className="space-y-1">
            <label className="label">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {hint && <p className="label-hint">{hint}</p>}
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
    children: React.ReactNode; // main form area
    sidebar?: React.ReactNode; // right panel
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
        if (!window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) return;
        setDeleting(true);
        try {
            await onDelete();
            navigate(backHref);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* ── Breadcrumb + actions ── */}
            <div className="page-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(backHref)}
                        className="btn btn-ghost btn-sm p-1.5"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">{title}</h1>
                        {subtitle && <p className="page-subtitle">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isEdit && onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn btn-danger btn-sm"
                        >
                            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Sil
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate(backHref)}
                        className="btn btn-secondary btn-sm"
                    >
                        İptal
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="btn btn-primary btn-sm"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Yayınla"}
                    </button>
                </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="flex gap-5">
                {/* Left — main form (grows) */}
                <div className="flex-1 min-w-0 space-y-5">
                    {children}
                </div>

                {/* Right — sidebar (fixed width) */}
                {sidebar && (
                    <div className="w-72 flex-shrink-0 space-y-4">
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
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {title}
            </h3>
            {children}
        </div>
    );
}

/* ─── Section card within form ─── */
export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="card p-6">
            {(title || description) && (
                <div className="mb-5 pb-4 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                    {description && (
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    )}
                </div>
            )}
            <div className="space-y-5">{children}</div>
        </div>
    );
}
