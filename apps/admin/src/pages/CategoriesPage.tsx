import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../lib/api";
import { SiteLabels } from "../components/DataTable";
import {
    Layers,
    ChevronRight,
    ChevronDown,
    GripVertical,
    Plus,
    Pencil,
    Trash2,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlatCategory {
    id: number;
    name: string;
    slug: string;
    type: string;
    is_active: boolean;
    sort_order: number;
    parent_id: number | null;
    sites: Array<{ id: number; name: string; slug: string; domain: string }>;
}

interface TreeNode extends FlatCategory {
    children: TreeNode[];
    depth: number;
}

// ─── Utility: build tree from flat array ──────────────────────────────────────

function buildTree(flat: FlatCategory[]): TreeNode[] {
    const map = new Map<number, TreeNode>();
    for (const item of flat) {
        map.set(item.id, { ...item, children: [], depth: 0 });
    }
    const roots: TreeNode[] = [];
    for (const node of map.values()) {
        if (node.parent_id && map.has(node.parent_id)) {
            map.get(node.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }
    const assignDepth = (nodes: TreeNode[], depth: number) => {
        for (const n of nodes) {
            n.depth = depth;
            assignDepth(n.children, depth + 1);
        }
    };
    assignDepth(roots, 0);
    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        for (const n of nodes) sortNodes(n.children);
    };
    sortNodes(roots);
    return roots;
}

function flattenTree(nodes: TreeNode[], expanded: Set<number>): TreeNode[] {
    const result: TreeNode[] = [];
    const visit = (list: TreeNode[]) => {
        for (const n of list) {
            result.push(n);
            if (n.children.length > 0 && expanded.has(n.id)) {
                visit(n.children);
            }
        }
    };
    visit(nodes);
    return result;
}

function flattenAll(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    const visit = (list: TreeNode[]) => {
        for (const n of list) {
            result.push(n);
            visit(n.children);
        }
    };
    visit(nodes);
    return result;
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
    product: "bg-indigo-50 text-indigo-600",
    article: "bg-emerald-50 text-emerald-700",
    service: "bg-amber-50 text-amber-700",
    project: "bg-violet-50 text-violet-700",
};

function TypeBadge({ type }: { type: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase ${TYPE_STYLES[type] ?? "bg-slate-50 text-slate-500"}`}>
            {type}
        </span>
    );
}

// ─── Draggable Row ────────────────────────────────────────────────────────────

interface RowProps {
    node: TreeNode;
    isExpanded: boolean;
    hasChildren: boolean;
    onToggle: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number, name: string) => void;
    onAddChild: (parentId: number) => void;
    isDragging?: boolean;
}

function CategoryRow({
    node,
    isExpanded,
    hasChildren,
    onToggle,
    onEdit,
    onDelete,
    onAddChild,
    isDragging = false,
}: RowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: node.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.4 : 1,
    };

    const indent = node.depth * 28;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 px-4 py-3 border-b border-slate-50 bg-white hover:bg-slate-50/60 transition-colors ${isDragging ? "shadow-lg ring-1 ring-indigo-200 rounded-xl" : ""}`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
                tabIndex={-1}
                title="Sürükle"
            >
                <GripVertical size={14} />
            </button>

            {/* Indent + Expand Toggle */}
            <div className="flex items-center shrink-0" style={{ paddingLeft: indent }}>
                {hasChildren ? (
                    <button
                        onClick={() => onToggle(node.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <span className="w-6 h-6 flex items-center justify-center">
                        {node.depth > 0 && (
                            <span className="w-3 h-px bg-slate-200 block" />
                        )}
                    </span>
                )}
            </div>

            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                <Layers size={14} className="text-slate-400" />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-[13px] leading-tight truncate">{node.name}</span>
                    <TypeBadge type={node.type} />
                    {node.parent_id && (
                        <span className="text-[10px] text-slate-400 font-mono">↳ alt kategori</span>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{node.slug}</div>
            </div>

            {/* Active Sites */}
            <div className="hidden md:flex items-center min-w-40">
                <SiteLabels sites={node.sites} />
            </div>

            {/* Sort Order */}
            <div className="hidden lg:block w-14 text-center">
                <span className="font-mono text-[11px] text-slate-400">#{node.sort_order ?? 0}</span>
            </div>

            {/* Status */}
            <div className="w-8 flex justify-center">
                {node.is_active
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <XCircle size={16} className="text-slate-200" />}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onAddChild(node.id)}
                    title="Alt Kategori Ekle"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <Plus size={13} />
                </button>
                <button
                    onClick={() => onEdit(node.id)}
                    title="Düzenle"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={() => onDelete(node.id, node.name)}
                    title="Sil"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
    name,
    onConfirm,
    onCancel,
    loading,
}: {
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-100">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <AlertCircle size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Kategoriyi Sil</h3>
                        <p className="text-slate-500 text-xs mt-1">
                            <span className="font-bold text-slate-700">"{name}"</span> kategorisi silinecek. Bu işlem geri alınamaz.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors"
                    >
                        {loading ? "Siliniyor…" : "Evet, Sil"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterSite, setFilterSite] = useState("all");
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [activeId, setActiveId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [reordering, setReordering] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const { data: itemsRes, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const flatCategories: FlatCategory[] = useMemo(
        () => (itemsRes?.data ?? []) as unknown as FlatCategory[],
        [itemsRes?.data]
    );
    const sites = useMemo(() => sitesRes?.data ?? [], [sitesRes?.data]);

    // Apply search + filters (flatten tree to search across all)
    const filteredFlat = useMemo(() => {
        return flatCategories.filter((c) => {
            const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
            const matchType = filterType === "all" || c.type === filterType;
            const matchSite = filterSite === "all" || c.sites?.some((s) => String(s.id) === filterSite);
            return matchSearch && matchType && matchSite;
        });
    }, [flatCategories, search, filterType, filterSite]);

    const isFiltering = search || filterType !== "all" || filterSite !== "all";

    const tree = useMemo(() => buildTree(isFiltering ? filteredFlat : flatCategories), [isFiltering, filteredFlat, flatCategories]);

    // All nodes visible (if filtering expand all, else respect user toggle)
    const visibleNodes = useMemo(() => {
        if (isFiltering) {
            const allExpanded = new Set(flattenAll(tree).map((n) => n.id));
            return flattenTree(tree, allExpanded);
        }
        return flattenTree(tree, expanded);
    }, [tree, expanded, isFiltering]);

    const activeNode = useMemo(
        () => activeId ? visibleNodes.find((n) => n.id === activeId) : null,
        [activeId, visibleNodes]
    );

    const toggleExpand = useCallback((id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleAddChild = useCallback((parentId: number) => {
        const parentNode = flatCategories.find((c) => c.id === parentId);
        navigate("/categories/new", { state: { parentId, parentType: parentNode?.type ?? "product" } });
    }, [navigate, flatCategories]);

    const handleEdit = useCallback((id: number) => {
        navigate(`/categories/${id}/edit`);
    }, [navigate]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.deleteCategory(deleteTarget.id);
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setDeleteTarget(null);
        } catch (err: any) {
            alert(err.message || "Silme başarısız");
        } finally {
            setDeleting(false);
        }
    };

    // ─── Drag & Drop ────────────────────────────────────────────────────────

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const draggedId = Number(active.id);
        const overId = Number(over.id);

        // Find the dragged node and target node in the flat list
        const draggedIdx = visibleNodes.findIndex((n) => n.id === draggedId);
        const overIdx = visibleNodes.findIndex((n) => n.id === overId);
        if (draggedIdx === -1 || overIdx === -1) return;

        const dragged = visibleNodes[draggedIdx];
        const target = visibleNodes[overIdx];

        // If dropping onto a node at deeper depth, make it a child of that node's parent
        // If dropping onto a node at same depth, keep same parent and reorder
        // Simple rule: adopt the target's parent_id and recalculate sort_order
        const newParentId = target.depth === dragged.depth ? target.parent_id : target.parent_id;

        // Prevent circular: don't drop a parent into its own descendant
        const descendants = new Set<number>();
        const collectDescendants = (id: number) => {
            flatCategories
                .filter((c) => c.parent_id === id)
                .forEach((c) => { descendants.add(c.id); collectDescendants(c.id); });
        };
        collectDescendants(draggedId);
        if (descendants.has(overId)) return;

        // Recompute sort_orders for siblings at same parent level
        const siblings = visibleNodes.filter(
            (n) => n.parent_id === newParentId && n.id !== draggedId
        );
        const insertBefore = overIdx < draggedIdx;
        const targetSiblingIdx = siblings.findIndex((n) => n.id === overId);
        const newSiblings = [...siblings];
        if (insertBefore) {
            newSiblings.splice(Math.max(targetSiblingIdx, 0), 0, dragged);
        } else {
            newSiblings.splice(targetSiblingIdx + 1, 0, dragged);
        }

        const items = newSiblings.map((n, idx) => ({
            id: n.id,
            parent_id: newParentId,
            sort_order: idx,
        }));

        // Also update dragged item if parent changed
        if (!items.find((i) => i.id === draggedId)) {
            items.push({ id: draggedId, parent_id: newParentId, sort_order: items.length });
        }

        setReordering(true);
        try {
            await api.reorderCategories(items);
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        } catch {
            // silently fail – data will stay consistent from cache
        } finally {
            setReordering(false);
        }
    };

    const types = useMemo(() => {
        const unique = Array.from(new Set(flatCategories.map((c) => c.type).filter(Boolean)));
        return unique.sort();
    }, [flatCategories]);

    // ─── Skeleton ──────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-xl w-48" />
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-100" style={{ marginLeft: i % 3 === 0 ? 0 : i % 3 === 1 ? 28 : 56 }} />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* ─── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kategoriler</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Hiyerarşik içerik ağacı · sürükle-bırak ile düzenle</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/categories/new")}
                            className="btn btn-primary h-10 px-5 shadow-lg shadow-indigo-200"
                        >
                            <Plus size={16} />
                            <span className="font-semibold">Yeni Kategori</span>
                        </button>
                    </div>
                </div>

                {/* ─── Toolbar ─────────────────────────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-col md:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Kategoriler içinde ara..."
                            className="w-full bg-slate-50/50 border-none focus:ring-2 focus:ring-indigo-100 rounded-xl pl-10 pr-4 py-2 text-[13px] h-10 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={filterSite}
                            onChange={(e) => setFilterSite(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-[13px] font-semibold text-slate-700 h-10 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer min-w-35"
                        >
                            <option value="all">Tüm Siteler</option>
                            {sites.map((s: any) => (
                                <option key={s.id} value={String(s.id)}>{s.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-[13px] font-semibold text-slate-700 h-10 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer min-w-32.5"
                        >
                            <option value="all">Tüm Türler</option>
                            {types.map((t) => (
                                <option key={t} value={t}>{t.toUpperCase()}</option>
                            ))}
                        </select>
                        {reordering && (
                            <span className="text-[13px] text-indigo-500 font-semibold animate-pulse px-2">Kaydediliyor…</span>
                        )}
                    </div>
                </div>

                {/* ─── Tree Table ──────────────────────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Column Headers */}
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                            <div className="w-4 shrink-0" /> {/* grip placeholder */}
                            <div className="w-6 shrink-0" /> {/* expand placeholder */}
                            <div className="w-8 shrink-0" /> {/* icon placeholder */}
                            <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Adı</div>
                            <div className="hidden md:block min-w-40 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Siteler</div>
                            <div className="hidden lg:block w-14 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Sıra</div>
                            <div className="w-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum</div>
                            <div className="w-24 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</div>
                        </div>

                        {visibleNodes.length === 0 ? (
                            <div className="py-16 text-center">
                                <Layers size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-400">Kategori bulunamadı</p>
                                <p className="text-xs text-slate-300 mt-1">Yeni bir kategori ekleyin veya filtreleri değiştirin.</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={visibleNodes.map((n) => n.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {visibleNodes.map((node) => (
                                        <CategoryRow
                                            key={node.id}
                                            node={node}
                                            isExpanded={expanded.has(node.id)}
                                            hasChildren={node.children.length > 0}
                                            onToggle={toggleExpand}
                                            onEdit={handleEdit}
                                            onDelete={(id, name) => setDeleteTarget({ id, name })}
                                            onAddChild={handleAddChild}
                                        />
                                    ))}
                                </SortableContext>

                                <DragOverlay>
                                    {activeNode && (
                                        <CategoryRow
                                            node={activeNode}
                                            isExpanded={false}
                                            hasChildren={activeNode.children.length > 0}
                                            onToggle={() => {}}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                            onAddChild={() => {}}
                                            isDragging
                                        />
                                    )}
                                </DragOverlay>
                            </DndContext>
                        )}

                        {/* Footer count */}
                        {visibleNodes.length > 0 && (
                            <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/40 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400">
                                    {isFiltering
                                        ? `${filteredFlat.length} / ${flatCategories.length} kategori görüntüleniyor`
                                        : `${flatCategories.length} kategori`}
                                </span>
                                {!isFiltering && (
                                    <button
                                        onClick={() => {
                                            const allIds = new Set(flatCategories.map((c) => c.id));
                                            setExpanded((prev) => prev.size === allIds.size ? new Set() : allIds);
                                        }}
                                        className="text-[11px] text-indigo-500 hover:text-indigo-700 font-bold transition-colors"
                                    >
                                        {expanded.size > 0 ? "Tümünü Kapat" : "Tümünü Aç"}
                                    </button>
                                )}
                            </div>
                        )}
                </div>
            </div>

            {/* ─── Delete Confirm ──────────────────────────────────────────── */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </>
    );
}
