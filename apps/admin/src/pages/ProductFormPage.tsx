import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import RichTextEditor from "../components/RichTextEditor";
import SitePublisher from "../components/SitePublisher";
import MediaGallery from "../components/MediaGallery";
import CategoryTreeSelect from "../components/CategoryTreeSelect";
import type { SiteVisibility } from "../components/SitePublisher";
import {
    FileText,
    ImageIcon,
    Globe,
    Tag,
    ShieldCheck,
    X,
    Plus,
    Info,
    Package,
    Beaker,
    Layers,
    ListChecks,
    Settings,
    Search,
    ChevronDown,
    ChevronUp,
    Cpu,
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

/**
 * ── Attributes Editor (Key-Value pairs) ──
 */
function AttributesEditor({
    value,
    onChange,
    placeholderKey = "Özellik...",
    placeholderValue = "Değer..."
}: {
    value: { key: string; value: string }[],
    onChange: (val: { key: string; value: string }[]) => void,
    placeholderKey?: string,
    placeholderValue?: string
}) {
    const add = () => onChange([...value, { key: "", value: "" }]);
    const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
    const update = (index: number, k: string, v: string) => {
        const next = [...value];
        next[index] = { key: k, value: v };
        onChange(next);
    };

    return (
        <div className="space-y-2">
            {value.map((item, i) => (
                <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                        type="text"
                        placeholder={placeholderKey}
                        className="input flex-1 !h-9 text-[13px] font-semibold bg-slate-50 border-slate-200"
                        value={item.key}
                        onChange={(e) => update(i, e.target.value, item.value)}
                    />
                    <input
                        type="text"
                        placeholder={placeholderValue}
                        className="input flex-[1.5] !h-9 text-[13px] bg-white"
                        value={item.value}
                        onChange={(e) => update(i, item.key, e.target.value)}
                    />
                    <button
                        onClick={() => remove(i)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            <button
                onClick={add}
                className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-dashed border-indigo-200 w-full justify-center mt-2 group"
            >
                <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                Yeni Özellik Ekle
            </button>
        </div>
    );
}

/**
 * ── Tags Manager (Chip-based) ──
 */
function TagsManager({
    value,
    onChange,
    placeholder = "Eklemek için Enter..."
}: {
    value: string[],
    onChange: (val: string[]) => void,
    placeholder?: string
}) {
    const [input, setInput] = useState("");

    const addTag = () => {
        const tag = input.trim();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
            setInput("");
        }
    };

    const removeTag = (tag: string) => onChange(value.filter(t => t !== tag));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {value.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100 animate-in zoom-in-95 duration-200">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-rose-600">
                            <X size={10} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <input
                    type="text"
                    className="input !h-9 text-[13px] pr-10"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <button
                    onClick={addTag}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}

export default function ProductFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<"tr" | "en">("tr");
    const [gallery, setGallery] = useState<string[]>([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const [seoExpanded, setSeoExpanded] = useState(false);

    const [form, setForm] = useState({
        title_tr: "",
        title_en: "",
        slug: "",
        description_tr: "",
        description_en: "",
        content_tr: "",
        content_en: "",
        // Rich Content
        specs_tr: "",
        specs_en: "",
        features_tr: [] as { key: string; value: string }[],
        features_en: [] as { key: string; value: string }[],
        // Relations & IDs
        category_id: "",
        // Attributes
        price: "",
        compare_price: "",
        currency: "TRY",
        unit: "Adet",
        stock_quantity: "",
        sku: "",
        brand: "",
        model_number: "",
        warranty_period: "2 Yıl",
        campaign_label: "",
        tags: [] as string[],
        tags_en: [] as string[],
        application_areas: [] as string[],
        application_areas_en: [] as string[],
        // Intelligence Platform
        analysis_types: [] as string[],
        analysis_types_en: [] as string[],
        automation_level: "",
        compliance_tags: [] as string[],
        // Status
        is_featured: false,
        is_active: true,
        sort_order: "0",
        // SEO
        meta_title: "",
        meta_description: "",
        canonical_url: "",
    });

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);

    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });

    const { data: existing } = useQuery({
        queryKey: ["product", id],
        queryFn: () => api.getProduct(Number(id)),
        enabled: isEdit,
    });

    const { data: overrides } = useQuery({
        queryKey: ["product-overrides", id],
        queryFn: () => api.getProductOverrides(Number(id)),
        enabled: isEdit,
    });

    const categoryList = categoriesData?.data || [];

    // Initialize Visibility from Overrides
    useEffect(() => {
        if (!isEdit) return;
        if (overrides?.data && siteVisibility.length > 0) {
            setSiteVisibility((prev) =>
                prev.map((sv) => {
                    const ov = overrides.data.find((o: any) => o.site_id === sv.siteId);
                    if (ov) {
                        return {
                            ...sv,
                            isVisible: ov.is_visible !== false,
                            is_featured: !!ov.is_featured,
                            meta_title: ov.meta_title || "",
                            meta_description: ov.meta_description || "",
                            canonical_url: ov.canonical_url || ""
                        };
                    }
                    return sv;
                })
            );
        }
    }, [overrides, isEdit, siteVisibility.length > 0]);

    // Initialize Form from Global Data
    useEffect(() => {
        if (!existing?.data) return;
        const d = existing.data;

        let parsedFeatures = [] as any;
        try { parsedFeatures = d.features ? JSON.parse(d.features) : []; } catch (e) { /* fallback */ }
        let parsedFeaturesEn = [] as any;
        try { parsedFeaturesEn = d.features_en ? JSON.parse(d.features_en) : []; } catch (e) { /* fallback */ }

        let parsedTags = [] as string[];
        try { parsedTags = d.tags ? JSON.parse(d.tags) : []; } catch (e) { parsedTags = d.tags ? d.tags.split(',').map((t: any) => t.trim()) : []; }
        let parsedTagsEn = [] as string[];
        try { parsedTagsEn = d.tags_en ? JSON.parse(d.tags_en) : []; } catch (e) { parsedTagsEn = d.tags_en ? d.tags_en.split(',').map((t: any) => t.trim()) : []; }

        let parsedAreas = [] as string[];
        try { parsedAreas = d.application_areas ? JSON.parse(d.application_areas) : []; } catch (e) { parsedAreas = d.application_areas ? d.application_areas.split(',').map((t: any) => t.trim()) : []; }
        let parsedAreasEn = [] as string[];
        try { parsedAreasEn = d.application_areas_en ? JSON.parse(d.application_areas_en) : []; } catch (e) { parsedAreasEn = d.application_areas_en ? d.application_areas_en.split(',').map((t: any) => t.trim()) : []; }

        let parsedAnalysisTypes = [] as string[];
        try { parsedAnalysisTypes = d.analysis_types ? JSON.parse(d.analysis_types) : []; } catch (e) { parsedAnalysisTypes = []; }
        let parsedAnalysisTypesEn = [] as string[];
        try { parsedAnalysisTypesEn = d.analysis_types_en ? JSON.parse(d.analysis_types_en) : []; } catch (e) { parsedAnalysisTypesEn = []; }
        let parsedComplianceTags = [] as string[];
        try { parsedComplianceTags = d.compliance_tags ? JSON.parse(d.compliance_tags) : []; } catch (e) { parsedComplianceTags = []; }

        setForm({
            title_tr: d.title ?? "",
            title_en: d.title_en ?? "",
            slug: d.slug ?? "",
            description_tr: d.description ?? "",
            description_en: d.description_en ?? "",
            content_tr: d.content ?? "",
            content_en: d.content_en ?? "",
            specs_tr: d.specs ?? "",
            specs_en: d.specs_en ?? "",
            features_tr: parsedFeatures,
            features_en: parsedFeaturesEn,
            price: d.price?.toString() ?? "",
            compare_price: d.compare_price?.toString() ?? "",
            currency: d.currency ?? "TRY",
            unit: d.unit ?? "Adet",
            stock_quantity: d.stock_quantity?.toString() ?? "",
            sku: d.sku ?? "",
            brand: d.brand ?? "",
            model_number: d.model_number ?? "",
            warranty_period: d.warranty_period ?? "2 Yıl",
            campaign_label: d.campaign_label ?? "",
            tags: parsedTags,
            tags_en: parsedTagsEn,
            application_areas: parsedAreas,
            application_areas_en: parsedAreasEn,
            analysis_types: parsedAnalysisTypes,
            analysis_types_en: parsedAnalysisTypesEn,
            automation_level: d.automation_level ?? "",
            compliance_tags: parsedComplianceTags,
            category_id: d.category_id?.toString() ?? "",
            is_featured: !!d.is_featured,
            is_active: d.is_active !== false,
            sort_order: d.sort_order?.toString() ?? "0",
            meta_title: d.meta_title ?? "",
            meta_description: d.meta_description ?? "",
            canonical_url: d.canonical_url ?? "",
        });

        // Parse gallery
        let parsedGallery: string[] = [];
        if (d.gallery) {
            try {
                const parsed = typeof d.gallery === 'string' ? JSON.parse(d.gallery) : d.gallery;
                parsedGallery = Array.isArray(parsed) ? parsed : [];
            } catch { parsedGallery = []; }
        }
        
        // Fallback to image_url if gallery is empty
        if (parsedGallery.length === 0 && d.image_url) {
            parsedGallery = [d.image_url];
        }
        setGallery(parsedGallery);
    }, [existing]);

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async () => {
        if (!form.title_tr || !form.slug) {
            alert("Lütfen başlık ve slug alanlarını doldurun.");
            return;
        }

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
                specs: form.specs_tr || null,
                specs_en: form.specs_en || null,
                features: JSON.stringify(form.features_tr),
                features_en: JSON.stringify(form.features_en),
                price: form.price ? parseFloat(form.price) : null,
                compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
                currency: form.currency || "TRY",
                unit: form.unit || null,
                stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : 0,
                sku: form.sku || null,
                brand: form.brand || null,
                model_number: form.model_number || null,
                warranty_period: form.warranty_period || null,
                campaign_label: form.campaign_label || null,
                tags: JSON.stringify(form.tags),
                tags_en: JSON.stringify(form.tags_en),
                application_areas: JSON.stringify(form.application_areas),
                application_areas_en: JSON.stringify(form.application_areas_en),
                analysis_types: JSON.stringify(form.analysis_types),
                analysis_types_en: JSON.stringify(form.analysis_types_en),
                automation_level: form.automation_level || null,
                compliance_tags: JSON.stringify(form.compliance_tags),
                category_id: form.category_id ? parseInt(form.category_id) : null,
                image_url: gallery.length > 0 ? gallery[thumbnailIndex] : null,
                gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                canonical_url: form.canonical_url || null,
                is_featured: !!form.is_featured,
                is_active: !!form.is_active,
                sort_order: parseInt(form.sort_order) || 0,
            };

            let savedId: number;
            if (isEdit && id) {
                const res = await api.updateProduct(Number(id), payload);
                savedId = res.data.id;
            } else {
                const res = await api.createProduct(payload);
                savedId = res.data.id;
            }

            // Save overrides
            for (const sv of siteVisibility) {
                await api.setProductSiteOverride(savedId, sv.siteId, {
                    is_visible: sv.isVisible,
                    is_featured: !!sv.is_featured,
                    sort_order: parseInt(form.sort_order) || 0,
                    stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : null,
                    meta_title: sv.meta_title || null,
                    meta_description: sv.meta_description || null,
                    canonical_url: sv.canonical_url || null,
                });
            }

            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", id] });
            queryClient.invalidateQueries({ queryKey: ["product-overrides", id] });

            navigate("/products");
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(err.message || "Kaydetme başarısız.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        await api.deleteProduct(Number(id));
        queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate("/products");
    };

    return (
        <FormPage
            title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
            subtitle="Ürün katalog verilerini ve site bazlı görünürlükleri özelleştirin"
            backHref="/products"
            onSave={handleSave}
            onDelete={isEdit ? handleDelete : undefined}
            isEdit={isEdit}
            saving={saving}
            sidebar={
                <div className="space-y-6">
                    <SidebarCard title="Görünürlük & Durum">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Genel Yayında</p>
                                    <p className="text-[11px] text-slate-400">Tüm sistemde aktiflik durumu</p>
                                </div>
                                <div
                                    onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${form.is_active ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Vitrinde Göster</p>
                                    <p className="text-[11px] text-slate-400">Tüm sitelerde vitrinde gösterir</p>
                                </div>
                                <div
                                    onClick={() => {
                                        const next = !form.is_featured;
                                        setForm((f) => ({ ...f, is_featured: next }));
                                        setSiteVisibility((prev) =>
                                            prev.map((sv) => ({
                                                ...sv,
                                                is_featured: sv.isVisible ? next : sv.is_featured,
                                            }))
                                        );
                                    }}
                                    className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${form.is_featured ? "bg-amber-400 shadow-lg shadow-amber-100" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.is_featured ? "translate-x-6" : "translate-x-1"}`} />
                                </div>
                            </label>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Yönetim İpuçları" icon={<Info size={16} />}>
                        <div className="space-y-4">
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                <p className="text-[11px] text-amber-800 leading-relaxed">
                                    <strong className="block mb-1 text-amber-900 font-bold tracking-tight">🚀 SEO & Kopya İçerik Uyarı</strong>
                                    İçeriğin yayınlandığı her sitede Google tarafından "kopya içerik" (duplicate content) olarak algılanmaması için "Site Bazlı Yayın" panelinden her siteye özel özgün SEO meta metinleri girmeniz kritik önem taşır.
                                </p>
                            </div>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Site Bazlı Yayın" icon={<Globe size={16} />}>
                        <SitePublisher
                            visibilityState={siteVisibility}
                            onChange={setSiteVisibility}
                            saving={saving}
                        />
                    </SidebarCard>
                </div>
            }
        >
            <FormSection title="Temel Kimlik" icon={<Package size={18} />} description="Ürünün pazardaki benzersiz kimliği ve erişim noktaları">
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="space-y-6">
                        <FormField label="Ürün Başlık / İsim" required hint="Müşterilerin göreceği ana başlık">
                            <input
                                type="text"
                                className="input text-lg font-black tracking-tight border-none bg-slate-50/50 shadow-inner focus:ring-0"
                                placeholder="Örn: Laboratuvar Buzdolabı 360L"
                                value={form.title_tr}
                                onChange={(e) => {
                                    setForm((f) => ({
                                        ...f,
                                        title_tr: e.target.value,
                                        ...(!isEdit && { slug: slugify(e.target.value) }),
                                    }));
                                }}
                            />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Erişim Yolu (Slug)" hint="Arama motoru dostu URL uzantısı">
                                <div className="flex items-center gap-2 group">
                                    <div className="flex-1 relative">
                                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                        <input
                                            type="text"
                                            className="input !h-9 bg-slate-50/20 font-mono text-[11px] pl-9 border-dashed border-slate-200"
                                            value={form.slug}
                                            onChange={set("slug")}
                                            placeholder="urun-ismi-buraya"
                                        />
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">/products/</div>
                                </div>
                            </FormField>
                            <FormField label="Marka / Üretici" hint="Ürünün ait olduğu ana marka">
                                <div className="relative">
                                    <Beaker size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                    <input type="text" className="input !h-9 pl-9 font-bold text-indigo-700 bg-indigo-50/30 border-indigo-100" value={form.brand} onChange={set("brand")} placeholder="Atago, Merck, Siemens..." />
                                </div>
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <FormField label="Product Title (English)" hint="Product name for international catalog">
                            <input type="text" className="input text-lg font-black" value={form.title_en} onChange={set("title_en")} placeholder="English title..." />
                        </FormField>
                    </div>
                )}
            </FormSection>

            <FormSection title="Ürün Açıklamaları" icon={<FileText size={18} />} description="Müşterilere sunulacak zengin metin detayları">
                <div className="space-y-6">
                    <FormField label={lang === "tr" ? "Kısa Açıklama / Özet" : "Short Description (EN)"}>
                        <RichTextEditor
                            value={lang === "tr" ? form.description_tr : form.description_en}
                            onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'description_tr' : 'description_en']: val }))}
                        />
                    </FormField>
                    <FormField label={lang === "tr" ? "Ürün Teknik Detay Açıklaması" : "Technical Specs (EN)"}>
                        <RichTextEditor
                            value={lang === "tr" ? form.specs_tr : form.specs_en}
                            onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'specs_tr' : 'specs_en']: val }))}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Organizasyon & Sınıflandırma" icon={<Layers size={18} />} columns={2}>
                <FormField label="Ürün Kategorisi">
                    <CategoryTreeSelect
                        categories={categoryList}
                        value={form.category_id}
                        onChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
                        placeholder="Kategori seçin..."
                        filterType="product"
                    />
                </FormField>
                <FormField label="Stok Kodu (SKU)">
                    <div className="relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input type="text" className="input !h-10 pl-9 uppercase font-mono font-bold text-slate-500" value={form.sku} onChange={set("sku")} placeholder="PRD-0001" />
                    </div>
                </FormField>
                <FormField label="Model Numarası">
                    <input type="text" className="input !h-10" value={form.model_number} onChange={set("model_number")} placeholder="Örn: RX-400X" />
                </FormField>
                <FormField label="Ölçü Birimi">
                    <input type="text" className="input !h-10" value={form.unit} onChange={set("unit")} placeholder="Adet, Paket, KG..." />
                </FormField>
                <FormField label="Kampanya Etiketi">
                    <input type="text" className="input !h-10 text-rose-500 font-bold bg-rose-50/30 border-rose-100" value={form.campaign_label} onChange={set("campaign_label")} placeholder="Örn: Stokta, Yeni Ürün" />
                </FormField>
                <FormField label="Sıralama Önceliği" hint="Ürünün listeleme sırası">
                    <div className="flex gap-2">
                        <select 
                            className="input !h-10 flex-1" 
                            value={form.sort_order} 
                            onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))}
                        >
                            <option value="0">Varsayılan (0)</option>
                            <option value="10">Öne Çıkan (10)</option>
                            <option value="20">Çok Satan (20)</option>
                            <option value="30">Yeni Ürün (30)</option>
                            <option value="40">İndirimli (40)</option>
                            <option value="50">Manuel Sıralama (50)</option>
                            <option value="100">En Üst (100)</option>
                        </select>
                        <input 
                            type="number" 
                            className="input !h-10 w-24" 
                            value={form.sort_order} 
                            onChange={set("sort_order")} 
                            placeholder="0"
                        />
                    </div>
                </FormField>
                <FormField label="Stok Adedi" hint="Mevcut stok miktarı">
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            className="input !h-10 flex-1" 
                            value={form.stock_quantity || ""} 
                            onChange={(e) => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                            placeholder="0"
                            min="0"
                        />
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, stock_quantity: "999" }))}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                        >
                            Stokta Var
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, stock_quantity: "0" }))}
                            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm font-medium text-rose-600 transition-colors"
                        >
                            Stokta Yok
                        </button>
                    </div>
                </FormField>
            </FormSection>

            <FormSection title="Özellikler & Uygulama" icon={<ListChecks size={18} />} columns={2}>
                <FormField label={lang === "tr" ? "Öne Çıkan Özellikler" : "Key Features (EN)"} hint={lang === "tr" ? "Teknik parametreleri tek tek girin" : "Enter technical parameters one by one"}>
                    <AttributesEditor
                        value={lang === "tr" ? form.features_tr : form.features_en}
                        onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'features_tr' : 'features_en']: val }))}
                        placeholderKey={lang === "tr" ? "Özellik..." : "Feature..."}
                        placeholderValue={lang === "tr" ? "Değer..." : "Value..."}
                    />
                </FormField>
                <div className="space-y-8">
                    <FormField label={lang === "tr" ? "Uygulama Alanları" : "Application Areas (EN)"} hint={lang === "tr" ? "Enter tuşu ile ekleyin" : "Press Enter to add"}>
                        <TagsManager
                            value={lang === "tr" ? form.application_areas : form.application_areas_en}
                            onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'application_areas' : 'application_areas_en']: val }))}
                            placeholder={lang === "tr" ? "Örn: Gıda Endüstrisi..." : "e.g. Food Industry..."}
                        />
                    </FormField>
                    <FormField label={lang === "tr" ? "Etiketler" : "Tags (EN)"} hint={lang === "tr" ? "SEO ve Filtreleme için" : "For SEO and Filtering"}>
                        <TagsManager
                            value={lang === "tr" ? form.tags : form.tags_en}
                            onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'tags' : 'tags_en']: val }))}
                            placeholder={lang === "tr" ? "Örn: laboratuvar..." : "e.g. laboratory..."}
                        />
                    </FormField>
                    <FormField label={lang === "tr" ? "Garanti Süresi" : "Warranty Period"}>
                        <div className="relative">
                            <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input type="text" className="input !h-9 pl-9" value={form.warranty_period} onChange={set("warranty_period")} />
                        </div>
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Intelligence Platform" icon={<Cpu size={18} />} description="Eşleştirme sihirbazı için ürün parametreleri">
                <div className="space-y-8">
                    <FormField label={lang === "tr" ? "Analiz Tipleri" : "Analysis Types (EN)"} hint={lang === "tr" ? "Bu ürünün desteklediği analiz metotları" : "Analysis methods this product supports"}>
                        <TagsManager
                            value={lang === "tr" ? form.analysis_types : form.analysis_types_en}
                            onChange={(val) => setForm(f => ({ ...f, [lang === "tr" ? 'analysis_types' : 'analysis_types_en']: val }))}
                            placeholder={lang === "tr" ? "Örn: pH Ölçüm, Brix Ölçüm, Titrasyon..." : "e.g. pH Measurement, Brix..."}
                        />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Otomasyon Seviyesi" hint="Cihazın otomasyon düzeyi">
                            <select
                                value={form.automation_level}
                                onChange={set("automation_level")}
                                className="input !h-10 font-bold text-slate-700 bg-slate-50"
                            >
                                <option value="">Seçiniz...</option>
                                <option value="manual">Manuel</option>
                                <option value="semi-auto">Yarı Otomatik</option>
                                <option value="full-auto">Tam Otomatik</option>
                            </select>
                        </FormField>
                        <FormField label="Uyumluluk & Sertifikalar" hint="ISO, GLP, CE gibi standartlar">
                            <TagsManager
                                value={form.compliance_tags}
                                onChange={(val) => setForm(f => ({ ...f, compliance_tags: val }))}
                                placeholder="Örn: ISO 17025, GLP/GMP, CE..."
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Görsel Yönetimi" icon={<ImageIcon size={18} />}>
                <MediaGallery
                    value={gallery}
                    onChange={(urls) => setGallery(urls as string[])}
                    category="products"
                    label="Ürün Görselleri"
                    hint="Ürün galeri görselleri - yıldızlı görsel thumbnail olarak kullanılır (max 10 adet)"
                    maxImages={10}
                    aspectRatio="square"
                    gridCols={4}
                    allowThumbnailSelection={true}
                    thumbnailIndex={thumbnailIndex}
                    onThumbnailChange={setThumbnailIndex}
                />
            </FormSection>

            <FormSection title="Ticari Bilgiler" icon={<Settings size={18} />} columns={2}>
                <FormField label="Satış Fiyatı">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-lg">₺</div>
                        <input type="number" step="0.01" className="input !h-12 pl-10 font-black text-xl text-slate-800" value={form.price} onChange={set("price")} />
                    </div>
                </FormField>
                <FormField label="Eski Fiyat (Karşılaştırma)">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold truncate">₺</div>
                        <input type="number" step="0.01" className="input !h-12 pl-10 text-slate-400 italic line-through" value={form.compare_price} onChange={set("compare_price")} />
                    </div>
                </FormField>
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
                                <input type="text" className="input h-10 text-xs" value={form.canonical_url} onChange={set("canonical_url")} placeholder="https://www.for-labs.com/urunler/..." />
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
