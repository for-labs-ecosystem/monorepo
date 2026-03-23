import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import SitePublisher from "../components/SitePublisher";
import type { SiteVisibility } from "../components/SitePublisher";
import {
    LayoutGrid,
    Tags,
    Globe,
    Zap,
    Settings2,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Plus,
    Pencil,
    ChevronsUpDown,
    Check,
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

// ─── Utilities ────────────────────────────────────────────────────────────────

interface FlatCat {
    id: number;
    name: string;
    parent_id: number | null;
    type: string;
}

function getAncestors(
    flat: FlatCat[],
    targetId: number | null
): FlatCat[] {
    if (!targetId) return [];
    const map = new Map(flat.map(c => [c.id, c]));
    const chain: FlatCat[] = [];
    let cur = map.get(targetId);
    while (cur) {
        chain.unshift(cur);
        cur = cur.parent_id ? map.get(cur.parent_id) : undefined;
    }
    return chain;
}

function getChildren(flat: FlatCat[], parentId: number | null): FlatCat[] {
    return flat.filter(c => c.parent_id === parentId).sort((a, b) => a.name.localeCompare(b.name));
}

function getDescendantIds(flat: FlatCat[], rootId: number): Set<number> {
    const set = new Set<number>();
    const visit = (id: number) => {
        flat.filter(c => c.parent_id === id).forEach(c => { set.add(c.id); visit(c.id); });
    };
    visit(rootId);
    return set;
}

// ─── Position-in-Tree Panel ───────────────────────────────────────────────────
//
// Shows the category's context:
//   [↑ Üst kategori]      ← clickable, or "Kök" label
//   [■ Bu kategori]       ← highlighted, not clickable
//   [↓ Alt 1]             ← each child navigates to edit
//   [↓ Alt 2]
//   [+ Alt Kategori Ekle]
//
// "Üst'ü değiştir" opens an inline dropdown to pick a new parent.

interface PositionPanelProps {
    allCats: FlatCat[];
    currentId?: string;          // id param (edit mode) or undefined (new)
    currentName: string;         // live name from form
    parentId: string;            // form.parent_id
    onParentChange: (val: string) => void;
    onNavigate: (id: number) => void;
    onAddChild: (parentId: number, parentType: string, parentName: string) => void;
    currentType: string;
}

function PositionPanel({
    allCats,
    currentId,
    currentName,
    parentId,
    onParentChange,
    onNavigate,
    onAddChild,
    currentType,
}: PositionPanelProps) {
    const [changingParent, setChangingParent] = useState(false);

    const isEdit = Boolean(currentId);
    const numericId = currentId ? Number(currentId) : null;

    // Parent node (resolved from parentId)
    const parentNode = useMemo(
        () => (parentId ? allCats.find(c => String(c.id) === parentId) ?? null : null),
        [allCats, parentId]
    );

    // Full ancestry chain for the parent (grandparents, etc.)
    const parentAncestors = useMemo(
        () => parentNode ? getAncestors(allCats, parentNode.parent_id) : [],
        [allCats, parentNode]
    );

    // Direct children of the current category (edit only)
    const children = useMemo(
        () => (numericId ? getChildren(allCats, numericId) : []),
        [allCats, numericId]
    );

    // For the change-parent dropdown: exclude self + descendants
    const forbiddenIds = useMemo(() => {
        const set = new Set<number>();
        if (numericId) {
            set.add(numericId);
            getDescendantIds(allCats, numericId).forEach(id => set.add(id));
        }
        return set;
    }, [allCats, numericId]);

    // Build indented options for parent dropdown
    const parentOptions = useMemo(() => {
        const buildOpts = (cats: FlatCat[], depth: number, parentIdFilter: number | null): Array<{ id: number; label: string }> => {
            const result: Array<{ id: number; label: string }> = [];
            cats.filter(c => c.parent_id === parentIdFilter && !forbiddenIds.has(c.id)).forEach(c => {
                result.push({ id: c.id, label: "　".repeat(depth) + (depth > 0 ? "↳ " : "") + c.name });
                result.push(...buildOpts(cats, depth + 1, c.id));
            });
            return result;
        };
        return buildOpts(allCats, 0, null);
    }, [allCats, forbiddenIds]);

    return (
        <div className="rounded-xl border border-slate-200 overflow-visible bg-white divide-y divide-slate-100">

            {/* ── ÜSTLER (ancestors chain, collapsed) ── */}
            {parentAncestors.length > 0 && (
                <div className="px-4 py-2 bg-slate-50/60 flex items-center gap-1.5 flex-wrap">
                    {parentAncestors.map((a, i) => (
                        <span key={a.id} className="flex items-center gap-1">
                            {i > 0 && <ChevronRight size={11} className="text-slate-300" />}
                            <button
                                type="button"
                                onClick={() => onNavigate(a.id)}
                                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                {a.name}
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* ── ÜST KATEGORİ ROW ── */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/40">
                <div className="w-6 flex justify-center shrink-0">
                    <ArrowUp size={14} className="text-slate-300" />
                </div>
                {parentNode ? (
                    <button
                        type="button"
                        onClick={() => onNavigate(parentNode.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left group"
                    >
                        <span className="text-[13px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors truncate">
                            {parentNode.name}
                        </span>
                        <Pencil size={11} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </button>
                ) : (
                    <span className="text-[13px] text-slate-400 italic flex-1">Kök seviyede (üst yok)</span>
                )}
                {/* Change parent button */}
                <button
                    type="button"
                    title="Üst kategoriyi değiştir"
                    onClick={() => setChangingParent(p => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 ${
                        changingParent
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                    <ChevronsUpDown size={11} />
                    Değiştir
                </button>
            </div>

            {/* ── PARENT CHANGE DROPDOWN ── */}
            {changingParent && (
                <div className="px-4 py-3 bg-indigo-50/40 border-t border-indigo-100">
                    <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Yeni Üst Kategori Seç</p>
                    <div className="relative">
                        <select
                            value={parentId}
                            onChange={(e) => { onParentChange(e.target.value); setChangingParent(false); }}
                            className="w-full appearance-none input text-sm font-mono pr-8"
                            size={1}
                        >
                            <option value="">— Kök (üst yok) —</option>
                            {parentOptions.map(opt => (
                                <option key={opt.id} value={String(opt.id)}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronsUpDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setChangingParent(false)}
                        className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        İptal
                    </button>
                </div>
            )}

            {/* ── BU KATEGORİ (current) ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-indigo-600">
                <div className="w-6 flex justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white/70" />
                </div>
                <span className="text-[13px] font-bold text-white flex-1 truncate">
                    {currentName || (isEdit ? "…" : "Yeni Kategori")}
                </span>
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest shrink-0">
                    {isEdit ? "Düzenleniyor" : "Yeni"}
                </span>
            </div>

            {/* ── ALT KATEGORİLER (edit only) ── */}
            {isEdit && children.length > 0 && children.map(child => (
                <div
                    key={child.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onNavigate(child.id)}
                >
                    <div className="w-6 flex justify-center shrink-0">
                        <ArrowDown size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <span className="text-[13px] text-slate-600 group-hover:text-slate-900 font-medium flex-1 truncate transition-colors">
                        {child.name}
                    </span>
                    <Pencil size={11} className="text-slate-200 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
            ))}

            {/* ── + ALT KATEGORİ EKLE (edit only) ── */}
            {isEdit && numericId && (
                <div
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/60 transition-colors group cursor-pointer border-t border-dashed border-slate-200"
                    onClick={() => onAddChild(numericId, currentType, currentName)}
                >
                    <div className="w-6 flex justify-center shrink-0">
                        <Plus size={13} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <span className="text-[12px] text-slate-400 group-hover:text-indigo-600 font-semibold transition-colors">
                        Alt Kategori Ekle
                    </span>
                    <Check size={11} className="text-slate-200 group-hover:text-indigo-400 transition-colors shrink-0 ml-auto" />
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoryFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<"tr" | "en">("tr");

    const location = useLocation();
    const locationState = location.state as { parentId?: number; parentType?: string } | null;
    const defaultParentId = locationState?.parentId ?? null;
    const defaultParentType = locationState?.parentType ?? "product";
    const isChildCreate = !isEdit && defaultParentId !== null;

    const [form, setForm] = useState({
        name_tr: "",
        name_en: "",
        slug: "",
        description_tr: "",
        description_en: "",
        type: defaultParentType,
        is_active: true,
        sort_order: "0",
        parent_id: defaultParentId ? String(defaultParentId) : "",
    });

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);
    const [parentVisibilityApplied, setParentVisibilityApplied] = useState(false);

    const { data: existing } = useQuery({
        queryKey: ["category", id],
        queryFn: () => api.getCategory(Number(id)),
        enabled: isEdit,
    });

    const { data: allCategoriesRes } = useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });

    const { data: overrides } = useQuery({
        queryKey: ["category-overrides", id],
        queryFn: () => api.getCategoryOverrides(Number(id)),
        enabled: isEdit,
    });

    const { data: parentOverridesRes } = useQuery({
        queryKey: ["category-overrides", defaultParentId],
        queryFn: () => api.getCategoryOverrides(defaultParentId!),
        enabled: isChildCreate,
    });

    // Sync siteVisibility from overrides (edit mode)
    useEffect(() => {
        if (!isEdit) return;
        if (overrides?.data && siteVisibility.length > 0) {
            setSiteVisibility((prev) =>
                prev.map((sv) => {
                    const ov = overrides.data.find(
                        (o: { site_id?: number; is_visible?: boolean }) => o.site_id === sv.siteId
                    );
                    if (ov) return { ...sv, isVisible: ov.is_visible !== false };
                    return sv;
                })
            );
        }
    }, [overrides, isEdit, siteVisibility.length]);

    // Inherit parent site visibility for new child categories
    useEffect(() => {
        if (!isChildCreate) return;
        if (parentVisibilityApplied) return;
        if (!parentOverridesRes?.data) return;
        if (siteVisibility.length === 0) return;
        setSiteVisibility((prev) =>
            prev.map((sv) => {
                const parentOv = parentOverridesRes.data.find(
                    (o: { site_id?: number; is_visible?: boolean }) => o.site_id === sv.siteId
                );
                if (parentOv) return { ...sv, isVisible: parentOv.is_visible !== false };
                return sv;
            })
        );
        setParentVisibilityApplied(true);
    }, [isChildCreate, parentOverridesRes, siteVisibility.length, parentVisibilityApplied]);

    useEffect(() => {
        if (!existing?.data) return;
        const d = existing.data;
        setForm({
            name_tr: d.name ?? "",
            name_en: d.name_en ?? "",
            slug: d.slug ?? "",
            description_tr: d.description ?? "",
            description_en: d.description_en ?? "",
            type: d.type ?? "product",
            is_active: d.is_active !== false,
            sort_order: d.sort_order?.toString() ?? "0",
            parent_id: d.parent_id ? String(d.parent_id) : "",
        });
    }, [existing]);

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: form.name_tr,
                name_en: form.name_en || null,
                slug: form.slug,
                description: form.description_tr || null,
                description_en: form.description_en || null,
                type: form.type,
                is_active: !!form.is_active,
                sort_order: parseInt(form.sort_order) || 0,
                parent_id: form.parent_id ? parseInt(form.parent_id) : null,
            };

            let savedId: number;
            if (isEdit && id) {
                await api.updateCategory(Number(id), payload);
                savedId = Number(id);
            } else {
                const res = await api.createCategory(payload);
                savedId = res.data.id;
            }

            for (const sv of siteVisibility) {
                await api.setCategorySiteOverride(savedId, sv.siteId, {
                    is_visible: sv.isVisible,
                    sort_order: parseInt(form.sort_order) || 0,
                });
            }

            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category", id] });
            queryClient.invalidateQueries({ queryKey: ["category-overrides", id] });
            navigate("/categories");
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    };

    const allCats = useMemo(
        () => (allCategoriesRes?.data ?? []) as FlatCat[],
        [allCategoriesRes?.data]
    );

    // Full ancestry chain for breadcrumb (based on current form.parent_id)
    const ancestorChain = useMemo(() => {
        if (!form.parent_id) return [];
        return getAncestors(allCats, Number(form.parent_id));
    }, [allCats, form.parent_id]);

    const breadcrumbChain = useMemo(() => {
        if (form.parent_id) return ancestorChain;
        if (isChildCreate && defaultParentId) return getAncestors(allCats, defaultParentId);
        return [];
    }, [form.parent_id, ancestorChain, isChildCreate, defaultParentId, allCats]);

    const showBreadcrumb = breadcrumbChain.length > 0;

    const pageTitle = isEdit
        ? "Kategori Düzenle"
        : isChildCreate
            ? "Yeni Alt Kategori"
            : "Yeni Kategori";

    const pageSubtitle = showBreadcrumb ? undefined : "İçeriklerinizi mantıksal gruplara ayırın";

    return (
        <FormPage
            title={pageTitle}
            subtitle={pageSubtitle}
            backHref="/categories"
            onSave={handleSave}
            isEdit={isEdit}
            saving={saving}
            sidebar={
                <div className="space-y-6">
                    <SidebarCard title="Yayın Durumu" icon={<Globe size={14} />}>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Global Aktif</span>
                                <div
                                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                    className={`relative w-8 h-4 rounded-full transition-all ${form.is_active ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-4" : ""}`} />
                                </div>
                            </label>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Site Bazlı Görünürlük" icon={<Zap size={14} />}>
                        <SitePublisher
                            visibilityState={siteVisibility}
                            onChange={setSiteVisibility}
                            saving={saving}
                        />
                    </SidebarCard>
                </div>
            }
        >
            {/* ─── Breadcrumb ──────────────────────────────────────────── */}
            {showBreadcrumb && (
                <div className="flex items-center gap-1.5 flex-wrap px-4 py-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-sm">
                    <span
                        className="text-indigo-400 hover:text-indigo-600 cursor-pointer font-medium transition-colors shrink-0"
                        onClick={() => navigate("/categories")}
                    >
                        Kategoriler
                    </span>
                    {breadcrumbChain.map((ancestor) => (
                        <span key={ancestor.id} className="flex items-center gap-1.5 shrink-0">
                            <ChevronRight size={14} className="text-indigo-200" />
                            <span
                                className="text-indigo-500 font-semibold hover:text-indigo-700 cursor-pointer transition-colors"
                                onClick={() => navigate(`/categories/${ancestor.id}/edit`)}
                            >
                                {ancestor.name}
                            </span>
                        </span>
                    ))}
                    <ChevronRight size={14} className="text-indigo-200 shrink-0" />
                    <span className="text-indigo-800 font-bold shrink-0">
                        {form.name_tr || (isEdit ? "…" : "Yeni Alt Kategori")}
                    </span>
                </div>
            )}

            {/* ─── Kimlik ──────────────────────────────────────────────── */}
            <FormSection title="Kategori Kimliği" icon={<Tags size={20} />} columns={1}>
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Kategori Adı" required>
                                <input
                                    type="text"
                                    className="input h-11 text-base font-bold"
                                    value={form.name_tr}
                                    onChange={(e) => {
                                        setForm(f => ({
                                            ...f,
                                            name_tr: e.target.value,
                                            ...(!isEdit && { slug: slugify(e.target.value) })
                                        }));
                                    }}
                                    placeholder="Kategori adını girin..."
                                />
                            </FormField>
                        </div>
                        <FormField label="URL Slug" hint="Arama motoru dostu adres">
                            <div className="relative">
                                <input type="text" className="input h-10 pl-8 bg-slate-50/50 font-mono text-[10px]" value={form.slug} onChange={set("slug")} />
                                <LayoutGrid size={12} className="absolute left-3 top-3.5 text-slate-300" />
                            </div>
                        </FormField>
                        <div className="md:col-span-2">
                            <FormField label="Açıklama" hint="Kategoriye ait kısa bir tanım">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_tr} onChange={set("description_tr")} placeholder="Bu kategorinin amacını kısaca açıklayın..." />
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Category Name (English)">
                                <input type="text" className="input h-11 text-base font-bold" value={form.name_en} onChange={set("name_en")} placeholder="Enter English category name..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Description (English)">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_en} onChange={set("description_en")} />
                            </FormField>
                        </div>
                    </div>
                )}
            </FormSection>

            {/* ─── Yapı & Hiyerarşi ────────────────────────────────────── */}
            <FormSection
                title="Yapı & Hiyerarşi"
                description="Kategorinin içerik türünü ve görüntüleme sırasını belirleyin. Alt ve üst bağlantıları aşağıdan yönetin."
                icon={<Settings2 size={20} />}
                columns={2}
            >
                {/* İçerik Tipi */}
                <FormField label="İçerik Tipi" hint="Bu kategori hangi tür içerikleri grupluyor?">
                    <select value={form.type} onChange={set("type")} className="input text-sm">
                        <option value="product">🛒 Ürün</option>
                        <option value="article">📝 Makale / Yazı</option>
                        <option value="service">⚙️ Hizmet</option>
                        <option value="project">📐 Proje</option>
                    </select>
                </FormField>

                {/* Görüntüleme Sırası */}
                <FormField
                    label="Görüntüleme Sırası"
                    hint="Aynı seviyedeki kategoriler arasındaki sıra. Küçük sayı önce görünür."
                >
                    <input
                        type="number"
                        min="0"
                        value={form.sort_order}
                        onChange={set("sort_order")}
                        className="input text-sm"
                        placeholder="0"
                    />
                </FormField>

                {/* Ağaçtaki Konum — full width */}
                <div className="md:col-span-2">
                    <FormField
                        label="Ağaçtaki Konum"
                        hint="Bu kategorinin hiyerarşideki yeri. Üst kategoriye tıklayarak düzenleyebilir, alt kategorilere geçiş yapabilirsiniz."
                    >
                        <PositionPanel
                            allCats={allCats}
                            currentId={id}
                            currentName={form.name_tr}
                            parentId={form.parent_id}
                            onParentChange={(val) => setForm(f => ({ ...f, parent_id: val }))}
                            onNavigate={(catId) => navigate(`/categories/${catId}/edit`)}
                            onAddChild={(parentId, parentType, parentName) => {
                                navigate("/categories/new", { state: { parentId, parentType, parentName } });
                            }}
                            currentType={form.type}
                        />
                    </FormField>
                </div>
            </FormSection>
        </FormPage>
    );
}
