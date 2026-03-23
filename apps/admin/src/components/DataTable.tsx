import { useState } from "react";
import {
    Search, Plus, InboxIcon, ChevronRight,
    ArrowUpDown, X, Globe, Trash2
} from "lucide-react";

export interface Column<T = any> {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface FilterOption {
    label: string;
    value: string | number;
}

interface FilterGroup {
    key: string;
    label: string;
    pluralLabel?: string;
    options: FilterOption[];
}

interface DataTableProps<T = any> {
    title: string;
    description?: string;
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onAdd?: () => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    addLabel?: string;
    searchable?: boolean;
    // New rich filtering
    filters?: FilterGroup[];
    activeFilters?: Record<string, string | number>;
    onFilterChange?: (key: string, value: string | number | "all") => void;
}

export default function DataTable<T extends Record<string, any>>({
    title,
    description,
    columns,
    data,
    isLoading,
    onAdd,
    onEdit,
    onDelete,
    addLabel = "Yeni",
    searchable = true,
    filters = [],
    activeFilters = {},
    onFilterChange,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Filter local data if server-side filtering isn't fully used
    let processed = search
        ? data.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : data;

    // Generic sorting
    processed = [...processed].sort((a, b) => {
        const aTitle = String(a.title || a.name || "");
        const bTitle = String(b.title || b.name || "");

        if (sortBy === "oldest") return (a.id || 0) - (b.id || 0);
        if (sortBy === "a-z") return aTitle.localeCompare(bTitle);
        if (sortBy === "z-a") return bTitle.localeCompare(aTitle);
        return (b.id || 0) - (a.id || 0); // newest default
    });

    const hasActiveFilters = Object.values(activeFilters).some(v => v !== "all" && v !== "");

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Add Button (Primary Action) */}
                    {onAdd && (
                        <button onClick={onAdd} className="btn btn-primary h-10 px-5 shadow-lg shadow-indigo-200">
                            <Plus size={16} />
                            <span className="font-semibold">{addLabel}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-col md:flex-row items-center gap-2">
                {/* Search */}
                {searchable && (
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`${title} içinde ara...`}
                            className="w-full bg-slate-50/50 border-none focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-2 text-[13px] h-10 transition-all"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Rich Dropdown Filters */}
                    {filters.map((group) => (
                        <div key={group.key} className="relative group/select">
                            <select
                                value={activeFilters[group.key] || "all"}
                                onChange={(e) => onFilterChange?.(group.key, e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-[13px] font-semibold text-slate-700 h-10 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer min-w-35"
                            >
                                <option value="all">Tüm {group.pluralLabel ?? group.label}</option>
                                {group.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    ))}

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-[13px] font-semibold text-slate-700 h-10 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                        >
                            <option value="newest">En Yeni</option>
                            <option value="oldest">En Eski</option>
                            <option value="a-z">A-Z Sırala</option>
                            <option value="z-a">Z-A Sırala</option>
                        </select>
                        <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {hasActiveFilters && onFilterChange && (
                        <button
                            onClick={() => {
                                filters.forEach(f => onFilterChange(f.key, "all"));
                                setSearch("");
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Filtreleri Temizle"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table Content ── */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        style={{ width: col.width }}
                                        className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {(onEdit || onDelete) && <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right pr-6">İşlem</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="py-20 text-center">
                                        <div className="inline-flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 animate-pulse">Veriler hazırlanıyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : processed.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <InboxIcon size={32} strokeWidth={1} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-500">Kayıt Bulunamadı</p>
                                                <p className="text-xs text-slate-400 mt-1">Arama kriterlerinizi değiştirmeyi deneyin.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processed.map((row, ri) => (
                                    <tr key={row.id ?? ri} className="group hover:bg-slate-50/80 transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="text-[13px] text-slate-700">
                                                    {col.render
                                                        ? col.render(row[col.key], row)
                                                        : (row[col.key] ?? <span className="text-slate-200">/</span>)}
                                                </div>
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td className="px-4 py-3.5 text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                                                                    onDelete(row);
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all group/edit"
                                                        >
                                                            Düzenle
                                                            <ChevronRight size={14} className="transition-transform group-hover/edit:translate-x-1" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Stats */}
                {!isLoading && processed.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[11px] font-medium text-slate-400">
                            Toplam <span className="text-slate-600 font-bold">{processed.length}</span> kayıttan
                            {processed.length === data.length ? " tamamı " : " filtrelenmiş olanlar "} listeleniyor.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Shared Helper: Site Micro-Labels with Interactive Dropdown/Popover
 */
export function SiteLabels({ sites }: { sites?: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!sites || sites.length === 0) return <span className="text-[10px] text-slate-300 italic">Hiçbir sitede yok</span>;

    const maxVisible = 1;
    const hasMore = sites.length > maxVisible;
    const visibleSites = sites.slice(0, maxVisible);

    return (
        <div className="relative">
            <div
                className="flex items-center gap-1.5 flex-wrap cursor-pointer group/sites"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                {visibleSites.map(s => (
                    <div
                        key={s.id}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50/80 border border-indigo-100/50 rounded-lg text-[10px] font-bold text-indigo-600 uppercase tracking-tight transition-all hover:bg-indigo-100"
                    >
                        <Globe size={10} className="text-indigo-400" />
                        {s.name}
                    </div>
                ))}
                {hasMore && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 transition-all group-hover/sites:bg-slate-200">
                        +{sites.length - maxVisible}
                    </div>
                )}
                <div className="ml-1 text-slate-300 group-hover/sites:text-indigo-400 transition-colors">
                    <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </div>

            {/* Dropdown Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-left">
                        <div className="px-3 py-2 mb-1 border-b border-slate-100">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Yayında Olan Siteler</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                            {sites.map(s => (
                                <a
                                    key={s.id}
                                    href={s.domain ? (s.domain.startsWith('http') ? s.domain : `https://${s.domain}`) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all group/item"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/item:scale-125 transition-transform" />
                                        {s.name}
                                    </div>
                                    <Globe size={14} className="text-slate-300 group-hover/item:text-indigo-300 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Shared Helper: Premium Toggle Switch
 */
export function Toggle({
    checked,
    onChange,
    disabled,
    label
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
}) {
    const id = useState(() => `toggle-${Math.random().toString(36).substr(2, 9)}`)[0];

    return (
        <label htmlFor={id} className={`relative inline-flex items-center group ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
                id={id}
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={e => !disabled && onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className="w-8.5 h-4.5 bg-slate-200/80 rounded-full peer peer-checked:bg-emerald-500 transition-all duration-300 ease-in-out after:content-[''] after:absolute after:top-0.75 after:left-0.75 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all after:duration-300 peer-checked:after:translate-x-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"></div>
            {label && <span className="ml-2 text-[11px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-tight">{label}</span>}
        </label>
    );
}
