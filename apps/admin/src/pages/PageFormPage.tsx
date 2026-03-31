import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import BlockEditor from "../components/block-editor/BlockEditor";
import CoverImage from "../components/CoverImage";
import {
    LayoutGrid,
    FileCode,
    Globe,
    Layers,
    Search,
    ChevronDown,
    Tag,
    Menu,
    Eye,
    ArrowUpDown,
    Info,
    PanelTop,
    PanelBottom,
    Link2,
} from "lucide-react";

interface SiteData {
    id: number;
    name: string;
    slug: string;
    domain: string;
}

interface NavItem {
    id: number;
    site_id: number;
    page_id: number | null;
    name: string;
    url: string;
    parent_id: number | null;
    location: string;
    sort_order: number;
}

interface SitePlacement {
    siteId: number | null;
    nav_location: "header" | "footer" | "hidden";
    nav_parent_id: number | null;
    nav_sort_order: number;
    meta_title: string;
    meta_description: string;
    canonical_url: string;
}

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const LOC_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; hint: string }> = {
    header: {
        label: "Üst Menü (Header)",
        icon: <PanelTop size={14} />,
        color: "border-sky-200 bg-sky-50 text-sky-700",
        hint: "Sitenin ana navigasyon çubuğunda görünür",
    },
    footer: {
        label: "Alt Menü (Footer)",
        icon: <PanelBottom size={14} />,
        color: "border-amber-200 bg-amber-50 text-amber-700",
        hint: "Sitenin alt kısmındaki footer menüsünde görünür",
    },
    hidden: {
        label: "Gizli Link",
        icon: <Link2 size={14} />,
        color: "border-slate-200 bg-slate-50 text-slate-600",
        hint: "Menülerde görünmez, sadece doğrudan URL ile erişilebilir (landing page vb.)",
    },
};

