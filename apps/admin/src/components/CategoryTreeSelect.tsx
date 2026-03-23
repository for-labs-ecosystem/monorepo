import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronRight, ChevronDown, FolderOpen, Folder, Check } from "lucide-react";

interface CategoryItem {
    id: number;
    name: string;
    parent_id: number | null;
    type?: string | null;
}

interface CategoryTreeSelectProps {
    categories: CategoryItem[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    filterType?: string;
}

function buildTree(categories: CategoryItem[], filterType?: string) {
    const filtered = filterType
        ? categories.filter((c) => c.type === filterType)
        : categories;
    const idSet = new Set(filtered.map((c) => c.id));
    const roots: CategoryItem[] = [];
    const childMap = new Map<number, CategoryItem[]>();

    for (const cat of filtered) {
        if (cat.parent_id == null || !idSet.has(cat.parent_id)) {
            roots.push(cat);
        } else {
            if (!childMap.has(cat.parent_id)) childMap.set(cat.parent_id, []);
            childMap.get(cat.parent_id)!.push(cat);
        }
    }
    return { roots, childMap };
}

function getFullPath(
    id: number,
    categories: CategoryItem[]
): string {
    const map = new Map(categories.map((c) => [c.id, c]));
    const parts: string[] = [];
    let current = map.get(id);
    while (current) {
        parts.unshift(current.name);
        current = current.parent_id != null ? map.get(current.parent_id) : undefined;
    }
    return parts.join(" › ");
}

function TreeNode({
    cat,
    childMap,
    selectedId,
    onSelect,
    depth = 0,
}: {
    cat: CategoryItem;
    childMap: Map<number, CategoryItem[]>;
    selectedId: string;
    onSelect: (id: string) => void;
    depth?: number;
}) {
    const children = childMap.get(cat.id) ?? [];
    const hasChildren = children.length > 0;
    const isSelected = selectedId === String(cat.id);
    const [expanded, setExpanded] = useState(true);

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-all text-sm ${
                    isSelected
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                }`}
                style={{ paddingLeft: `${12 + depth * 20}px` }}
                onClick={() => onSelect(isSelected ? "" : String(cat.id))}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((v) => !v);
                        }}
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors"
                    >
                        {expanded ? (
                            <ChevronDown size={14} className="text-slate-400" />
                        ) : (
                            <ChevronRight size={14} className="text-slate-400" />
                        )}
                    </button>
                ) : (
                    <span className="w-5" />
                )}
                {hasChildren ? (
                    expanded ? (
                        <FolderOpen size={14} className={isSelected ? "text-indigo-500" : "text-amber-500"} />
                    ) : (
                        <Folder size={14} className={isSelected ? "text-indigo-500" : "text-amber-500"} />
                    )
                ) : (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-indigo-500" : "bg-slate-300"}`} />
                )}
                <span className="truncate flex-1">{cat.name}</span>
                {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
            </div>
            {hasChildren && expanded && (
                <div>
                    {children.map((child) => (
                        <TreeNode
                            key={child.id}
                            cat={child}
                            childMap={childMap}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoryTreeSelect({
    categories,
    value,
    onChange,
    placeholder = "Kategori seçin...",
    filterType,
}: CategoryTreeSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const { roots, childMap } = useMemo(
        () => buildTree(categories, filterType),
        [categories, filterType]
    );

    const selectedLabel = useMemo(() => {
        if (!value) return "";
        return getFullPath(Number(value), categories);
    }, [value, categories]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`input !h-10 w-full text-left flex items-center justify-between gap-2 font-bold bg-slate-50 ${
                    value ? "text-slate-700" : "text-slate-400 font-normal"
                }`}
            >
                <span className="truncate text-sm">
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[320px] max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl">
                    {/* Clear selection */}
                    <div
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm border-b border-slate-100 ${
                            !value
                                ? "bg-slate-50 text-slate-500 font-semibold"
                                : "text-slate-400 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                    >
                        <span className="w-5" />
                        <span className="italic">{placeholder}</span>
                    </div>

                    {roots.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                            Kategori bulunamadı
                        </div>
                    ) : (
                        <div className="py-1">
                            {roots.map((cat) => (
                                <TreeNode
                                    key={cat.id}
                                    cat={cat}
                                    childMap={childMap}
                                    selectedId={value}
                                    onSelect={(id) => {
                                        onChange(id);
                                        setOpen(false);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
