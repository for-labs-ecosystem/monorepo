import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
    Upload,
    Search,
    LayoutGrid,
    List,
    FileText,
    Loader2,
    X,
    Check,
    FileIcon,
} from "lucide-react";

interface MediaItem {
    id: number;
    site_id: number | null;
    filename: string;
    key: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text: string | null;
    created_at: string;
}

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string, item?: MediaItem) => void;
    /** Restrict to images only */
    imagesOnly?: boolean;
    /** Allow selecting multiple items */
    multiple?: boolean;
    onSelectMultiple?: (urls: string[], items?: MediaItem[]) => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function isImage(mime: string): boolean {
    return mime.startsWith("image/");
}

export default function MediaPicker({
    open,
    onClose,
    onSelect,
    imagesOnly = false,
    multiple = false,
    onSelectMultiple,
}: MediaPickerProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    // ─── Query ───
    const { data, isLoading } = useQuery({
        queryKey: ["media-picker", search, imagesOnly],
        queryFn: () =>
            api.getMediaList({
                mime: imagesOnly ? "image" : undefined,
                q: search || undefined,
            }),
        enabled: open,
    });

    const items: MediaItem[] = data?.data || [];

    // ─── Upload ───
    const handleUpload = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            if (fileArray.length === 0) return;

            setUploading(true);
            try {
                for (const file of fileArray) {
                    if (imagesOnly && !file.type.startsWith("image/")) continue;
                    await api.uploadMedia(file, "general");
                }
                queryClient.invalidateQueries({ queryKey: ["media-picker"] });
                queryClient.invalidateQueries({ queryKey: ["media"] });
            } catch {
                // Silently handle errors in picker
            } finally {
                setUploading(false);
            }
        },
        [queryClient, imagesOnly]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                handleUpload(e.dataTransfer.files);
            }
        },
        [handleUpload]
    );

    // ─── Selection ───
    const toggleSelect = (item: MediaItem) => {
        if (multiple) {
            const next = new Set(selected);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.add(item.id);
            }
            setSelected(next);
        } else {
            onSelect(item.url, item);
            onClose();
        }
    };

    const handleConfirmMultiple = () => {
        const selectedItems = items.filter((i) => selected.has(i.id));
        const urls = selectedItems.map((i) => i.url);
        onSelectMultiple?.(urls, selectedItems);
        onClose();
    };

    const handleClose = () => {
        setSelected(new Set());
        setSearch("");
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                            Medya Seçici
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {imagesOnly
                                ? "Kütüphaneden görsel seçin veya yeni yükleyin"
                                : "Kütüphaneden dosya seçin veya yeni yükleyin"}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ─── Toolbar ─── */}
                <div className="px-6 py-3 border-b border-slate-50 flex items-center gap-3 shrink-0">
                    {/* Upload button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        {uploading ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Upload size={13} />
                        )}
                        Yükle
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={imagesOnly ? "image/*" : undefined}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) handleUpload(e.target.files);
                            e.target.value = "";
                        }}
                    />

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                        />
                        <input
                            type="text"
                            placeholder="Dosya ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 h-8 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setView("grid")}
                            className={`p-1.5 rounded-md transition-all ${
                                view === "grid"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`p-1.5 rounded-md transition-all ${
                                view === "list"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>

                {/* ─── Content ─── */}
                <div
                    className="flex-1 overflow-y-auto p-6 relative"
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                    }}
                >
                    {/* Drag overlay */}
                    {dragOver && (
                        <div className="absolute inset-0 z-10 bg-indigo-50/80 backdrop-blur-sm border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <Upload
                                    size={36}
                                    className="text-indigo-500 mx-auto mb-2"
                                />
                                <p className="text-sm font-bold text-indigo-700">
                                    Bırakarak yükle
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2
                                size={24}
                                className="text-indigo-500 animate-spin"
                            />
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && items.length === 0 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                        >
                            <Upload
                                size={28}
                                className="text-slate-300 mx-auto mb-3"
                            />
                            <p className="text-sm font-semibold text-slate-500">
                                Henüz dosya yok
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Sürükle-bırak veya tıklayarak yükleyin
                            </p>
                        </div>
                    )}

                    {/* ═══ Grid ═══ */}
                    {!isLoading && items.length > 0 && view === "grid" && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {items.map((item) => {
                                const isSelected = selected.has(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleSelect(item)}
                                        className={`relative group rounded-xl overflow-hidden border-2 transition-all text-left ${
                                            isSelected
                                                ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                                                : "border-slate-200/60 hover:border-indigo-300 hover:shadow-sm"
                                        }`}
                                    >
                                        <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                            {isImage(item.mime_type) ? (
                                                <img
                                                    src={item.url}
                                                    alt={
                                                        item.alt_text ||
                                                        item.filename
                                                    }
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <FileText
                                                        size={24}
                                                        className="text-slate-300"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {item.filename
                                                            .split(".")
                                                            .pop()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <Check
                                                        size={12}
                                                        className="text-white"
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <p
                                                className="text-[10px] font-semibold text-slate-600 truncate"
                                                title={item.filename}
                                            >
                                                {item.filename}
                                            </p>
                                            <p className="text-[9px] text-slate-400">
                                                {formatBytes(item.size)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ═══ List ═══ */}
                    {!isLoading && items.length > 0 && view === "list" && (
                        <div className="space-y-1">
                            {items.map((item) => {
                                const isSelected = selected.has(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleSelect(item)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left ${
                                            isSelected
                                                ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-200"
                                                : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                            {isImage(item.mime_type) ? (
                                                <img
                                                    src={item.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <FileIcon
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">
                                                {item.filename}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {formatBytes(item.size)} •{" "}
                                                {item.mime_type
                                                    .split("/")[1]
                                                    ?.toUpperCase()}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                                                <Check
                                                    size={12}
                                                    className="text-white"
                                                    strokeWidth={3}
                                                />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Footer (multiple mode) ─── */}
                {multiple && (
                    <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            <span className="font-bold text-indigo-600">
                                {selected.size}
                            </span>{" "}
                            dosya seçildi
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleConfirmMultiple}
                                disabled={selected.size === 0}
                                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Check size={13} />
                                Seçimi Onayla
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
