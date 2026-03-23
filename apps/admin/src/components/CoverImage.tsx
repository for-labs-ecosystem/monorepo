import { useState, useRef, useCallback } from "react";
import { ImageIcon, Upload, X, Camera } from "lucide-react";
import { api } from "../lib/api";

interface CoverImageProps {
    value: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export default function CoverImage({ value, onChange, disabled }: CoverImageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleUpload = useCallback(
        async (file: File) => {
            if (!file.type.startsWith("image/")) return;
            setUploading(true);
            try {
                const res = await api.uploadMedia(file, "pages");
                onChange(res.data.url);
            } catch (err) {
                console.error("Cover image upload failed:", err);
            } finally {
                setUploading(false);
            }
        },
        [onChange]
    );

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
    };

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
        },
        [handleUpload]
    );

    if (value) {
        return (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                    src={value}
                    alt="Kapak görseli"
                    className="w-full h-48 md:h-56 object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-bold text-slate-700 hover:bg-white transition-all shadow-sm"
                        >
                            <Camera size={13} /> Değiştir
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            disabled={disabled}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 transition-all shadow-sm"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileSelect}
                />
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                dragOver
                    ? "border-indigo-400 bg-indigo-50/50 shadow-inner"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/30"
            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
        >
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
                {uploading ? (
                    <>
                        <Upload size={28} className="text-indigo-400 animate-bounce" />
                        <span className="text-xs font-bold text-indigo-500">Yükleniyor...</span>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <ImageIcon size={22} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-600">
                                Kapak Görseli Ekle
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Tıklayın veya sürükleyip bırakın · PNG, JPG, WebP
                            </p>
                        </div>
                    </>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
            />
        </div>
    );
}
