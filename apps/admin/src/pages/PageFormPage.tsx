import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import BlockEditor from "../components/block-editor/BlockEditor";
import CoverImage from "../components/CoverImage";
import SitePublisher from "../components/SitePublisher";
import type { SiteVisibility } from "../components/SitePublisher";
import {
    LayoutGrid,
    FileCode,
    Globe,
    Zap,
    Layers,
    Search,
    ChevronDown,
    Tag,
    Trash2,
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

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

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);

    const { data: existing } = useQuery({
        queryKey: ["page", id],
        queryFn: () => api.getPage(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    const { data: overrides } = useQuery({
        queryKey: ["page-overrides", id],
        queryFn: () => api.getPageOverrides(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    const { data: navPlacements } = useQuery({
        queryKey: ["page-navigations", id],
        queryFn: () => api.getNavigationsByPage(Number(id)),
        enabled: isEdit,
        staleTime: 0,
        gcTime: 0,
    });

    // Sync siteVisibility from overrides + nav placements
    useEffect(() => {
        if (!isEdit) return;
        if (overrides?.data && siteVisibility.length > 0) {
            setSiteVisibility((prev) =>
                prev.map((sv) => {
                    const ov = overrides.data.find((o: any) => o.site_id === sv.siteId);
                    const nav = navPlacements?.data?.find((n: any) => n.site_id === sv.siteId);
                    return {
                        ...sv,
                        ...(ov ? {
                            isVisible: ov.is_visible !== false,
                            meta_title: ov.meta_title || "",
                            meta_description: ov.meta_description || "",
                            canonical_url: ov.canonical_url || "",
                        } : {}),
                        nav_location: nav ? nav.location : "hidden",
                        nav_parent_id: nav ? nav.parent_id : null,
                        nav_sort_order: nav ? (nav.sort_order ?? 0) : 0,
                    };
                })
            );
        }
    }, [overrides, navPlacements, isEdit, siteVisibility.length]);

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

    const handleDelete = async () => {
        if (!isEdit || !id) return;
        if (!window.confirm("Bu sayfayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        setSaving(true);
        try {
            await api.deletePage(Number(id));
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            navigate("/pages");
        } catch (err: any) {
            console.error("Page delete error:", err);
            alert(err.message || "Silme başarısız");
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

            // Save overrides
            for (const sv of siteVisibility) {
                await api.setPageSiteOverride(savedId, sv.siteId, {
                    is_visible: sv.isVisible,
                    meta_title: sv.meta_title || null,
                    meta_description: sv.meta_description || null,
                    canonical_url: sv.canonical_url || null,
                    sort_order: parseInt(form.sort_order) || 0,
                });
            }

            // Sync navigation placements — all active sites get an entry (hidden = no menu display)
            const placements = siteVisibility
                .filter(sv => sv.isVisible && sv.nav_location)
                .map(sv => ({
                    site_id: sv.siteId,
                    location: sv.nav_location!,
                    parent_id: sv.nav_location === "hidden" ? null : (sv.nav_parent_id ?? null),
                    sort_order: sv.nav_sort_order ?? 0,
                }));

            await api.syncPageNavigations({
                page_id: savedId,
                slug: form.slug,
                title: form.title_tr,
                placements,
            });

            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["navigations-all"] });
            queryClient.removeQueries({ queryKey: ["page", id] });
            queryClient.removeQueries({ queryKey: ["page-overrides", id] });
            queryClient.removeQueries({ queryKey: ["page-navigations", id] });
            navigate("/pages");
        } catch (err: any) {
            console.error("Page save error:", err);
            alert(err.message || err.error || "Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    };

    return (
        <FormPage
            title={isEdit ? "Sayfa Düzenle" : "Yeni Sayfa"}
            subtitle="Kurumsal, vizyon, misyon gibi statik içerik sayfaları"
            backHref="/pages"
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

                    <SidebarCard title="Hiyerarşi" icon={<Layers size={14} />}>
                        <FormField label="Sıralama Priority">
                            <input type="number" value={form.sort_order} onChange={set("sort_order")} className="input text-xs bg-slate-50/50" />
                        </FormField>
                    </SidebarCard>

                    <SidebarCard title="Site Bazlı Görünürlük & Menü" icon={<Zap size={14} />}>
                        <SitePublisher
                            visibilityState={siteVisibility}
                            onChange={setSiteVisibility}
                            saving={saving}
                            showNavPlacement={true}
                        />
                    </SidebarCard>

                    {isEdit && (
                        <SidebarCard title="Tehlikeli İşlemler" icon={<Trash2 size={14} />}>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="w-full px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50"
                            >
                                <Trash2 size={13} className="inline mr-1.5 -mt-0.5" />
                                Sayfayı Sil
                            </button>
                        </SidebarCard>
                    )}
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
                                    <div /> {/* spacer */}
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
