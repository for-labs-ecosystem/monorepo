import { useCallback, useState } from "react";
import { Upload, X, FileImage, Check } from "lucide-react";

interface DropZoneProps {
    value?: string;
    onChange: (url: string) => void;
    accept?: string;
    label?: string;
    hint?: string;
}

export default function DropZone({
    value,
    onChange,
    accept = "image/*,application/pdf",
    label = "Dosya yükle veya sürükle bırak",
    hint = "PNG, JPG, PDF — maks 10MB",
}: DropZoneProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const upload = useCallback(async (file: File) => {
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const token = localStorage.getItem("cms_token");
            const res = await fetch("/api/media/upload", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Yükleme başarısız");
            }
            const json = await res.json();
            onChange(json.data?.url ?? json.url ?? "");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
    };

    if (value) {
        return (
            <div className="relative rounded-xl border-2 border-indigo-200 bg-indigo-50/40 overflow-hidden group">
                <div className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {value.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                            <img src={value} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <FileImage size={20} className="text-indigo-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-500" />
                            Dosya yüklendi
                        </p>
                        <p className="text-xs text-slate-400 truncate">{value}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400"
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="border-t border-indigo-100 px-4 pb-3 pt-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="input text-xs"
                        placeholder="veya URL girin"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${dragging
                        ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-indigo-600 font-medium">Yükleniyor...</span>
                    </div>
                ) : (
                    <>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${dragging ? "bg-indigo-100" : "bg-slate-100"}`}>
                            <Upload size={20} className={dragging ? "text-indigo-500" : "text-slate-400"} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-700">{label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
                        </div>
                    </>
                )}
                <input type="file" accept={accept} className="sr-only" onChange={handleFile} />
            </label>

            {/* Also allow manual URL */}
            <input
                type="text"
                placeholder="veya direkt URL yapıştırın"
                className="input text-xs"
                onBlur={(e) => e.target.value && onChange(e.target.value)}
            />

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <X size={11} /> {error}
                </p>
            )}
        </div>
    );
}
