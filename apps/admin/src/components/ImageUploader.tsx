import { useState, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { Upload, X, Loader2, ImageIcon, Link2 } from "lucide-react";

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    category?: string;
    label?: string;
    hint?: string;
    aspectRatio?: "square" | "video" | "banner";
    showUrlInput?: boolean;
}

export default function ImageUploader({
    value,
    onChange,
    category = "projects",
    label,
    hint,
    aspectRatio = "video",
    showUrlInput = true,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"upload" | "url">("upload");
    const [urlInput, setUrlInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const aspectClasses = {
        square: "aspect-square",
        video: "aspect-video",
        banner: "aspect-[3/1]",
    };

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Sadece görsel dosyaları yükleyebilirsiniz");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("Dosya boyutu 10MB'dan küçük olmalı");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const result = await api.uploadMedia(file, category);
            onChange(result.data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    }, [category, onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput("");
            setMode("upload");
        }
    };

    const handleClear = () => {
        onChange("");
        setError(null);
    };

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {label}
                    </label>
                    {showUrlInput && (
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setMode("upload")}
                                className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                    mode === "upload"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <Upload size={12} className="inline mr-1" />
                                Yükle
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("url")}
                                className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                    mode === "url"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <Link2 size={12} className="inline mr-1" />
                                URL
                            </button>
                        </div>
                    )}
                </div>
            )}
            {hint && <p className="text-[10px] text-slate-400">{hint}</p>}

            {mode === "url" ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="input h-10 flex-1 text-xs"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="px-4 h-10 bg-indigo-500 text-white rounded-xl text-xs font-medium hover:bg-indigo-600 transition-colors"
                    >
                        Ekle
                    </button>
                </div>
            ) : value ? (
                <div className={`relative rounded-xl overflow-hidden border border-slate-200 ${aspectClasses[aspectRatio]} bg-slate-50 group`}>
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
                        }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 bg-white/90 text-slate-700 rounded-lg text-xs font-medium hover:bg-white transition-colors"
                        >
                            <Upload size={14} className="inline mr-1" />
                            Değiştir
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${aspectClasses[aspectRatio]}
                        ${dragOver
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        }
                        ${uploading ? "pointer-events-none" : ""}
                    `}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        {uploading ? (
                            <>
                                <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                <span className="text-xs text-slate-500">Yükleniyor...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <ImageIcon size={20} className="text-slate-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-slate-600">
                                        Görsel yüklemek için tıklayın
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        veya sürükleyip bırakın
                                    </p>
                                </div>
                                <p className="text-[10px] text-slate-300 mt-2">
                                    PNG, JPG, WEBP • Max 10MB
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <X size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

interface GalleryUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    category?: string;
    maxImages?: number;
}

export function GalleryUploader({
    value,
    onChange,
    category = "projects",
    maxImages = 20,
}: GalleryUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (files: FileList) => {
        const validFiles = Array.from(files).filter(
            (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
        );

        if (validFiles.length === 0) {
            setError("Geçerli görsel dosyası bulunamadı");
            return;
        }

        if (value.length + validFiles.length > maxImages) {
            setError(`En fazla ${maxImages} görsel ekleyebilirsiniz`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const uploadPromises = validFiles.map((file) =>
                api.uploadMedia(file, category)
            );
            const results = await Promise.all(uploadPromises);
            const newUrls = results.map((r) => r.data.url);
            onChange([...value, ...newUrls]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (url: string) => {
        onChange(value.filter((v) => v !== url));
    };

    const handleUrlAdd = () => {
        if (urlInput.trim() && !value.includes(urlInput.trim())) {
            if (value.length >= maxImages) {
                setError(`En fazla ${maxImages} görsel ekleyebilirsiniz`);
                return;
            }
            onChange([...value, urlInput.trim()]);
            setUrlInput("");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="URL ile ekle veya aşağıdan yükle..."
                    className="input h-10 flex-1 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
                />
                <button
                    type="button"
                    onClick={handleUrlAdd}
                    className="px-3 h-10 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                    URL Ekle
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 h-10 bg-indigo-500 text-white rounded-xl text-xs font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                    {uploading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Upload size={14} />
                    )}
                    Yükle
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <X size={12} />
                    {error}
                </p>
            )}

            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {value.map((url, idx) => (
                        <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50"
                        >
                            <img
                                src={url}
                                alt={`Galeri ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(url)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <X size={12} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-white">{idx + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {value.length === 0 && !uploading && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 transition-all"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <ImageIcon size={20} className="text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                        Galeri görselleri yüklemek için tıklayın
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                        Birden fazla görsel seçebilirsiniz
                    </p>
                </div>
            )}

            <p className="text-[10px] text-slate-400 text-right">
                {value.length} / {maxImages} görsel
            </p>
        </div>
    );
}
