import { useState } from "react";

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    title: string;
    icon: string;
    columns: Column[];
    data: any[];
    isLoading: boolean;
    onAdd?: () => void;
    onEdit?: (row: any) => void;
    addLabel?: string;
}

export default function DataTable({
    title,
    icon,
    columns,
    data,
    isLoading,
    onAdd,
    onEdit,
    addLabel = "Yeni Ekle",
}: DataTableProps) {
    const [search, setSearch] = useState("");

    const filtered = data.filter((row) =>
        columns.some((col) => {
            const val = row[col.key];
            return val && String(val).toLowerCase().includes(search.toLowerCase());
        })
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <span>{icon}</span> {title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Toplam {data.length} kayıt
                    </p>
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-sm transition-all flex items-center gap-2"
                    >
                        <span>+</span> {addLabel}
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-sm">
                            {search ? "Sonuç bulunamadı" : "Henüz kayıt yok"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    {onEdit && (
                                        <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            İşlem
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((row, i) => (
                                    <tr
                                        key={row.id || i}
                                        className="hover:bg-background/50 transition-colors"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="px-4 py-3 text-sm text-card-foreground"
                                            >
                                                {col.render
                                                    ? col.render(row[col.key], row)
                                                    : row[col.key] ?? "—"}
                                            </td>
                                        ))}
                                        {onEdit && (
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                                >
                                                    Düzenle
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
