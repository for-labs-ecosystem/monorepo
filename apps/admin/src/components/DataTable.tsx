import { useState } from "react";
import { Search, Plus, Pencil, Loader2, InboxIcon } from "lucide-react";

interface Column<T = any> {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
    title: string;
    description?: string;
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onAdd?: () => void;
    onEdit?: (row: T) => void;
    addLabel?: string;
    searchable?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
    title,
    description,
    columns,
    data,
    isLoading,
    onAdd,
    onEdit,
    addLabel = "Yeni",
    searchable = true,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");

    const filtered = search
        ? data.filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : data;

    return (
        <div>
            {/* ── Header ── */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">{title}</h1>
                    {description && <p className="page-subtitle">{description}</p>}
                    {!isLoading && (
                        <p className="page-subtitle">
                            Toplam{" "}
                            <span className="font-medium text-slate-700">{data.length}</span>{" "}
                            kayıt
                            {filtered.length !== data.length && (
                                <span className="ml-1 text-indigo-600">
                                    ({filtered.length} sonuç)
                                </span>
                            )}
                        </p>
                    )}
                </div>
                {onAdd && (
                    <button onClick={onAdd} className="btn btn-primary">
                        <Plus size={15} />
                        {addLabel}
                    </button>
                )}
            </div>

            {/* ── Search ── */}
            {searchable && (
                <div className="mb-4 relative max-w-sm">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ara..."
                        className="input pl-9"
                    />
                </div>
            )}

            {/* ── Table ── */}
            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={{ width: col.width }}>
                                    {col.label}
                                </th>
                            ))}
                            {onEdit && <th style={{ width: "80px" }} className="text-right pr-4">İşlem</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onEdit ? 1 : 0)}
                                    className="py-16 text-center"
                                >
                                    <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                                        <Loader2 size={22} className="animate-spin text-indigo-400" />
                                        <span className="text-xs">Veriler yükleniyor...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onEdit ? 1 : 0)}
                                    className="py-16 text-center"
                                >
                                    <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                                        <InboxIcon size={32} strokeWidth={1} className="text-slate-300" />
                                        <span className="text-sm font-medium">
                                            {search ? "Aramanızla eşleşen kayıt bulunamadı" : "Henüz kayıt yok"}
                                        </span>
                                        {!search && onAdd && (
                                            <button
                                                onClick={onAdd}
                                                className="btn btn-secondary btn-sm mt-1"
                                            >
                                                <Plus size={13} /> İlk kaydı ekle
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, ri) => (
                                <tr key={row.id ?? ri}>
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : (row[col.key] ?? (
                                                    <span className="text-slate-300">—</span>
                                                ))}
                                        </td>
                                    ))}
                                    {onEdit && (
                                        <td className="text-right pr-3">
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="btn btn-ghost btn-sm group"
                                                title="Düzenle"
                                            >
                                                <Pencil
                                                    size={13}
                                                    className="text-slate-400 group-hover:text-indigo-600 transition-colors"
                                                />
                                                <span className="text-xs text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                    Düzenle
                                                </span>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
