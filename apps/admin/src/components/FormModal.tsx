import { useState } from "react";

interface FormField {
    key: string;
    label: string;
    type?: "text" | "textarea" | "number" | "select" | "checkbox";
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
}

interface FormModalProps {
    title: string;
    fields: FormField[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    onClose: () => void;
}

export default function FormModal({
    title,
    fields,
    initialData,
    onSubmit,
    onClose,
}: FormModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>(
        initialData || {}
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "İşlem başarısız");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl shadow-black/40 m-4">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 rounded-t-xl flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                            </label>

                            {field.type === "textarea" ? (
                                <textarea
                                    value={formData[field.key] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [field.key]: e.target.value })
                                    }
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    rows={4}
                                    className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-y"
                                />
                            ) : field.type === "select" ? (
                                <select
                                    value={formData[field.key] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [field.key]: e.target.value })
                                    }
                                    required={field.required}
                                    className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                >
                                    <option value="">Seçiniz...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "checkbox" ? (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!formData[field.key]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [field.key]: e.target.checked })
                                        }
                                        className="w-4 h-4 rounded border-border bg-input accent-accent"
                                    />
                                    <span className="text-sm text-card-foreground">
                                        {field.placeholder || "Evet"}
                                    </span>
                                </label>
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    value={formData[field.key] || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [field.key]:
                                                field.type === "number"
                                                    ? Number(e.target.value)
                                                    : e.target.value,
                                        })
                                    }
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                />
                            )}
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && (
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            )}
                            {initialData?.id ? "Güncelle" : "Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
