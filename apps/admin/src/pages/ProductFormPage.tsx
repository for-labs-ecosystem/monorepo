import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, {
    FormSection,
    FormField,
    LangTabs,
    SidebarCard,
    type Lang,
} from "../components/FormPage";
import DropZone from "../components/DropZone";
import { Package } from "lucide-react";

const CATEGORIES: { value: string; label: string }[] = [
    { value: "", label: "Kategori seçin" },
];

export default function ProductFormPage() {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [lang, setLang] = useState<Lang>("tr");
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title_tr: "",
        title_en: "",
        slug: "",
        description_tr: "",
        description_en: "",
        price: "",
        compare_price: "",
        unit: "",
        sku: "",
        image_url: "",
        category_id: "",
        is_featured: false,
        is_active: true,
        sort_order: "0",
    });

    // Auto-generate slug from TR title
    const handleTitleTr = (v: string) => {
        const slug = v
            .toLowerCase()
            .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
            .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        setForm((f) => ({ ...f, title_tr: v, slug }));
    };

    // Load existing data in edit mode
    const { data: existing } = useQuery({
        queryKey: ["product", id],
        queryFn: () => api.getProduct?.(Number(id)),
        enabled: isEdit,
    });

    useEffect(() => {
        if (!existing?.data) return;
        const d = existing.data;
        setForm({
            title_tr: d.title ?? "",
            title_en: d.title_en ?? "",
            slug: d.slug ?? "",
            description_tr: d.description ?? "",
            description_en: d.description_en ?? "",
            price: d.price?.toString() ?? "",
            compare_price: d.compare_price?.toString() ?? "",
            unit: d.unit ?? "",
            sku: d.sku ?? "",
            image_url: d.image_url ?? "",
            category_id: d.category_id?.toString() ?? "",
            is_featured: !!d.is_featured,
            is_active: d.is_active !== false,
            sort_order: d.sort_order?.toString() ?? "0",
        });
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
                price: form.price ? parseFloat(form.price) : null,
                compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
                unit: form.unit || null,
                sku: form.sku || null,
                image_url: form.image_url || null,
                category_id: form.category_id ? parseInt(form.category_id) : null,
                is_featured: form.is_featured ? 1 : 0,
                is_active: form.is_active ? 1 : 0,
                sort_order: parseInt(form.sort_order) || 0,
            };
            if (isEdit && id) {
                await api.updateProduct(Number(id), payload);
            } else {
                await api.createProduct(payload);
            }
            queryClient.invalidateQueries({ queryKey: ["products"] });
            navigate("/products");
        } catch (err: any) {
            alert(err.message || "Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        await api.deleteProduct?.(Number(id));
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    return (
        <FormPage
            title={isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
            subtitle="Ürün bilgilerini girin"
            backHref="/products"
            onSave={handleSave}
            onDelete={isEdit ? handleDelete : undefined}
            isEdit={isEdit}
            saving={saving}
            sidebar={
                <>
                    <SidebarCard title="Yayınlama">
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Aktif</p>
                                    <p className="text-xs text-slate-400">Sitede görünür</p>
                                </div>
                                <div
                                    onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? "bg-indigo-500" : "bg-slate-200"
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"
                                        }`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Öne Çıkan</p>
                                    <p className="text-xs text-slate-400">Ana sayfada göster</p>
                                </div>
                                <div
                                    onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_featured ? "bg-amber-400" : "bg-slate-200"
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0.5"
                                        }`} />
                                </div>
                            </label>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Organizasyon">
                        <div className="space-y-3">
                            <FormField label="Sıralama">
                                <input
                                    type="number"
                                    value={form.sort_order}
                                    onChange={set("sort_order")}
                                    className="input"
                                    min="0"
                                />
                            </FormField>
                            <FormField label="SKU / Stok Kodu">
                                <input
                                    type="text"
                                    value={form.sku}
                                    onChange={set("sku")}
                                    className="input"
                                    placeholder="FL-001"
                                />
                            </FormField>
                            <FormField label="Birim">
                                <input
                                    type="text"
                                    value={form.unit}
                                    onChange={set("unit")}
                                    className="input"
                                    placeholder="Adet, Kg, Lt..."
                                />
                            </FormField>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Fiyatlandırma">
                        <div className="space-y-3">
                            <FormField label="Satış Fiyatı (₺)" required>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={set("price")}
                                    className="input"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>
                            <FormField label="Karşılaştırma Fiyatı (₺)">
                                <input
                                    type="number"
                                    value={form.compare_price}
                                    onChange={set("compare_price")}
                                    className="input"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>
                        </div>
                    </SidebarCard>
                </>
            }
        >
            {/* ── Bilingual content ── */}
            <FormSection
                title="Ürün Bilgileri"
                description="Türkçe ve İngilizce içerik girişi yapın"
            >
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="space-y-5">
                        <FormField label="Ürün Adı (TR)" required>
                            <input
                                type="text"
                                value={form.title_tr}
                                onChange={(e) => handleTitleTr(e.target.value)}
                                className="input"
                                placeholder="Ürün adını girin"
                            />
                        </FormField>
                        <FormField label="Açıklama (TR)">
                            <textarea
                                value={form.description_tr}
                                onChange={set("description_tr")}
                                className="input textarea"
                                placeholder="Ürün açıklaması..."
                                rows={4}
                            />
                        </FormField>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <FormField label="Product Name (EN)">
                            <input
                                type="text"
                                value={form.title_en}
                                onChange={set("title_en")}
                                className="input"
                                placeholder="Enter product name"
                            />
                        </FormField>
                        <FormField label="Description (EN)">
                            <textarea
                                value={form.description_en}
                                onChange={set("description_en")}
                                className="input textarea"
                                placeholder="Product description..."
                                rows={4}
                            />
                        </FormField>
                    </div>
                )}

                <FormField label="Slug" hint="URL'de kullanılacak kısa isim. Türkçe başlıktan otomatik oluşturulur.">
                    <div className="flex items-center">
                        <span className="flex-shrink-0 text-xs bg-slate-50 border border-r-0 border-slate-200 text-slate-400 px-3 py-2.5 rounded-l-md">
                            /products/
                        </span>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={set("slug")}
                            className="input rounded-l-none"
                            placeholder="urun-adi"
                        />
                    </div>
                </FormField>
            </FormSection>

            {/* ── Media ── */}
            <FormSection
                title="Görsel"
                description="Ürün ana görseli yükleyin veya URL girin"
            >
                <DropZone
                    value={form.image_url}
                    onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                    accept="image/*"
                    label="Ürün görseli yükle"
                    hint="PNG, JPG, WebP — önerilen 800×800px"
                />
            </FormSection>
        </FormPage>
    );
}
