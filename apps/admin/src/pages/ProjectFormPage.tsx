import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import RichTextEditor from "../components/RichTextEditor";
import SitePublisher from "../components/SitePublisher";
import MediaGallery from "../components/MediaGallery";
import type { SiteVisibility } from "../components/SitePublisher";
import {
    LayoutGrid,
    Briefcase,
    Image as ImageIcon,
    Globe,
    Zap,
    MapPin,
    Calendar,
    Building2,
    Quote,
    BarChart3,
    Tag,
    Plus,
    X,
    Trash2,
    Search,
    PackageSearch,
    ShoppingBag
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

// Metric type definition
interface ProjectMetric {
    id: string;
    label: string;
    value: string;
    icon?: string;
}

export default function ProjectFormPage() {
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
        description_tr: "",
        description_en: "",
        content_tr: "",
        content_en: "",
        client_name: "",
        location: "",
        start_date: "",
        completion_date: "",
        status: "completed",
        category_id: "",
        cover_image_url: "",
        header_image_url: "",
        video_url: "",
        testimonial: "",
        testimonial_author: "",
        testimonial_author_title: "",
        is_active: true,
        is_featured: false,
        sort_order: "0",
    });

    const [gallery, setGallery] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<ProjectMetric[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");

    // Related Products
    const [relatedProductIds, setRelatedProductIds] = useState<number[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef<HTMLDivElement>(null);

    // Categories for dropdown
    const { data: categoriesRes } = useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });
    const categories = categoriesRes?.data || [];

    const { data: productsData } = useQuery({
        queryKey: ["products-for-projects"],
        queryFn: () => api.getProducts(),
    });

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);
    const overridesSynced = useRef(false);

    const { data: existing } = useQuery({
        queryKey: ["project", id],
        queryFn: () => api.getProject(Number(id)),
        enabled: isEdit,
    });

    const { data: overrides } = useQuery({
        queryKey: ["project-overrides", id],
        queryFn: () => api.getProjectOverrides(Number(id)),
        enabled: isEdit,
    });

    // Close product dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
                setProductDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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

        // Load existing related products
        if (Array.isArray(d.relatedProducts)) {
            setRelatedProductIds(d.relatedProducts.map((p: { id: number; title: string }) => p.id));
        }

        setForm({
            title_tr: d.title ?? "",
            title_en: d.title_en ?? "",
            slug: d.slug ?? "",
            description_tr: d.description ?? "",
            description_en: d.description_en ?? "",
            content_tr: d.content ?? "",
            content_en: d.content_en ?? "",
            client_name: d.client_name ?? "",
            location: d.location ?? "",
            start_date: d.start_date ?? "",
            completion_date: d.completion_date ?? "",
            status: d.status ?? "completed",
            category_id: d.category_id?.toString() ?? "",
            cover_image_url: d.cover_image_url ?? "",
            header_image_url: d.header_image_url ?? "",
            video_url: d.video_url ?? "",
            testimonial: d.testimonial ?? "",
            testimonial_author: d.testimonial_author ?? "",
            testimonial_author_title: d.testimonial_author_title ?? "",
            is_active: d.is_active !== false,
            is_featured: !!d.is_featured,
            sort_order: d.sort_order?.toString() ?? "0",
        });

        // Parse JSON fields
        if (d.gallery) {
            try {
                const parsed = typeof d.gallery === 'string' ? JSON.parse(d.gallery) : d.gallery;
                setGallery(Array.isArray(parsed) ? parsed : []);
            } catch { setGallery([]); }
        }
        if (d.metrics) {
            try {
                const parsed = typeof d.metrics === 'string' ? JSON.parse(d.metrics) : d.metrics;
                setMetrics(Array.isArray(parsed) ? parsed : []);
            } catch { setMetrics([]); }
        }
        if (d.tags) {
            try {
                const parsed = typeof d.tags === 'string' ? JSON.parse(d.tags) : d.tags;
                setTags(Array.isArray(parsed) ? parsed : []);
            } catch { setTags([]); }
        }
    }, [existing]);

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    // Helper functions for tags
    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };


    // Helper functions for metrics
    const addMetric = () => {
        setMetrics([...metrics, { id: Date.now().toString(), label: "", value: "" }]);
    };

    const updateMetric = (id: string, field: "label" | "value", value: string) => {
        setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const removeMetric = (id: string) => {
        setMetrics(metrics.filter(m => m.id !== id));
    };

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
                client_name: form.client_name || null,
                location: form.location || null,
                start_date: form.start_date || null,
                completion_date: form.completion_date || null,
                status: form.status || "completed",
                category_id: form.category_id ? parseInt(form.category_id) : null,
                cover_image_url: form.cover_image_url || null,
                header_image_url: form.header_image_url || null,
                video_url: form.video_url || null,
                gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
                metrics: metrics.filter(m => m.label && m.value).length > 0 
                    ? JSON.stringify(metrics.filter(m => m.label && m.value)) 
                    : null,
                tags: tags.length > 0 ? JSON.stringify(tags) : null,
                testimonial: form.testimonial || null,
                testimonial_author: form.testimonial_author || null,
                testimonial_author_title: form.testimonial_author_title || null,
                is_active: !!form.is_active,
                is_featured: !!form.is_featured,
                sort_order: parseInt(form.sort_order) || 0,
                // Related Products
                relatedProductIds,
            };

            let savedId: number;
            if (isEdit && id) {
                await api.updateProject(Number(id), payload);
                savedId = Number(id);
            } else {
                const res = await api.createProject(payload);
                savedId = res.data.id;
            }

            // Save overrides
            for (const sv of siteVisibility) {
                await api.setProjectSiteOverride(savedId, sv.siteId, {
                    is_visible: sv.isVisible,
                    is_featured: !!sv.is_featured,
                    sort_order: parseInt(form.sort_order) || 0,
                });
            }

            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", id] });
            queryClient.invalidateQueries({ queryKey: ["project-overrides", id] });
            navigate("/projects");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Kaydetme başarısız";
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <FormPage
            title={isEdit ? "Proje Düzenle" : "Yeni Proje"}
            subtitle="Referanslarınızı ve tamamlanmış işlerinizi sergileyin"
            backHref="/projects"
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

                    <SidebarCard title="Proje Durumu" icon={<Calendar size={14} />}>
                        <div className="space-y-3">
                            <FormField label="Durum">
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                    className="input text-xs bg-slate-50/50"
                                >
                                    <option value="planned">Planlandı</option>
                                    <option value="in_progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </FormField>
                            <FormField label="Kategori">
                                <select
                                    value={form.category_id}
                                    onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                                    className="input text-xs bg-slate-50/50"
                                >
                                    <option value="">Kategori seçin...</option>
                                    {categories.map((cat: { id: number; name: string }) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Sıralama">
                                <input type="number" value={form.sort_order} onChange={set("sort_order")} className="input text-xs bg-slate-50/50" />
                            </FormField>
                        </div>
                    </SidebarCard>

                    {/* Related Products */}
                    <SidebarCard title="İlgili Ürünler" icon={<ShoppingBag size={14} />} overflow="visible">
                        <div className="space-y-3">

                            {/* Empty state */}
                            {relatedProductIds.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                                    <PackageSearch size={20} className="text-slate-300" />
                                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                                        Henüz ürün eklenmedi.<br />Aşağıdan arama yapın.
                                    </p>
                                </div>
                            )}

                            {/* Selected product list */}
                            {relatedProductIds.length > 0 && (
                                <div className="space-y-1.5">
                                    {relatedProductIds.map((pid, idx) => {
                                        const prod = (productsData?.data || []).find((p: { id: number; title: string; is_active: boolean }) => p.id === pid);
                                        return prod ? (
                                            <div
                                                key={pid}
                                                className="flex items-center gap-2 px-2.5 py-2 bg-indigo-50/70 border border-indigo-100 rounded-lg group"
                                            >
                                                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-[11px] font-medium text-indigo-800 flex-1 truncate">{prod.title}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setRelatedProductIds((ids) => ids.filter((i) => i !== pid))}
                                                    className="text-indigo-300 hover:text-rose-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                    <p className="text-[10px] text-slate-400 text-right pt-0.5">{relatedProductIds.length} ürün bağlandı</p>
                                </div>
                            )}

                            {/* Search dropdown — fixed positioning */}
                            <div className="relative" ref={productDropdownRef}>
                                <div className="relative">
                                    <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        className="input h-9 pl-7 text-xs w-full"
                                        placeholder="Ürün ara ve ekle..."
                                        value={productSearch}
                                        onChange={(e) => { setProductSearch(e.target.value); setProductDropdownOpen(true); }}
                                        onFocus={() => setProductDropdownOpen(true)}
                                    />
                                </div>

                                {productDropdownOpen && (() => {
                                    const inputEl = productDropdownRef.current?.querySelector("input");
                                    const rect = inputEl?.getBoundingClientRect();
                                    return rect ? (
                                        <div
                                            style={{
                                                position: "fixed",
                                                top: rect.bottom + 4,
                                                left: rect.left,
                                                width: rect.width,
                                                zIndex: 9999,
                                            }}
                                            className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                                        >
                                            <div className="max-h-52 overflow-y-auto">
                                                {(productsData?.data || [])
                                                    .filter((p: { id: number; title: string; is_active: boolean }) =>
                                                        p.is_active !== false &&
                                                        !relatedProductIds.includes(p.id) &&
                                                        (productSearch === "" || p.title.toLowerCase().includes(productSearch.toLowerCase()))
                                                    )
                                                    .slice(0, 20)
                                                    .map((p: { id: number; title: string; is_active: boolean }) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2.5 text-xs hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2.5 border-b border-slate-50 last:border-0"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setRelatedProductIds((ids) => [...ids, p.id]);
                                                                setProductSearch("");
                                                                setProductDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                                                                <PackageSearch size={11} className="text-slate-400" />
                                                            </div>
                                                            <span className="truncate font-medium">{p.title}</span>
                                                        </button>
                                                    ))}
                                                {(productsData?.data || []).filter((p: { id: number; title: string; is_active: boolean }) =>
                                                    p.is_active !== false &&
                                                    !relatedProductIds.includes(p.id) &&
                                                    (productSearch === "" || p.title.toLowerCase().includes(productSearch.toLowerCase()))
                                                ).length === 0 && (
                                                    <div className="px-3 py-4 flex flex-col items-center gap-1.5">
                                                        <PackageSearch size={16} className="text-slate-300" />
                                                        <p className="text-[10px] text-slate-400">Ürün bulunamadı</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
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
            {/* Temel Bilgiler */}
            <FormSection title="Proje Detayları" icon={<Briefcase size={20} />} columns={1}>
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Proje Adı" required>
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
                                    placeholder="Proje adını girin..."
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
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_tr} onChange={set("description_tr")} placeholder="Projenin kısa özeti..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Proje Başarı Hikayesi / İçerik">
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
                            <FormField label="Project Title (English)">
                                <input type="text" className="input h-11 text-base font-bold" value={form.title_en} onChange={set("title_en")} placeholder="Enter English project title..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Short Description (English)">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.description_en} onChange={set("description_en")} />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Project Detailed Content (English)">
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

            {/* Müşteri & Lokasyon Bilgileri */}
            <FormSection title="Müşteri & Lokasyon" icon={<Building2 size={20} />} columns={2}>
                <FormField label="Müşteri / Firma Adı" hint="Projenin yapıldığı kurum">
                    <div className="relative">
                        <Building2 size={14} className="absolute left-3 top-3 text-slate-300" />
                        <input type="text" className="input h-10 pl-9 text-sm" value={form.client_name} onChange={set("client_name")} placeholder="Örn: ABC Laboratuvarları" />
                    </div>
                </FormField>
                <FormField label="Lokasyon" hint="Şehir veya bölge">
                    <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-3 text-slate-300" />
                        <input type="text" className="input h-10 pl-9 text-sm" value={form.location} onChange={set("location")} placeholder="Örn: İstanbul, Türkiye" />
                    </div>
                </FormField>
                <FormField label="Başlangıç Tarihi">
                    <input type="month" className="input h-10 text-sm" value={form.start_date} onChange={set("start_date")} />
                </FormField>
                <FormField label="Tamamlanma Tarihi">
                    <input type="month" className="input h-10 text-sm" value={form.completion_date} onChange={set("completion_date")} />
                </FormField>
            </FormSection>

            {/* Görsel Yönetimi */}
            <FormSection title="Görsel Yönetimi" icon={<ImageIcon size={20} />} columns={1}>
                <div className="space-y-6">
                    <MediaGallery
                        value={form.cover_image_url}
                        onChange={(url) => setForm(f => ({ ...f, cover_image_url: url as string }))}
                        category="projects"
                        label="Kapak Görseli"
                        hint="Liste ve kartlarda görünen ana görsel"
                        maxImages={1}
                        aspectRatio="video"
                        gridCols={2}
                    />
                    
                    <MediaGallery
                        value={form.header_image_url}
                        onChange={(url) => setForm(f => ({ ...f, header_image_url: url as string }))}
                        category="projects"
                        label="Header Görseli"
                        hint="Detay sayfası üst banner görseli"
                        maxImages={1}
                        aspectRatio="banner"
                        gridCols={2}
                    />

                    <MediaGallery
                        value={gallery}
                        onChange={(urls) => setGallery(urls as string[])}
                        category="projects"
                        label="Proje Galerisi"
                        hint="Proje detaylarını gösteren ek görseller (max 10 adet)"
                        maxImages={10}
                        aspectRatio="video"
                        gridCols={3}
                    />
                </div>
            </FormSection>

            {/* Proje Metrikleri */}
            <FormSection title="Proje Metrikleri" icon={<BarChart3 size={20} />} columns={1}>
                <p className="text-xs text-slate-500 mb-4">Projenin önemli rakamlarını ve başarı metriklerini ekleyin (örn: Alan, Süre, Bütçe, Ekipman Sayısı)</p>
                <div className="space-y-3">
                    {metrics.map((metric) => (
                        <div key={metric.id} className="flex gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <BarChart3 size={16} className="text-slate-300" />
                            <input
                                type="text"
                                className="input h-9 flex-1 text-sm"
                                value={metric.label}
                                onChange={(e) => updateMetric(metric.id, "label", e.target.value)}
                                placeholder="Metrik adı (örn: Toplam Alan)"
                            />
                            <input
                                type="text"
                                className="input h-9 w-40 text-sm font-semibold"
                                value={metric.value}
                                onChange={(e) => updateMetric(metric.id, "value", e.target.value)}
                                placeholder="Değer (örn: 500m²)"
                            />
                            <button
                                type="button"
                                onClick={() => removeMetric(metric.id)}
                                className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addMetric}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} /> Yeni Metrik Ekle
                    </button>
                </div>
            </FormSection>

            {/* Etiketler */}
            <FormSection title="Etiketler" icon={<Tag size={20} />} columns={1}>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input h-10 flex-1 text-sm"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Etiket yazıp Enter'a basın..."
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 h-10 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                            Ekle
                        </button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                                >
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-800">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </FormSection>

            {/* Müşteri Yorumu */}
            <FormSection title="Müşteri Yorumu" icon={<Quote size={20} />} columns={1}>
                <p className="text-xs text-slate-500 mb-4">Müşterinizden aldığınız referans yorumunu ekleyin</p>
                <div className="space-y-4">
                    <FormField label="Yorum Metni">
                        <textarea
                            className="input min-h-25 py-3 text-sm italic"
                            value={form.testimonial}
                            onChange={set("testimonial")}
                            placeholder="&quot;Bu proje sayesinde laboratuvarımız uluslararası standartlara ulaştı...&quot;"
                        />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Yorum Sahibi">
                            <input type="text" className="input h-10 text-sm" value={form.testimonial_author} onChange={set("testimonial_author")} placeholder="Örn: Dr. Ahmet Yılmaz" />
                        </FormField>
                        <FormField label="Unvan / Pozisyon">
                            <input type="text" className="input h-10 text-sm" value={form.testimonial_author_title} onChange={set("testimonial_author_title")} placeholder="Örn: Laboratuvar Müdürü, ABC Şirketi" />
                        </FormField>
                    </div>
                </div>
            </FormSection>
        </FormPage>
    );
}
