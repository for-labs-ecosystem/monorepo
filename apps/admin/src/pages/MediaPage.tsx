import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
    Upload,
    Trash2,
    Copy,
    Check,
    Search,
    LayoutGrid,
    List,
    FileText,
    Loader2,
    X,
    FileIcon,
    Download,
    Pencil,
    ChevronDown,
    Film,
    Archive,
    Save,
    Globe,
    Plus,
} from "lucide-react";

interface MediaItem {
    id: number;
    site_id: number | null;
    site_ids: string | null;
    filename: string;
    key: string;
    url: string;
    mime_type: string;
    size: number;
    title: string | null;
    alt_text: string | null;
    created_at: string;
    updated_at: string;
}

interface SiteItem {
    id: number;
    slug: string;
    name: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isImage(mime: string): boolean {
    return mime.startsWith("image/");
}
function isVideo(mime: string): boolean {
    return mime.startsWith("video/");
}
function isRecent(dateStr: string): boolean {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 24 * 60 * 60 * 1000;
}

function parseSiteIds(raw: string | null): number[] {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

const MIME_FILTERS = [
    { label: "Tümü", value: "", icon: null },
    { label: "Görseller", value: "image", icon: null },
    { label: "Video", value: "video", icon: Film },
    { label: "PDF", value: "application/pdf", icon: FileText },
    { label: "Arşiv", value: "application/zip,application/x-zip,application/x-rar,application/vnd.rar,application/gzip", icon: Archive },
];

export default function MediaPage() {
    const queryClient = useQueryClient();
    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [mimeFilter, setMimeFilter] = useState<string>("");
    const [siteFilter, setSiteFilter] = useState<string>("all");
    const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string[]>([]);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    // Multi-select
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    // Detail Drawer
    const [drawerItem, setDrawerItem] = useState<MediaItem | null>(null);
    const [drawerTitle, setDrawerTitle] = useState("");
    const [drawerAltText, setDrawerAltText] = useState("");
    const [drawerSiteIds, setDrawerSiteIds] = useState<number[]>([]);
    const [drawerSaving, setDrawerSaving] = useState(false);
    const [drawerSaved, setDrawerSaved] = useState(false);
    // Upload Modal
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadModalFiles, setUploadModalFiles] = useState<File[]>([]);
    const [uploadModalSiteIds, setUploadModalSiteIds] = useState<number[]>([]);
    const [uploadModalCategory, setUploadModalCategory] = useState("general");

    // ─── Sites Query ───
    const { data: sitesData } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });
    const sitesList: SiteItem[] = sitesData?.data || [];

    // ─── Media Query ───
    const { data, isLoading } = useQuery({
        queryKey: ["media", mimeFilter, search, siteFilter],
        queryFn: () => api.getMediaList({
            mime: mimeFilter || undefined,
            q: search || undefined,
            site_id: siteFilter || undefined,
        }),
    });

    // Post-filter for compound mime types
    let items: MediaItem[] = data?.data || [];
    if (mimeFilter && mimeFilter.includes(",")) {
        const mimes = mimeFilter.split(",");
        items = items.filter((item) => mimes.some((m) => item.mime_type.startsWith(m)));
    }

    // ─── Delete Mutation ───
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteMedia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            setDeleteConfirm(null);
            if (drawerItem) setDrawerItem(null);
        },
    });

    // ─── Bulk Delete Mutation ───
    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => api.bulkDeleteMedia(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            setSelectedIds(new Set());
            setBulkDeleteConfirm(false);
        },
    });

    // ─── Upload Handler ───
    const handleUpload = useCallback(async (files: FileList | File[], siteIds?: number[], category?: string) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        setUploading(true);
        setUploadProgress([]);

        for (const file of fileArray) {
            try {
                setUploadProgress((p) => [...p, `${file.name} yükleniyor...`]);
                await api.uploadMedia(file, category || "general", siteIds);
                setUploadProgress((p) =>
                    p.map((msg) => msg.includes(file.name) ? `✓ ${file.name}` : msg)
                );
            } catch {
                setUploadProgress((p) =>
                    p.map((msg) => msg.includes(file.name) ? `✗ ${file.name} - hata` : msg)
                );
            }
        }

        setUploading(false);
        queryClient.invalidateQueries({ queryKey: ["media"] });
        setTimeout(() => setUploadProgress([]), 3000);
    }, [queryClient]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                setUploadModalFiles(Array.from(e.dataTransfer.files));
                setUploadModalSiteIds([]);
                setUploadModalCategory("general");
                setUploadModalOpen(true);
            }
        },
        []
    );

    const handleCopyUrl = (item: MediaItem) => {
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // ─── Multi-select helpers ───
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const selectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.id)));
        }
    };

    // ─── Drawer open ───
    const openDrawer = (item: MediaItem) => {
        setDrawerItem(item);
        setDrawerTitle(item.title || "");
        setDrawerAltText(item.alt_text || "");
        setDrawerSiteIds(parseSiteIds(item.site_ids));
        setDrawerSaved(false);
    };

    const saveDrawer = async () => {
        if (!drawerItem) return;
        setDrawerSaving(true);
        try {
            await api.updateMedia(drawerItem.id, {
                title: drawerTitle,
                alt_text: drawerAltText,
                site_ids: drawerSiteIds,
            });
            queryClient.invalidateQueries({ queryKey: ["media"] });
            setDrawerSaved(true);
            setTimeout(() => setDrawerSaved(false), 2000);
        } finally {
            setDrawerSaving(false);
        }
    };

    const toggleDrawerSite = (siteId: number) => {
        setDrawerSiteIds((prev) =>
            prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
        );
    };

    const toggleUploadModalSite = (siteId: number) => {
        setUploadModalSiteIds((prev) =>
            prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
        );
    };

    // Close site dropdown on outside click
    useEffect(() => {
        if (!siteDropdownOpen) return;
        const handler = () => setSiteDropdownOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [siteDropdownOpen]);

    const siteNameById = (id: number) => sitesList.find((s) => s.id === id)?.name || "—";

    // Upload modal submit
    const handleUploadModalSubmit = async () => {
        if (uploadModalFiles.length === 0) return;
        setUploadModalOpen(false);
        await handleUpload(
            uploadModalFiles,
            uploadModalSiteIds.length > 0 ? uploadModalSiteIds : undefined,
            uploadModalCategory
        );
        setUploadModalFiles([]);
    };

    // ─── Render ───
    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            className="relative min-h-[70vh]"
        >
            {/* Drag overlay */}
            {dragOver && (
                <div className="absolute inset-0 z-50 bg-indigo-50/80 backdrop-blur-sm border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <Upload size={48} className="text-indigo-500 mx-auto mb-3" />
                        <p className="text-lg font-bold text-indigo-700">Dosyaları buraya bırakın</p>
                        <p className="text-sm text-indigo-500">Görsel, Video, PDF, ZIP — Maks. 100MB</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Medya Kütüphanesi</h1>
                    <p className="page-subtitle">
                        Görseller, video, doküman ve arşivlerin merkezi yönetimi
                    </p>
                </div>
                <button
                    onClick={() => {
                        setUploadModalFiles([]);
                        setUploadModalSiteIds([]);
                        setUploadModalCategory("general");
                        setUploadModalOpen(true);
                    }}
                    disabled={uploading}
                    className="btn btn-primary h-10 px-5 shadow-lg shadow-indigo-100 shrink-0"
                >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span className="font-bold text-xs uppercase tracking-wider">
                        {uploading ? "Yükleniyor..." : "Dosya Yükle"}
                    </span>
                </button>
            </div>

            {/* Upload Progress Toast */}
            {uploadProgress.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 min-w-70 max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-700">Yükleme Durumu</p>
                        <button onClick={() => setUploadProgress([])} className="text-slate-300 hover:text-slate-500">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {uploadProgress.map((msg, i) => (
                            <p key={i} className={`text-xs ${msg.startsWith("✓") ? "text-emerald-600" : msg.startsWith("✗") ? "text-rose-600" : "text-slate-500"}`}>
                                {msg}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Bulk Action Bar ═══ */}
            {selectedIds.size > 0 && (
                <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                            {selectedIds.size}
                        </div>
                        <p className="text-sm font-semibold text-indigo-800">dosya seçildi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Seçimi Temizle
                        </button>
                        <button
                            onClick={() => setBulkDeleteConfirm(true)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={12} />
                            Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ Toolbar ═══ */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-3 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Dosya adı ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 h-9 text-sm border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Site (Tenant) Filter */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
                        className="flex items-center gap-2 px-3 h-9 border border-slate-200 rounded-lg bg-slate-50/50 text-xs font-semibold text-slate-600 hover:border-indigo-300 transition-all min-w-35"
                    >
                        <Globe size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                            {siteFilter === "all" || !siteFilter ? "Tüm Siteler" : siteNameById(Number(siteFilter))}
                        </span>
                        <ChevronDown size={13} className={`text-slate-400 ml-auto transition-transform ${siteDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {siteDropdownOpen && (
                        <div className="absolute top-full mt-1 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 max-h-64 overflow-y-auto">
                            <button
                                onClick={() => { setSiteFilter("all"); setSiteDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${siteFilter === "all" || !siteFilter ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"}`}
                            >
                                Tüm Siteler
                            </button>
                            <div className="mx-3 my-1 h-px bg-slate-100" />
                            {sitesList.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSiteFilter(String(s.id)); setSiteDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${siteFilter === String(s.id) ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"}`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="hidden lg:block w-px h-6 bg-slate-200" />

                {/* MIME filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {MIME_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setMimeFilter(f.value)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                mimeFilter === f.value
                                    ? "bg-indigo-500 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {f.icon && <f.icon size={12} />}
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="hidden lg:block w-px h-6 bg-slate-200" />

                {/* View toggle + count */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setView("grid")}
                            className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <div className="text-xs font-bold text-slate-400 px-1 whitespace-nowrap">
                        {items.length} dosya
                    </div>
                </div>
            </div>

            {/* Drop zone hint (when empty) */}
            {!isLoading && items.length === 0 && (
                <div
                    onClick={() => { setUploadModalFiles([]); setUploadModalSiteIds([]); setUploadModalCategory("general"); setUploadModalOpen(true); }}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                >
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <Upload size={32} className="text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Henüz dosya yok</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Dosyaları bu alana sürükleyip bırakın veya tıklayarak seçin
                    </p>
                    <p className="text-xs text-slate-300">
                        PNG, JPG, WEBP, SVG, AVIF, MP4, WebM, PDF, ZIP, XLSX, CSV • Maks. 100MB
                    </p>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="text-indigo-500 animate-spin" />
                </div>
            )}

            {/* ═══ Grid View ═══ */}
            {!isLoading && items.length > 0 && view === "grid" && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={selectAll} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                            {selectedIds.size === items.length ? "Seçimi Kaldır" : "Tümünü Seç"}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {items.map((item) => {
                            const recent = isRecent(item.created_at);
                            const selected = selectedIds.has(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                                        selected
                                            ? "border-2 border-indigo-500 ring-2 ring-indigo-100"
                                            : recent
                                            ? "border-2 border-emerald-300 ring-1 ring-emerald-100"
                                            : "border border-slate-200/60 hover:border-indigo-200"
                                    }`}
                                >
                                    <div
                                        className="aspect-square relative bg-slate-50 flex items-center justify-center overflow-hidden"
                                        onClick={() => openDrawer(item)}
                                    >
                                        {isImage(item.mime_type) ? (
                                            <img src={item.url} alt={item.alt_text || item.filename} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                        ) : isVideo(item.mime_type) ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Film size={32} className="text-violet-400" strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold text-violet-400 uppercase">{item.filename.split(".").pop()}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText size={32} className="text-slate-300" strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.filename.split(".").pop()}</span>
                                            </div>
                                        )}

                                        <div
                                            className={`absolute top-2 left-2 z-10 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                selected ? "bg-indigo-500 border-indigo-500" : "bg-white/90 border-slate-300 hover:border-indigo-400"
                                            }`}>
                                                {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </div>
                                        </div>

                                        {recent && !selected && (
                                            <div className="absolute top-2 left-9 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md shadow-sm uppercase tracking-wide">
                                                Yeni
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />

                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopyUrl(item); }}
                                                className="w-7 h-7 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-md transition-colors"
                                                title="URL Kopyala"
                                            >
                                                {copiedId === item.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-slate-600" />}
                                            </button>
                                            <a
                                                href={item.url}
                                                download={item.filename}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-7 h-7 bg-white/90 hover:bg-indigo-50 rounded-lg flex items-center justify-center shadow-md transition-colors"
                                                title="İndir"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={13} className="text-indigo-600" />
                                            </a>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDrawer(item); }}
                                                className="w-7 h-7 bg-white/90 hover:bg-violet-50 rounded-lg flex items-center justify-center shadow-md transition-colors"
                                                title="Düzenle"
                                            >
                                                <Pencil size={13} className="text-violet-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-2.5" onClick={() => openDrawer(item)}>
                                        <p className="text-[11px] font-semibold text-slate-700 truncate" title={item.filename}>
                                            {item.filename}
                                        </p>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[10px] text-slate-400 font-medium">{formatBytes(item.size)}</span>
                                            <span className="text-[10px] text-slate-300">{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ List View ═══ */}
            {!isLoading && items.length > 0 && view === "list" && (
                <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="px-3 py-3 w-10">
                                    <div
                                        onClick={selectAll}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                                            selectedIds.size === items.length && items.length > 0 ? "bg-indigo-500 border-indigo-500" : "border-slate-300 hover:border-indigo-400"
                                        }`}
                                    >
                                        {selectedIds.size === items.length && items.length > 0 && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12"></th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosya Adı</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tür</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Boyut</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Tarih</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer ${selectedIds.has(item.id) ? "bg-indigo-50/40" : ""}`} onClick={() => openDrawer(item)}>
                                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                        <div
                                            onClick={() => toggleSelect(item.id)}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                selectedIds.has(item.id) ? "bg-indigo-500 border-indigo-500" : "border-slate-300 hover:border-indigo-400"
                                            }`}
                                        >
                                            {selectedIds.has(item.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                            {isImage(item.mime_type) ? (
                                                <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <FileIcon size={16} className="text-slate-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <p className="text-xs font-semibold text-slate-700 truncate max-w-50">{item.filename}</p>
                                    </td>
                                    <td className="px-4 py-2.5 hidden md:table-cell">
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {item.mime_type.split("/")[1]?.toUpperCase() || item.mime_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-500 hidden sm:table-cell">{formatBytes(item.size)}</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-400 hidden lg:table-cell">{formatDate(item.created_at)}</td>
                                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleCopyUrl(item)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="URL Kopyala">
                                                {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            </button>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="İndir">
                                                <Download size={14} />
                                            </a>
                                            <button onClick={() => openDrawer(item)} className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Düzenle">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Sil">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ Detail View — Full-width overlay: Left preview + Right sidebar ═══ */}
            {drawerItem && (
                <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerItem(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                        className="relative flex w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left — Large Preview */}
                        <div className="flex-1 flex items-center justify-center bg-slate-900/80 p-8 min-w-0">
                            {isImage(drawerItem.mime_type) ? (
                                <img
                                    src={drawerItem.url}
                                    alt={drawerItem.alt_text || drawerItem.filename}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />
                            ) : isVideo(drawerItem.mime_type) ? (
                                <video
                                    src={drawerItem.url}
                                    controls
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="w-32 h-32 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                        <FileText size={64} className="text-white/60" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-white/80 text-lg font-bold">{drawerItem.filename}</p>
                                    <span className="text-white/50 text-sm font-mono uppercase">
                                        {drawerItem.filename.split(".").pop()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right — Sidebar */}
                        <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right">
                            {/* Sidebar header */}
                            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                                <h2 className="text-sm font-bold text-slate-800">Dosya Detayları</h2>
                                <button onClick={() => setDrawerItem(null)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                    <X size={16} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                {/* File Info */}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Dosya Bilgileri</h3>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Dosya Adı</span>
                                        <span className="text-slate-700 font-medium truncate ml-4 max-w-50" title={drawerItem.filename}>{drawerItem.filename}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Boyut</span>
                                        <span className="text-slate-700 font-medium">{formatBytes(drawerItem.size)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">MIME Türü</span>
                                        <span className="text-slate-700 font-mono text-[10px]">{drawerItem.mime_type}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Yüklenme</span>
                                        <span className="text-slate-700 font-medium">{formatDate(drawerItem.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Son Güncelleme</span>
                                        <span className="text-slate-700 font-medium">{formatDate(drawerItem.updated_at)}</span>
                                    </div>
                                </div>

                                {/* SEO Settings */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">SEO Ayarları</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Başlık (Title)</label>
                                            <input
                                                type="text"
                                                value={drawerTitle}
                                                onChange={(e) => setDrawerTitle(e.target.value)}
                                                placeholder="Dosya başlığı (SEO)"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alt Etiketi (Alt Text)</label>
                                            <textarea
                                                value={drawerAltText}
                                                onChange={(e) => setDrawerAltText(e.target.value)}
                                                placeholder="Erişilebilirlik ve SEO için açıklama"
                                                rows={3}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Multi-Site Assignment (checkboxes) */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Yayın Siteleri</h3>
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                        {/* Global option */}
                                        <label
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                                drawerSiteIds.length === 0 ? "bg-slate-100 border border-slate-300" : "bg-slate-50 border border-transparent hover:bg-slate-100"
                                            }`}
                                            onClick={() => setDrawerSiteIds([])}
                                        >
                                            <Globe size={14} className={drawerSiteIds.length === 0 ? "text-slate-600 shrink-0" : "text-slate-300 shrink-0"} />
                                            <span className={`text-xs font-semibold ${drawerSiteIds.length === 0 ? "text-slate-700" : "text-slate-400"}`}>
                                                Global / Tüm Siteler
                                            </span>
                                            {drawerSiteIds.length === 0 && <Check size={12} className="text-slate-600 ml-auto" strokeWidth={3} />}
                                        </label>
                                        <div className="h-px bg-slate-100 my-1" />
                                        {sitesList.map((s) => {
                                            const checked = drawerSiteIds.includes(s.id);
                                            return (
                                                <label
                                                    key={s.id}
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                                        checked ? "bg-indigo-50 border border-indigo-200" : "bg-slate-50 border border-transparent hover:bg-slate-100"
                                                    }`}
                                                >
                                                    <div
                                                        onClick={() => toggleDrawerSite(s.id)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                            checked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                                                        }`}
                                                    >
                                                        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-xs font-medium ${checked ? "text-indigo-700" : "text-slate-600"}`}>{s.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* URL */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Dosya URL</h3>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={drawerItem.url}
                                            className="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-slate-50 text-slate-500 truncate"
                                        />
                                        <button
                                            onClick={() => handleCopyUrl(drawerItem)}
                                            className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Kopyala"
                                        >
                                            {copiedId === drawerItem.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-500" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar footer */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3 shrink-0">
                                <button
                                    onClick={saveDrawer}
                                    disabled={drawerSaving}
                                    className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {drawerSaving ? <Loader2 size={14} className="animate-spin" /> : drawerSaved ? <Check size={14} /> : <Save size={14} />}
                                    {drawerSaving ? "Kaydediliyor..." : drawerSaved ? "Kaydedildi!" : "Kaydet"}
                                </button>
                                <button
                                    onClick={() => { setDeleteConfirm(drawerItem.id); }}
                                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Upload Modal ═══ */}
            {uploadModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60" onClick={() => setUploadModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-800">Dosya Yükle</h2>
                            <button onClick={() => setUploadModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <X size={16} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* File selection */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Dosyalar</label>
                                {uploadModalFiles.length > 0 ? (
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2">
                                        {uploadModalFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg">
                                                <span className="text-xs font-medium text-slate-700 truncate">{f.name}</span>
                                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatBytes(f.size)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                <label
                                    htmlFor="upload-modal-file-input"
                                    className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group block"
                                >
                                    <Upload size={24} className="text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                                    <p className="text-xs font-semibold text-slate-500">{uploadModalFiles.length > 0 ? "Daha fazla dosya ekle" : "Dosya seç veya sürükle"}</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Maks. 100MB</p>
                                </label>
                                <input
                                    id="upload-modal-file-input"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = e.target.files ? Array.from(e.target.files) : [];
                                        if (files.length > 0) {
                                            setUploadModalFiles((prev) => [...prev, ...files]);
                                        }
                                        e.target.value = "";
                                    }}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori</label>
                                <select
                                    value={uploadModalCategory}
                                    onChange={(e) => setUploadModalCategory(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                >
                                    <option value="general">Genel</option>
                                    <option value="pages">Sayfalar</option>
                                    <option value="products">Ürünler</option>
                                    <option value="articles">Makaleler</option>
                                    <option value="services">Hizmetler</option>
                                    <option value="projects">Projeler</option>
                                </select>
                            </div>

                            {/* Site assignment */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Yayın Siteleri</label>
                                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                                    {/* Global option */}
                                    <label
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                            uploadModalSiteIds.length === 0 ? "bg-slate-100 border border-slate-300" : "bg-slate-50 border border-transparent hover:bg-slate-100"
                                        }`}
                                        onClick={() => setUploadModalSiteIds([])}
                                    >
                                        <Globe size={14} className={uploadModalSiteIds.length === 0 ? "text-slate-600 shrink-0" : "text-slate-300 shrink-0"} />
                                        <span className={`text-xs font-semibold ${uploadModalSiteIds.length === 0 ? "text-slate-700" : "text-slate-400"}`}>
                                            Global / Tüm Siteler
                                        </span>
                                        {uploadModalSiteIds.length === 0 && <Check size={12} className="text-slate-600 ml-auto" strokeWidth={3} />}
                                    </label>
                                    <div className="h-px bg-slate-100 my-1" />
                                    {sitesList.map((s) => {
                                        const checked = uploadModalSiteIds.includes(s.id);
                                        return (
                                            <label
                                                key={s.id}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                                    checked ? "bg-indigo-50 border border-indigo-200" : "bg-slate-50 border border-transparent hover:bg-slate-100"
                                                }`}
                                            >
                                                <div
                                                    onClick={() => toggleUploadModalSite(s.id)}
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        checked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                                                    }`}
                                                >
                                                    {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className={`text-xs font-medium ${checked ? "text-indigo-700" : "text-slate-600"}`}>{s.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUploadModalSubmit}
                                disabled={uploadModalFiles.length === 0 || uploading}
                                className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                {uploadModalFiles.length > 0
                                    ? `${uploadModalFiles.length} dosya yükle`
                                    : "Dosya seçin"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Single Delete Confirm Modal ═══ */}
            {deleteConfirm !== null && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-rose-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 text-center mb-2">Dosyayı Sil</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Bu dosya R2 bucket'tan ve veritabanından kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                                İptal
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteConfirm)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Bulk Delete Confirm Modal ═══ */}
            {bulkDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60" onClick={() => setBulkDeleteConfirm(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-rose-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 text-center mb-2">
                            {selectedIds.size} Dosyayı Sil
                        </h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Seçili {selectedIds.size} dosya R2 ve veritabanından kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                                İptal
                            </button>
                            <button
                                onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                                disabled={bulkDeleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {bulkDeleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Hepsini Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
