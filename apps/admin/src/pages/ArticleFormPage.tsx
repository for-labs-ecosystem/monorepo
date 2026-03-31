import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard, LangTabs } from "../components/FormPage";
import RichTextEditor from "../components/RichTextEditor";
import SitePublisher from "../components/SitePublisher";
import MediaGallery from "../components/MediaGallery";
import CategoryTreeSelect from "../components/CategoryTreeSelect";
import type { SiteVisibility } from "../components/SitePublisher";
import {
    LayoutGrid,
    FileText,
    Image as ImageIcon,
    Search,
    Globe,
    Zap,
    Tag,
    User,
    Calendar,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
    Key,
    PackageSearch,
    ShoppingBag
} from "lucide-react";

const slugify = (text: string) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export default function ArticleFormPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const siteId = Number(searchParams.get("site_id") || "0") || undefined;

    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<"tr" | "en">("tr");

    const [form, setForm] = useState({
        title_tr: "",
        title_en: "",
        slug: "",
        excerpt_tr: "",
        excerpt_en: "",
        content_tr: "",
        content_en: "",
        author: "",
        cover_image_url: "",
        category_id: "",
        is_featured: false,
        is_active: true,
        sort_order: "0",
        // SEO fields
        meta_title: "",
        meta_title_en: "",
        meta_description: "",
        meta_description_en: "",
        canonical_url: "",
        keywords: "",
        // Publishing
        published_at: "",
    });

    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [seoExpanded, setSeoExpanded] = useState(false);

    // Related Products
    const [relatedProductIds, setRelatedProductIds] = useState<number[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef<HTMLDivElement>(null);

    const [siteVisibility, setSiteVisibility] = useState<SiteVisibility[]>([]);
    const overridesSynced = useRef(false);

    const { data: categoriesData } = useQuery({
        queryKey: ["article-categories"],
        queryFn: () => api.getCategories(),
    });

    const { data: productsData } = useQuery({
        queryKey: ["products-for-articles"],
        queryFn: () => api.getProducts(),
    });

    const { data: existing } = useQuery({
        queryKey: ["article", id, siteId],
        queryFn: () => api.getArticle(Number(id), siteId),
        enabled: isEdit,
    });

    const { data: overrides } = useQuery({
        queryKey: ["article-overrides", id],
        queryFn: () => api.getArticleOverrides(Number(id)),
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
            excerpt_tr: d.excerpt ?? "",
            excerpt_en: d.excerpt_en ?? "",
            content_tr: d.content ?? "",
            content_en: d.content_en ?? "",
            author: d.author ?? "",
            cover_image_url: d.cover_image_url ?? "",
            category_id: d.category_id?.toString() ?? "",
            is_featured: !!d.is_featured,
            is_active: d.is_active !== false,
            sort_order: d.sort_order?.toString() ?? "0",
            meta_title: d.meta_title ?? "",
            meta_title_en: d.meta_title_en ?? "",
            meta_description: d.meta_description ?? "",
            meta_description_en: d.meta_description_en ?? "",
            canonical_url: d.canonical_url ?? "",
            keywords: d.keywords ?? "",
            published_at: d.published_at ?? "",
        });

        // Parse tags
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

    // Tag helpers
    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const backHref = siteId ? `/articles?site_id=${siteId}` : "/articles";

    const handleDelete = async () => {
        if (!isEdit || !id) return;
        if (!window.confirm("Bu makaleyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setSaving(true);
        try {
            await api.deleteArticle(Number(id));
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["article", id] });
            queryClient.invalidateQueries({ queryKey: ["article-overrides", id] });
            navigate(backHref);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Silme başarısız";
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title: form.title_tr,
                title_en: form.title_en || null,
                slug: form.slug,
                excerpt: form.excerpt_tr || null,
                excerpt_en: form.excerpt_en || null,
                content: form.content_tr || null,
                content_en: form.content_en || null,
                author: form.author || null,
                cover_image_url: form.cover_image_url || null,
                category_id: form.category_id ? parseInt(form.category_id) : null,
                // Tags & Keywords
                tags: tags.length > 0 ? tags : null,
                keywords: form.keywords || null,
                // SEO
                meta_title: form.meta_title || null,
                meta_title_en: form.meta_title_en || null,
                meta_description: form.meta_description || null,
                meta_description_en: form.meta_description_en || null,
                canonical_url: form.canonical_url || null,
                // Publishing
                published_at: form.published_at || null,
                is_featured: !!form.is_featured,
                is_active: !!form.is_active,
                sort_order: parseInt(form.sort_order) || 0,
                // Related Products
                relatedProductIds,
            };

            let savedId: number;
            if (isEdit && id) {
                await api.updateArticle(Number(id), payload);
                savedId = Number(id);
            } else {
                const res = await api.createArticle(payload);
                savedId = res.data.id;
            }

            // Save overrides — all sites in parallel for reliability
            const overrideResults = await Promise.allSettled(
                siteVisibility.map((sv) =>
                    api.setArticleSiteOverride(savedId, sv.siteId, {
                        is_visible: sv.isVisible,
                        is_featured: sv.isVisible ? (!!sv.is_featured || !!form.is_featured) : !!sv.is_featured,
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

            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["article", id] });
            queryClient.invalidateQueries({ queryKey: ["article-overrides", id] });
            navigate(backHref);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Kaydetme başarısız";
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <FormPage
            title={isEdit ? "Makale Düzenle" : "Yeni Makale"}
            subtitle="Blog yazıları, haberler ve bilgi bankası içerikleri"
            backHref={backHref}
            onSave={handleSave}
            onDelete={isEdit ? handleDelete : undefined}
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
                                    onClick={() => {
                                        setForm((f) => {
                                            const nextIsFeatured = !f.is_featured;
                                            setSiteVisibility((prev) =>
                                                prev.map((sv) =>
                                                    sv.isVisible ? { ...sv, is_featured: nextIsFeatured } : sv
                                                )
                                            );
                                            return { ...f, is_featured: nextIsFeatured };
                                        });
                                    }}
                                    className={`relative w-8 h-4 rounded-full transition-all ${form.is_featured ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${form.is_featured ? "translate-x-4" : ""}`} />
                                </div>
                            </label>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-2">
                                        <Calendar size={12} /> Yayın Tarihi
                                    </span>
                                    <input
                                        type="date"
                                        className="input h-9 text-xs w-full"
                                        value={form.published_at}
                                        onChange={set("published_at")}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Geriye dönük tarih girilebilir</p>
                                </label>
                            </div>
                        </div>
                    </SidebarCard>

                    <SidebarCard title="Organizasyon" icon={<Tag size={14} />}>
                        <div className="space-y-4">
                            <FormField label="Kategori">
                                <CategoryTreeSelect
                                    categories={categoryList}
                                    value={form.category_id}
                                    onChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
                                    placeholder="Kategori seçin..."
                                    filterType="article"
                                />
                            </FormField>
                            <FormField label="Sıralama Priority">
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

                            {/* Search dropdown — fixed positioning to escape overflow */}
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
            <FormSection title="Temel İçerik" icon={<FileText size={20} />} columns={1}>
                <LangTabs lang={lang} onChange={setLang} />

                {lang === "tr" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Makale Başlığı" required>
                                <input
                                    type="text"
                                    className="input h-11 text-base font-medium"
                                    value={form.title_tr}
                                    onChange={(e) => {
                                        setForm(f => ({
                                            ...f,
                                            title_tr: e.target.value,
                                            ...(!isEdit && { slug: slugify(e.target.value) })
                                        }));
                                    }}
                                    placeholder="Özgün ve çekici bir başlık girin..."
                                />
                            </FormField>
                        </div>
                        <FormField label="URL Slug" hint="Arama motoru dostu adres (SEO)">
                            <div className="relative">
                                <input type="text" className="input h-10 pl-8 bg-slate-50/50 font-mono text-[10px]" value={form.slug} onChange={set("slug")} />
                                <LayoutGrid size={12} className="absolute left-3 top-3.5 text-slate-300" />
                            </div>
                        </FormField>
                        <FormField label="Yazar" hint="İçerik sahibi">
                            <div className="relative">
                                <input type="text" className="input h-10 pl-8 bg-slate-50/50 text-xs" value={form.author} onChange={set("author")} placeholder="Örn: Deniz Han" />
                                <User size={12} className="absolute left-3 top-3.5 text-slate-300" />
                            </div>
                        </FormField>
                        <div className="md:col-span-2">
                            <FormField label="Kısa Özet" hint="Liste sayfalarında görünen giriş metni">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.excerpt_tr} onChange={set("excerpt_tr")} placeholder="Okuyucunun dikkatini çekecek bir özet..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Makale Detayı">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                    <RichTextEditor
                                        value={form.content_tr}
                                        onChange={(val) => setForm(f => ({ ...f, content_tr: val }))}
                                        placeholder="Makale içeriğini buraya girin..."
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormField label="Article Title (English)">
                                <input type="text" className="input h-11 text-base font-medium" value={form.title_en} onChange={set("title_en")} placeholder="Enter English title..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Short Excerpt (English)">
                                <textarea className="input min-h-20 py-3 text-sm" value={form.excerpt_en} onChange={set("excerpt_en")} placeholder="English summary..." />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Article Body (English)">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <RichTextEditor
                                        value={form.content_en}
                                        onChange={(val) => setForm(f => ({ ...f, content_en: val }))}
                                        placeholder="English content..."
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>
                )}
            </FormSection>

            {/* Görsel & Medya */}
            <FormSection title="Görsel & Medya" icon={<ImageIcon size={20} />} columns={1}>
                <MediaGallery
                    value={form.cover_image_url}
                    onChange={(url) => setForm(f => ({ ...f, cover_image_url: url as string }))}
                    category="articles"
                    label="Kapak Fotoğrafı"
                    hint="Makalenin ana görseli - liste ve detay sayfalarında görünür"
                    maxImages={1}
                    aspectRatio="video"
                    gridCols={2}
                />
            </FormSection>

            {/* Etiketler */}
            <FormSection title="Etiketler" icon={<Tag size={20} />} columns={1}>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input h-10 flex-1 text-xs"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Etiket yazıp Enter'a basın..."
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 h-10 bg-indigo-500 text-white rounded-xl text-xs font-medium hover:bg-indigo-600 transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Ekle
                        </button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
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
                        <LangTabs lang={lang} onChange={setLang} />
                        
                        {lang === "tr" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <FormField label="Meta Başlığı (TR)" hint="Tarayıcı sekmesinde ve Google'da görünen başlık">
                                    <input type="text" className="input h-10 text-xs" value={form.meta_title} onChange={set("meta_title")} placeholder="SEO Başlığı (Türkçe)" />
                                </FormField>
                                <FormField label="Canonical URL" hint="Multi-tenant kopya içerik sorununu çözmek için">
                                    <input type="text" className="input h-10 text-xs" value={form.canonical_url} onChange={set("canonical_url")} placeholder="https://www.for-labs.com/makaleler/..." />
                                </FormField>
                                <div className="md:col-span-2">
                                    <FormField label="Meta Açıklaması (TR)" hint="Arama sonuçlarında başlığın altında görünen açıklama (max 160 karakter)">
                                        <textarea className="input min-h-20 py-3 text-xs" value={form.meta_description} onChange={set("meta_description")} placeholder="İçeriği özetleyen SEO açıklaması..." maxLength={160} />
                                        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.meta_description.length}/160</p>
                                    </FormField>
                                </div>
                                <div className="md:col-span-2">
                                    <FormField label="Anahtar Kelimeler" hint="Virgülle ayırarak yazın">
                                        <div className="relative">
                                            <Key size={14} className="absolute left-3 top-3 text-slate-300" />
                                            <input type="text" className="input h-10 pl-9 text-xs" value={form.keywords} onChange={set("keywords")} placeholder="laboratuvar, analiz, test, gıda güvenliği" />
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <FormField label="Meta Title (EN)" hint="Browser tab and Google search title">
                                    <input type="text" className="input h-10 text-xs" value={form.meta_title_en} onChange={set("meta_title_en")} placeholder="SEO Title (English)" />
                                </FormField>
                                <div className="md:col-span-2">
                                    <FormField label="Meta Description (EN)" hint="Search result description (max 160 chars)">
                                        <textarea className="input min-h-20 py-3 text-xs" value={form.meta_description_en} onChange={set("meta_description_en")} placeholder="English SEO description..." maxLength={160} />
                                        <p className="text-[10px] text-slate-400 mt-1 text-right">{form.meta_description_en.length}/160</p>
                                    </FormField>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </FormPage>
    );
}
