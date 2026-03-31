import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import RichTextEditor from "../components/RichTextEditor";
import SitePublisher from "../components/SitePublisher";
import type { SiteVisibility } from "../components/SitePublisher";
import MediaGallery from "../components/MediaGallery";
import CategoryTreeSelect from "../components/CategoryTreeSelect";
import {
    LayoutGrid,
    Wrench,
    Search,
    Globe,
    Zap,
    Tag,
    Banknote,
    Layers,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export default function ServiceFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<"tr" | "en">("tr");
    const [tags, setTags] = useState<string[]>([]);
    const [seoExpanded, setSeoExpanded] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const [form, setForm] = useState({
        title_tr: "",
        title_en: "",
        slug: "",
        description_tr: "",
        description_en: "",
        content_tr: "",
        content_en: "",
        service_type: "",
        price: "",
        currency: "TRY",
        image_url: "",
        category_id: "",
        is_active: true,
        sort_order: "0",
        meta_title: "",
        meta_description: "",
        canonical_url: "",
        is_featured: false,
    });

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);
    const overridesSynced = useRef(false);

    const { data: categoriesData } = useQuery({
        queryKey: ["service-categories"],
        queryFn: () => api.getCategories(),
    });

    const { data: existing } = useQuery({
        queryKey: ["service", id],
        queryFn: () => api.getService(Number(id)),
        enabled: isEdit,
    });

    const { data: overrides } = useQuery({
        queryKey: ["service-overrides", id],
        queryFn: () => api.getServiceOverrides(Number(id)),
        enabled: isEdit,
    });

    const categoryList = categoriesData?.data || [];

    // Sync siteVisibility from overrides (once)
    useEffect(() => {
        if (!isEdit) return;
        if (overridesSynced.current) return;
        if (overrides?.data && siteVisibility.length > 0) {
            overridesSynced.current = true;
            setSiteVisibility((prev) =>
                prev.map((sv) => {
                    const ov = overrides.data.find((o: any) => o.site_id === sv.siteId);
                    if (ov) {
                        return {
                            ...sv,
                            isVisible: !!ov.is_visible,
                            is_featured: !!ov.is_featured,
                            meta_title: ov.meta_title || "",
                            meta_description: ov.meta_description || "",
                            canonical_url: ov.canonical_url || "",
                        };
                    }
                    return sv;
                })
            );
        }
    }, [overrides, isEdit, siteVisibility.length]);

    useEffect(() => {
        if (!existing?.data) return;
        const d = existing.data;
        setForm({
            title_tr: d.title ?? "",
            title_en: d.title_en ?? "",
            slug: d.slug ?? "",
            description_tr: d.description ?? "",
            description_en: d.description_en ?? "",
            content_tr: d.content ?? "",
            content_en: d.content_en ?? "",
            service_type: d.service_type ?? "",
            price: d.price?.toString() ?? "",
            currency: d.currency ?? "TRY",
            image_url: d.image_url ?? "",
            category_id: d.category_id?.toString() ?? "",
            is_active: d.is_active !== false,
            sort_order: d.sort_order?.toString() ?? "0",
            meta_title: d.meta_title ?? "",
            meta_description: d.meta_description ?? "",
            canonical_url: d.canonical_url ?? "",
            is_featured: !!d.is_featured,
        });

        if (d.tags) {
            try {
                const parsed = typeof d.tags === 'string' ? JSON.parse(d.tags) : d.tags;
                setTags(Array.isArray(parsed) ? parsed : []);
            } catch { setTags([]); }
        }
    }, [existing]);

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title: form.title_tr,
                title_en: form.title_en || null,
                slug: form.slug,
                description: form.description_tr || null,
                description_en: form.description_en || null,
                content: form.content_tr || null,
                content_en: form.content_en || null,
                service_type: form.service_type || null,
                price: form.price ? parseFloat(form.price) : null,
                currency: form.currency || "TRY",
                image_url: form.image_url || null,
                category_id: form.category_id ? parseInt(form.category_id) : null,
                is_active: !!form.is_active,
                is_featured: !!form.is_featured,
                sort_order: parseInt(form.sort_order) || 0,
                tags: tags.length > 0 ? tags : null,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                canonical_url: form.canonical_url || null,
            };

            let savedId: number;
            if (isEdit && id) {
                await api.updateService(Number(id), payload as any);
                savedId = Number(id);
            } else {
                const res = await api.createService(payload as any);
                savedId = res.data.id;
            }

            // Save overrides — all sites in parallel for reliability
            const overrideResults = await Promise.allSettled(
                siteVisibility.map((sv) =>
                    api.setServiceSiteOverride(savedId, sv.siteId, {
                        is_visible: sv.isVisible,
                        is_featured: !!sv.is_featured,
                        sort_order: parseInt(form.sort_order) || 0,
                        meta_title: sv.meta_title || null,
                        meta_description: sv.meta_description || null,
                        canonical_url: sv.canonical_url || null,
                    })
                )
            );
            const failedOverrides = overrideResults.filter((r) => r.status === "rejected");
            if (failedOverrides.length > 0) {
                console.error("Some site overrides failed:", failedOverrides);
            }

            queryClient.invalidateQueries({ queryKey: ["services"] });
            queryClient.invalidateQueries({ queryKey: ["service", id] });
            queryClient.invalidateQueries({ queryKey: ["service-overrides", id] });
            navigate("/services");
        } catch (err: any) {
            alert(err.message || "Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    };

    return (
        <FormPage
            title={isEdit ? "Hizmet Düzenle" : "Yeni Hizmet"}
            subtitle="Laboratuvar, danışmanlık ve eğitim hizmetleri tanımlayın"
            backHref="/services"
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

                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-amber-500 transition-colors">Öne Çıkar</span>
                                <div
                                    onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                                    className={`relative w-8 h-4 rounded-full transition-all ${form.is_featured ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${form.is_featured ? "translate-x-4" : ""}`} />
                                </div>
                            </label>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Sınıflandırma" icon={<Layers size={14} />}>
                        <div className="space-y-4">
                            <FormField label="Kategori">
                                <CategoryTreeSelect
                                    categories={categoryList}
                                    value={form.category_id}
                                    onChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
                                    placeholder="Kategori seçin..."
                                    filterType="service"
                                />
                            </FormField>
                            <FormField label="Hizmet Tipi">
                                <select value={form.service_type} onChange={set("service_type")} className="input text-xs bg-slate-50/50">
                                    <option value="">Seçiniz</option>
                                    <option value="analysis">Analiz / Test</option>
                                    <option value="setup">Kurulum</option>
                                    <option value="audit">Denetim</option>
                                    <option value="consulting">Danışmanlık</option>
                                    <option value="training">Eğitim</option>
                                </select>
                            </FormField>
                            <FormField label="Sıralama Priority">
                                <input type="number" value={form.sort_order} onChange={set("sort_order")} className="input text-xs bg-slate-50/50" />
                            </FormField>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Site Bazlı Yayın" icon={<Zap size={14} />}>
                        <SitePublisher
                            visibilityState={siteVisibility}
                            onChange={setSiteVisibility}
                            saving={saving}
                        />
                    </SidebarCard>
                </div>
            }
        >
            <FormSection title="Temel Bilgiler" icon={<Wrench size={20} />} columns={1}>
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Hizmet Başlığı" required>
                                <input
                                    type="text"
                                    className="input h-11 text-base font-bold"
                                    value={form.title_tr}
                                    onChange={(e) => {
                                        setForm(f => ({
                                            ...f,
                                            title_tr: e.target.value,
                                            ...(!isEdit && { slug: slugify(e.target.value) })
                                        }));
                                    }}
                                    placeholder="Hizmet adını girin..."
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
                            <FormField label="Kısa Açıklama" hint="Liste sayfalarında görünen özet">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_tr} onChange={set("description_tr")} />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Detaylı Hizmet İçeriği">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <RichTextEditor
                                        value={form.content_tr}
                                        onChange={(val) => setForm(f => ({ ...f, content_tr: val }))}
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Service Title (English)">
                                <input type="text" className="input h-11 text-base font-bold" value={form.title_en} onChange={set("title_en")} placeholder="Enter English service title..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Short Description (English)">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_en} onChange={set("description_en")} />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Service Body Content (English)">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <RichTextEditor
                                        value={form.content_en}
                                        onChange={(val) => setForm(f => ({ ...f, content_en: val }))}
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>
                )}
            </FormSection>

            <FormSection title="Ticari Bilgiler & Medya" icon={<Banknote size={20} />} columns={2}>
                <FormField label="Fiyat (Opsiyonel)">
                    <input type="number" step="0.01" className="input h-10 text-xs" value={form.price} onChange={set("price")} />
                </FormField>
                <FormField label="Para Birimi">
                    <select className="input h-10 text-xs" value={form.currency} onChange={set("currency")}>
                        <option value="TRY">TRY (₺)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </FormField>
                <div className="md:col-span-2">
                    <MediaGallery
                        value={form.image_url}
                        onChange={(url) => setForm(f => ({ ...f, image_url: url as string }))}
                        category="services"
                        label="Kapak Fotoğrafı"
                        hint="Hizmetin ana görseli - detay ve liste sayfalarında görüntülenir"
                        maxImages={1}
                        aspectRatio="video"
                        gridCols={4}
                    />
                </div>
            </FormSection>

            <FormSection title="Etiket Bulutu" icon={<Tag size={20} />} columns={1}>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl min-h-16 items-center">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 text-[11px] font-black uppercase tracking-wider rounded-xl shadow-sm group hover:border-indigo-200 transition-all">
                                {tag}
                                <button type="button" onClick={() => setTags((prev) => prev.filter(t => t !== tag))} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {tags.length === 0 && <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Henüz etiket eklenmedi</span>}
                    </div>
                    <div className="relative group max-w-sm">
                        <Plus size={14} className="absolute left-3 top-3.5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Etiket yazıp Enter'a bas..."
                            className="input h-10 pl-9 text-xs"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = tagInput.trim();
                                    if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
                                    setTagInput("");
                                }
                            }}
                        />
                    </div>
                </div>
            </FormSection>

            {/* SEO Yapılandırması - Accordion */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <button
                    type="button"
                    onClick={() => setSeoExpanded(!seoExpanded)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-600 shadow-sm ring-1 ring-slate-200/50">
                            <Search size={20} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h2 className="text-base font-semibold text-slate-900 tracking-tight">SEO Yapılandırması</h2>
                            <p className="text-sm text-slate-500 mt-1">Meta başlıkları, açıklamalar ve anahtar kelimeler</p>
                        </div>
                    </div>
                    {seoExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {seoExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Meta Başlığı" hint="Tarayıcı sekmesinde ve Google'da görünen başlık">
                                <input type="text" className="input h-10 text-xs" value={form.meta_title} onChange={set("meta_title")} placeholder="SEO Başlığı" />
                            </FormField>
                            <FormField label="Canonical URL" hint="Multi-tenant kopya içerik sorununu çözmek için">
                                <input type="text" className="input h-10 text-xs" value={form.canonical_url} onChange={set("canonical_url")} placeholder="https://www.for-labs.com/hizmetler/..." />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Meta Açıklaması" hint="Arama sonuçlarında başlığın altında görünen açıklama (max 160 karakter)">
                                    <textarea className="input min-h-20 py-3 text-xs" value={form.meta_description} onChange={set("meta_description")} placeholder="İçeriği özetleyen SEO açıklaması..." maxLength={160} />
                                    <p className="text-[10px] text-slate-400 mt-1 text-right">{form.meta_description.length}/160</p>
                                </FormField>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FormPage>
    );
}