export default function PageFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<"tr" | "en">("tr");

    const [form, setForm] = useState({
        title_tr: "",
        title_en: "",
        slug: "",
        content_tr: "",
        content_en: "",
        cover_image_url: "",
        is_active: true,
        meta_title: "",
        meta_title_en: "",
        meta_description: "",
        meta_description_en: "",
        canonical_url: "",
        keywords: "",
        sort_order: "0",
    });

    const [seoOpen, setSeoOpen] = useState(false);
    const [placement, setPlacement] = useState<SitePlacement>({
        siteId: null,
        nav_location: "header",
        nav_parent_id: null,
        nav_sort_order: 0,
        meta_title: "",
        meta_description: "",
        canonical_url: "",
    });
    const placementsInitialized = useRef(false);

    // ─── Data Fetching ───
    const { data: existing } = useQuery({
        queryKey: ["page", id],
        queryFn: () => api.getPage(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    const { data: overridesRes } = useQuery({
        queryKey: ["page-overrides", id],
        queryFn: () => api.getPageOverrides(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    const { data: navPlacementsRes } = useQuery({
        queryKey: ["page-navigations", id],
        queryFn: () => api.getNavigationsByPage(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const sites: SiteData[] = useMemo(() => sitesRes?.data || [], [sitesRes]);

    const { data: allNavItems = [] } = useQuery<NavItem[]>({
        queryKey: ["navigations-site", placement.siteId],
        queryFn: async () => {
            if (!placement.siteId) return [];
            const res = await api.getNavigations(placement.siteId);
            return res.data || [];
        },
        enabled: !!placement.siteId,
    });

    // Initialize placement from overrides & nav data (single effect, guard against re-runs)
    useEffect(() => {
        if (placementsInitialized.current) return;
        if (!isEdit) return;
        if (sites.length === 0) return;

        const ovData = overridesRes?.data as Array<{ site_id?: number; is_visible?: number | boolean; meta_title?: string | null; meta_description?: string | null; canonical_url?: string | null }> | undefined;
        const navData = navPlacementsRes?.data as NavItem[] | undefined;

        // Wait until BOTH override and nav queries have resolved
        if (!ovData || !navData) return;

        // Find the first site with is_visible=true override (single site model)
        const visibleOv = ovData.find((o) => !!o.is_visible);
        const nav = navData.length > 0 ? navData[0] : undefined;

        if (visibleOv && visibleOv.site_id) {
            setPlacement({
                siteId: visibleOv.site_id,
                nav_location: (nav?.location as "header" | "footer" | "hidden") ?? "header",
                nav_parent_id: nav?.parent_id ?? null,
                nav_sort_order: nav?.sort_order ?? 0,
                meta_title: visibleOv.meta_title || "",
                meta_description: visibleOv.meta_description || "",
                canonical_url: visibleOv.canonical_url || "",
            });
        } else if (nav) {
            setPlacement({
                siteId: nav.site_id,
                nav_location: nav.location as "header" | "footer" | "hidden",
                nav_parent_id: nav.parent_id ?? null,
                nav_sort_order: nav.sort_order ?? 0,
                meta_title: "",
                meta_description: "",
                canonical_url: "",
            });
        }

        placementsInitialized.current = true;
    }, [sites, isEdit, overridesRes, navPlacementsRes]);

    // Populate form from existing page data
    useEffect(() => {
        if (!existing?.data) return;
        const d = existing.data;
        setForm({
            title_tr: d.title ?? "",
            title_en: d.title_en ?? "",
            slug: d.slug ?? "",
            content_tr: d.content ?? "",
            content_en: d.content_en ?? "",
            cover_image_url: d.cover_image_url ?? "",
            is_active: d.is_active !== false,
            meta_title: d.meta_title ?? "",
            meta_title_en: "",
            meta_description: d.meta_description ?? "",
            meta_description_en: "",
            canonical_url: d.canonical_url ?? "",
            keywords: d.keywords ?? "",
            sort_order: d.sort_order?.toString() ?? "0",
        });
    }, [existing]);

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const updatePlacement = (updates: Partial<SitePlacement>) => {
        setPlacement((prev) => ({ ...prev, ...updates }));
    };

    const handleDelete = async () => {
        if (!isEdit || !id) return;
        if (!window.confirm("Bu sayfayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        setSaving(true);
        try {
            await api.deletePage(Number(id));
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            navigate("/pages");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Silme başarısız";
            console.error("Page delete error:", err);
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!form.title_tr.trim()) {
            alert("Sayfa başlığı zorunludur");
            return;
        }
        if (!form.slug.trim()) {
            alert("Slug zorunludur");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: form.title_tr,
                title_en: form.title_en || null,
                slug: form.slug,
                content: form.content_tr || null,
                content_en: form.content_en || null,
                cover_image_url: form.cover_image_url || null,
                is_active: !!form.is_active,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                canonical_url: form.canonical_url || null,
                keywords: form.keywords || null,
                sort_order: parseInt(form.sort_order) || 0,
            };

            let savedId: number;
            if (isEdit && id) {
                await api.updatePage(Number(id), payload);
                savedId = Number(id);
            } else {
                const res = await api.createPage(payload);
                savedId = res.data.id;
            }

            // Save override for selected site (single site model)
            if (placement.siteId) {
                // First, clear overrides for other sites (single-site rule)
                for (const s of sites) {
                    if (s.id !== placement.siteId) {
                        await api.setPageSiteOverride(savedId, s.id, {
                            is_visible: false,
                            sort_order: 0,
                            meta_title: null,
                            meta_description: null,
                            canonical_url: null,
                        });
                    }
                }
                await api.setPageSiteOverride(savedId, placement.siteId, {
                    is_visible: true,
                    sort_order: parseInt(form.sort_order) || 0,
                    meta_title: placement.meta_title || null,
                    meta_description: placement.meta_description || null,
                    canonical_url: placement.canonical_url || null,
                });
            }

            // Sync navigation placement (single site)
            const navPlacements = placement.siteId
                ? [{
                    site_id: placement.siteId,
                    location: placement.nav_location,
                    parent_id: placement.nav_location === "hidden" ? null : (placement.nav_parent_id ?? null),
                    sort_order: placement.nav_sort_order ?? 0,
                }]
                : [];

            await api.syncPageNavigations({
                page_id: savedId,
                slug: form.slug,
                title: form.title_tr,
                placements: navPlacements,
            });

            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["navigations-site"] });
            queryClient.removeQueries({ queryKey: ["page", id] });
            queryClient.removeQueries({ queryKey: ["page-overrides", id] });
            queryClient.removeQueries({ queryKey: ["page-navigations", id] });
            navigate("/pages");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Kaydetme başarısız";
            console.error("Page save error:", err);
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    // Build nav tree for a given site + location
    const getNavTree = (siteId: number, location: string) => {
        const items = allNavItems.filter((n) => n.site_id === siteId && n.location === location);
        const roots = items.filter((n) => !n.parent_id).sort((a, b) => a.sort_order - b.sort_order);
        const tree: Array<{ id: number; name: string; depth: number }> = [];
        for (const root of roots) {
            tree.push({ id: root.id, name: root.name, depth: 0 });
            const children = items.filter((n) => n.parent_id === root.id).sort((a, b) => a.sort_order - b.sort_order);
            for (const child of children) {
                tree.push({ id: child.id, name: child.name, depth: 1 });
            }
        }
        return tree;
    };

    // Selected site info
    const selectedSite = sites.find((s) => s.id === placement.siteId);

    return (
        <FormPage
            title={isEdit ? "Sayfa Düzenle" : "Yeni Sayfa"}
            subtitle="Kurumsal, vizyon, misyon gibi statik içerik sayfaları"
            backHref="/pages"
            onSave={handleSave}
            onDelete={isEdit ? handleDelete : undefined}
            isEdit={isEdit}
            saving={saving}
            saveLabel={isEdit ? "Değişiklikleri Kaydet" : "Sayfayı Yayınla"}
            sidebar={
                <div className="space-y-6">
                    {/* ─── Yayın Durumu ─── */}
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
                            {!form.is_active && (
                                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                                    Bu sayfa şu an taslak modunda. Hiçbir sitede görünmeyecek.
                                </p>
                            )}
                        </div>
                    </SidebarCard>

                    {/* ─── Sıralama ─── */}
                    <SidebarCard title="Sayfa Sıralaması" icon={<Layers size={14} />}>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
                                <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
                                <span>Düşük sayı = önce görünür. Aynı menüde birden fazla sayfa varsa bu sıra kullanılır.</span>
                            </div>
                            <FormField label="Sıralama Değeri">
                                <div className="relative">
                                    <input type="number" value={form.sort_order} onChange={set("sort_order")} className="input text-xs bg-slate-50/50 pl-8" />
                                    <ArrowUpDown size={12} className="absolute left-3 top-3 text-slate-300" />
                                </div>
                            </FormField>
                        </div>
                    </SidebarCard>

                    {/* ─── Yayın Özeti ─── */}
                    <SidebarCard title="Yayın Özeti" icon={<Eye size={14} />}>
                        {!placement.siteId ? (
                            <p className="text-[10px] text-slate-400 italic">Henüz bir site seçilmedi. Aşağıdaki bölümden hedef siteyi belirleyin.</p>
                        ) : (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <Globe size={11} className="text-indigo-400 shrink-0" />
                                    <span className="font-semibold text-slate-700">{selectedSite?.name ?? "—"}</span>
                                    <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold border ${(LOC_CONFIG[placement.nav_location] || LOC_CONFIG.hidden).color}`}>
                                        {(LOC_CONFIG[placement.nav_location] || LOC_CONFIG.hidden).label}
                                    </span>
                                </div>
                                {placement.nav_parent_id && (
                                    <div className="text-[10px] text-slate-400 pl-5">
                                        Alt menü öğesi olarak eklenecek
                                    </div>
                                )}
                            </div>
                        )}
                    </SidebarCard>

                </div>
            }
        >
            {/* ─── Cover Image ─── */}
            <div className="mb-6">
                <CoverImage
                    value={form.cover_image_url}
                    onChange={(url) => setForm(f => ({ ...f, cover_image_url: url }))}
                    disabled={saving}
                />
            </div>

            {/* ─── Sayfa İçeriği ─── */}
            <FormSection title="Sayfa İçeriği" icon={<FileCode size={20} />} columns={1}>
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <FormField label="Sayfa Başlığı" required>
                                    <input
                                        type="text"
                                        className="input h-12 text-lg font-black text-slate-800 tracking-tight"
                                        value={form.title_tr}
                                        onChange={(e) => {
                                            setForm(f => ({
                                                ...f,
                                                title_tr: e.target.value,
                                                ...(!isEdit && { slug: slugify(e.target.value) })
                                            }));
                                        }}
                                        placeholder="Sayfa adını girin (Örn: Hakkımızda)..."
                                    />
                                </FormField>
                            </div>
                            <FormField label="URL Slug" hint="Sayfa adresi">
                                <div className="relative">
                                    <input type="text" className="input h-10 pl-8 bg-slate-50/50 font-mono text-[10px]" value={form.slug} onChange={set("slug")} />
                                    <LayoutGrid size={12} className="absolute left-3 top-3.5 text-slate-300" />
                                </div>
                            </FormField>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Sayfa İçeriği — Blok Editör</label>
                            <BlockEditor
                                value={form.content_tr}
                                onChange={(val) => setForm(f => ({ ...f, content_tr: val }))}
                                placeholder="Yazmaya başlayın veya blok eklemek için + butonuna tıklayın..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="md:col-span-2">
                            <FormField label="Page Title (English)">
                                <input type="text" className="input h-12 text-lg font-black tracking-tight" value={form.title_en} onChange={set("title_en")} placeholder="Enter English page title..." />
                            </FormField>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Page Content — Block Editor</label>
                            <BlockEditor
                                value={form.content_en}
                                onChange={(val) => setForm(f => ({ ...f, content_en: val }))}
                                placeholder="Start typing or click + to add a block..."
                            />
                        </div>
                    </div>
                )}
            </FormSection>

            {/* ─── Hedef Site & Menü Konumu (MAIN CONTENT) ─── */}
            <div className="mt-6">
                <FormSection
                    title="Hedef Site & Menü Konumu"
                    description="Bu sayfanın yayınlanacağı siteyi ve menüdeki yerini belirleyin"
                    icon={<Globe size={20} />}
                    columns={1}
                >
                    {sites.length === 0 ? (
                        <div className="text-sm text-slate-400 text-center py-8">Siteler yükleniyor...</div>
                    ) : (
                        <div className="space-y-5">
                            {/* ─── Site Seçimi ─── */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                                    Yayınlanacak Site
                                </label>
                                <select
                                    value={placement.siteId ?? ""}
                                    onChange={(e) => {
                                        const newSiteId = e.target.value ? Number(e.target.value) : null;
                                        updatePlacement({ siteId: newSiteId, nav_parent_id: null });
                                    }}
                                    disabled={saving}
                                    className="w-full text-sm px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-slate-700 font-semibold"
                                >
                                    <option value="">— Site seçin</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.domain})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Her sayfa yalnızca bir sitede yayınlanabilir.
                                </p>
                            </div>

                            {/* ─── Menü Ayarları (site seçildiğinde görünür) ─── */}
                            {placement.siteId && (
                                <div className="border border-indigo-200 rounded-xl bg-white ring-1 ring-indigo-100/60 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-2">
                                        <Globe size={14} className="text-indigo-500" />
                                        <span className="text-sm font-bold text-indigo-900">{selectedSite?.name}</span>
                                        <span className="text-[10px] text-indigo-400 font-mono ml-auto">{selectedSite?.domain}</span>
                                    </div>

                                    <div className="px-5 py-4 space-y-5">
                                        {/* Menü Konumu Seçimi */}
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Menu size={11} /> Menü Konumu
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                {(["header", "footer", "hidden"] as const).map((loc) => {
                                                    const cfg = LOC_CONFIG[loc];
                                                    const isSelected = placement.nav_location === loc;
                                                    return (
                                                        <button
                                                            key={loc}
                                                            type="button"
                                                            disabled={saving}
                                                            onClick={() => updatePlacement({ nav_location: loc, nav_parent_id: null })}
                                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                                                isSelected
                                                                    ? `${cfg.color} ring-1 ring-current/20 shadow-sm`
                                                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <span className="shrink-0">{cfg.icon}</span>
                                                            <div>
                                                                <div className="text-[11px] font-bold leading-tight">{cfg.label}</div>
                                                                <div className="text-[9px] opacity-70 leading-tight mt-0.5">{cfg.hint}</div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Alt Menü Kırılımı + Sıralama */}
                                        {(placement.nav_location === "header" || placement.nav_location === "footer") && (() => {
                                            const navTree = getNavTree(placement.siteId!, placement.nav_location);
                                            return (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                                            {placement.nav_location === "header" ? "Üst Menü Kırılımı" : "Footer Sütunu"}
                                                        </label>
                                                        <select
                                                            value={placement.nav_parent_id ?? ""}
                                                            onChange={(e) => updatePlacement({
                                                                nav_parent_id: e.target.value ? Number(e.target.value) : null,
                                                            })}
                                                            disabled={saving}
                                                            className="w-full text-[11px] px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
                                                        >
                                                            <option value="">— Kök Seviye (Ana Menü Öğesi)</option>
                                                            {navTree.map((item) => (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.depth === 1 ? "  └─ " : ""}{item.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {placement.nav_parent_id && (
                                                            <p className="text-[10px] text-indigo-500 mt-1.5 font-medium">
                                                                Bu sayfa seçilen menü başlığının altında alt başlık olarak görünecek. Menü başlığı otomatik olarak dropdown haline gelecek.
                                                            </p>
                                                        )}
                                                        {navTree.length === 0 && (
                                                            <p className="text-[10px] text-slate-400 mt-1.5 italic">
                                                                Bu sitenin {placement.nav_location === "header" ? "header" : "footer"} menüsünde henüz öğe yok. Sayfa kök seviyeye eklenecek.
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                                            Menü Sırası
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={placement.nav_sort_order}
                                                            onChange={(e) => updatePlacement({ nav_sort_order: Number(e.target.value) })}
                                                            disabled={saving}
                                                            className="w-full text-[11px] px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
                                                            placeholder="0"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1.5">Düşük = önce görünür</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Mevcut Menü Yapısı Önizleme */}
                                        {(placement.nav_location === "header" || placement.nav_location === "footer") && (
                                            <div className="pt-3 border-t border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                    Mevcut {placement.nav_location === "header" ? "Header" : "Footer"} Menü Yapısı
                                                </div>
                                                <ExistingNavTree
                                                    items={allNavItems.filter((n) => n.location === placement.nav_location)}
                                                    currentPageId={isEdit ? Number(id) : undefined}
                                                />
                                            </div>
                                        )}

                                        {/* ─── Site Özelinde SEO Ayarları ─── */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Search size={11} /> Site Özelinde SEO
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Meta Başlığı</label>
                                                    <input
                                                        type="text"
                                                        value={placement.meta_title}
                                                        onChange={(e) => updatePlacement({ meta_title: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full text-[11px] px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
                                                        placeholder="Bu site için özel meta başlığı (boş = global)"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Meta Açıklaması</label>
                                                    <textarea
                                                        value={placement.meta_description}
                                                        onChange={(e) => updatePlacement({ meta_description: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full text-[11px] px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700 min-h-16"
                                                        placeholder="Bu site için özel meta açıklaması (boş = global)"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Canonical URL</label>
                                                    <input
                                                        type="text"
                                                        value={placement.canonical_url}
                                                        onChange={(e) => updatePlacement({ canonical_url: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full text-[11px] px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700 font-mono"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-2 italic">
                                                Boş bırakılan alanlar global SEO ayarlarını kullanır (COALESCE).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </FormSection>
            </div>

            {/* ─── SEO Accordion ─── */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <button
                    type="button"
                    onClick={() => setSeoOpen(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <Search size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-slate-700">SEO & Meta Verileri</div>
                            <div className="text-[10px] text-slate-400">Arama motoru optimizasyonu ayarları</div>
                        </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${seoOpen ? "rotate-180" : ""}`} />
                </button>

                {seoOpen && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                        <LangTabs lang={lang} onChange={setLang} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                            {lang === "tr" ? (
                                <>
                                    <FormField label="Meta Başlığı (TR)" hint="Global varsayılan">
                                        <input type="text" className="input h-10 text-xs" value={form.meta_title} onChange={set("meta_title")} placeholder="Meta Title (Türkçe)" />
                                    </FormField>
                                    <FormField label="Canonical URL">
                                        <input type="text" className="input h-10 text-xs font-mono" value={form.canonical_url} onChange={set("canonical_url")} placeholder="https://..." />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label="Meta Açıklaması (TR)">
                                            <textarea className="input min-h-20 py-3 text-xs" value={form.meta_description} onChange={set("meta_description")} placeholder="Arama motorlarında görünecek açıklama..." />
                                        </FormField>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FormField label="Meta Title (EN)">
                                        <input type="text" className="input h-10 text-xs" value={form.meta_title_en} onChange={set("meta_title_en")} placeholder="Meta Title (English)" />
                                    </FormField>
                                    <div />
                                    <div className="md:col-span-2">
                                        <FormField label="Meta Description (EN)">
                                            <textarea className="input min-h-20 py-3 text-xs" value={form.meta_description_en} onChange={set("meta_description_en")} placeholder="Search engine description..." />
                                        </FormField>
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2">
                                <FormField label="Anahtar Kelimeler" hint="Virgülle ayırın">
                                    <div className="relative">
                                        <input type="text" className="input h-10 pl-8 text-xs" value={form.keywords} onChange={set("keywords")} placeholder="kurumsal, hakkımızda, vizyon, misyon..." />
                                        <Tag size={12} className="absolute left-3 top-3.5 text-slate-300" />
                                    </div>
                                </FormField>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FormPage>
    );
}

/**
 * Displays the existing nav tree for a site+location as a visual mini-tree.
 * Highlights the current page if it already exists in the tree.
 */
function ExistingNavTree({ items, currentPageId }: { items: NavItem[]; currentPageId?: number }) {
    if (items.length === 0) {
        return (
            <div className="text-[10px] text-slate-400 italic bg-slate-50 rounded-lg px-3 py-2">
                Henüz bu bölümde menü öğesi bulunmuyor.
            </div>
        );
    }

    const roots = items.filter((n) => !n.parent_id).sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="bg-slate-50/80 rounded-lg border border-slate-100 px-3 py-2 space-y-0.5">
            {roots.map((root) => {
                const children = items.filter((n) => n.parent_id === root.id).sort((a, b) => a.sort_order - b.sort_order);
                const isCurrentPage = root.page_id === currentPageId;
                return (
                    <div key={root.id}>
                        <div className={`flex items-center gap-1.5 text-[11px] py-0.5 ${
                            isCurrentPage ? "text-indigo-600 font-bold" : "text-slate-600"
                        }`}>
                            <Menu size={10} className="text-slate-300 shrink-0" />
                            <span>{root.name}</span>
                            {isCurrentPage && (
                                <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">Bu Sayfa</span>
                            )}
                            <span className="text-[9px] text-slate-300 ml-auto">#{root.sort_order}</span>
                        </div>
                        {children.map((child) => {
                            const isChildCurrentPage = child.page_id === currentPageId;
                            return (
                                <div
                                    key={child.id}
                                    className={`flex items-center gap-1.5 text-[10px] py-0.5 pl-5 ${
                                        isChildCurrentPage ? "text-indigo-600 font-bold" : "text-slate-500"
                                    }`}
                                >
                                    <span className="text-slate-300">└─</span>
                                    <span>{child.name}</span>
                                    {isChildCurrentPage && (
                                        <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">Bu Sayfa</span>
                                    )}
                                    <span className="text-[9px] text-slate-300 ml-auto">#{child.sort_order}</span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
