import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import FormPage, { FormSection, FormField, SidebarCard } from "../components/FormPage";
import {
    Globe, Package, FileText, Wrench, BookOpen, FolderKanban,
    Check, ExternalLink, Loader2, PlayCircle, CheckCircle2, XCircle
} from "lucide-react";

// All possible content modules in the CMS
const ALL_MODULES = [
    { key: "products", label: "Ürünler", labelEn: "Products", icon: Package, description: "Ürün kataloğu ve fiyatlandırma" },
    { key: "articles", label: "Makaleler", labelEn: "Articles", icon: FileText, description: "Blog yazıları ve bilgi bankası" },
    { key: "services", label: "Hizmetler", labelEn: "Services", icon: Wrench, description: "Sunulan hizmetler ve açıklamalar" },
    { key: "pages", label: "Sayfalar", labelEn: "Pages", icon: BookOpen, description: "Hakkımızda, İletişim gibi statik sayfalar" },
    { key: "projects", label: "Projeler", labelEn: "Projects", icon: FolderKanban, description: "Referans ve tamamlanan projeler" },
] as const;

type ModuleKey = typeof ALL_MODULES[number]["key"];

export default function SiteDetailPage() {
    const { idOrSlug } = useParams<{ idOrSlug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = idOrSlug === "new";
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [testingIyzico, setTestingIyzico] = useState(false);
    const [iyzicoTestResult, setIyzicoTestResult] = useState<{ status: 'ok' | 'failed' | 'error', message: string } | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: "",
        name_en: "",
        domain: "",
        slug: "",
        description: "",
        description_en: "",
        has_ecommerce: false,
        is_active: true,
    });

    const [ecommerceConfig, setEcommerceConfig] = useState({
        currency: "TRY",
        iyzico_api_key: "",
        iyzico_secret_key: "",
        iyzico_base_url: "https://sandbox-api.iyzipay.com",
        vat_rate: "20",
        free_shipping_threshold: "0",
        flat_shipping_cost: "0",
        contact_email: "",
        allow_guest_checkout: true,
        low_stock_threshold: "5",
    });

    // Which modules are enabled for this site
    const [enabledModules, setEnabledModules] = useState<ModuleKey[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["site", idOrSlug],
        queryFn: () => api.getSite(idOrSlug!),
        enabled: !!idOrSlug && !isNew,
    });

    // Populate form when data arrives
    useEffect(() => {
        if (!data?.data) return;
        const s = data.data;
        setForm({
            name: s.name ?? "",
            name_en: s.name_en ?? "",
            domain: s.domain ?? "",
            slug: s.slug ?? "",
            description: s.description ?? "",
            description_en: s.description_en ?? "",
            has_ecommerce: !!s.has_ecommerce,
            is_active: s.is_active !== false,
        });
        // Parse enabled_modules — null means "all enabled"
        if (s.enabled_modules) {
            try {
                const parsed = typeof s.enabled_modules === "string"
                    ? JSON.parse(s.enabled_modules)
                    : s.enabled_modules;
                setEnabledModules(parsed);
            } catch {
                setEnabledModules(ALL_MODULES.map((m) => m.key));
            }
        } else {
            // null = all enabled
            setEnabledModules(ALL_MODULES.map((m) => m.key));
        }

        // Parse ecommerce_config
        if (s.ecommerce_config) {
            try {
                const parsed = typeof s.ecommerce_config === "string"
                    ? JSON.parse(s.ecommerce_config)
                    : s.ecommerce_config;
                setEcommerceConfig({
                    currency: parsed.currency || "TRY",
                    iyzico_api_key: parsed.iyzico_api_key || "",
                    iyzico_secret_key: parsed.iyzico_secret_key || "",
                    iyzico_base_url: parsed.iyzico_base_url || "https://sandbox-api.iyzipay.com",
                    vat_rate: parsed.vat_rate || "20",
                    free_shipping_threshold: parsed.free_shipping_threshold || "0",
                    flat_shipping_cost: parsed.flat_shipping_cost || "0",
                    contact_email: parsed.contact_email || "",
                    allow_guest_checkout: parsed.allow_guest_checkout !== false,
                    low_stock_threshold: parsed.low_stock_threshold || "5",
                });
            } catch {
                // Keep defaults if parse fails
            }
        }
    }, [data]);

    const handleTestIyzico = async () => {
        setTestingIyzico(true);
        setIyzicoTestResult(null);
        try {
            const res = await api.testIyzicoConnection(ecommerceConfig);
            setIyzicoTestResult({ status: 'ok', message: res.message });
        } catch (err: any) {
            setIyzicoTestResult({ status: 'failed', message: err.message || "Bağlantı hatası oluştu." });
        } finally {
            setTestingIyzico(false);
        }
    };

    const toggleModule = (key: ModuleKey) => {
        setEnabledModules((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const set = (key: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg("");
        try {
            const payload: any = {
                name: form.name,
                name_en: form.name_en || null,
                domain: form.domain,
                slug: form.slug,
                description: form.description || null,
                description_en: form.description_en || null,
                has_ecommerce: form.has_ecommerce,
                is_active: form.is_active,
                enabled_modules: enabledModules,
                ecommerce_config: ecommerceConfig,
            };

            if (isNew) {
                const res = await api.createSite(payload);
                queryClient.invalidateQueries({ queryKey: ["sites"] });
                setSuccessMsg("Site başarıyla oluşturuldu");
                setTimeout(() => navigate(`/sites/${res.data.slug}`), 1000);
            } else {
                await api.updateSite(idOrSlug!, payload);
                queryClient.invalidateQueries({ queryKey: ["sites"] });
                queryClient.invalidateQueries({ queryKey: ["site", idOrSlug] });
                setSuccessMsg("Ayarlar kaydedildi");
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err: any) {
            alert(err.message || "İşlem başarısız");
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 size={24} className="animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <FormPage
            title={isNew ? "Yeni Site" : (form.name || "Site Ayarları")}
            subtitle={isNew ? "Sisteme yeni bir tenant domaini ekleyin" : (form.domain ? `${form.domain} — yapılandırma ve içerik modül ayarları` : "")}
            backHref="/sites"
            onSave={handleSave}
            saving={saving}
            isEdit={!isNew}
            sidebar={
                <>
                    {/* ── Status ── */}
                    <SidebarCard title="Durum">
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Aktif</p>
                                    <p className="text-xs text-slate-400">Site yayında mı?</p>
                                </div>
                                <div
                                    onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? "bg-emerald-500" : "bg-slate-200"
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"
                                        }`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">E-Ticaret</p>
                                    <p className="text-xs text-slate-400">Sipariş ve ödeme alabilir</p>
                                </div>
                                <div
                                    onClick={() => setForm((f) => ({ ...f, has_ecommerce: !f.has_ecommerce }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.has_ecommerce ? "bg-indigo-500" : "bg-slate-200"
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.has_ecommerce ? "translate-x-5" : "translate-x-0.5"
                                        }`} />
                                </div>
                            </label>
                        </div>
                    </SidebarCard>

                    {/* ── E-Commerce Sidebar ── */}
                    {form.has_ecommerce && (
                        <SidebarCard title="E-Ticaret Durumu">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-2 h-2 rounded-full ${ecommerceConfig.iyzico_api_key ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                <span className="text-xs font-medium text-slate-600">
                                    {ecommerceConfig.iyzico_api_key ? "Ödeme Sistemi Bağlı" : "Ödeme Yapılandırması Eksik"}
                                </span>
                            </div>
                            <div className="space-y-1 text-[10px] text-slate-400">
                                <div className="flex justify-between">
                                    <span>Para Birimi</span>
                                    <span className="text-slate-600 font-mono">{ecommerceConfig.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>KDV Oranı</span>
                                    <span className="text-slate-600">%{ecommerceConfig.vat_rate}</span>
                                </div>
                            </div>
                        </SidebarCard>
                    )}

                    {/* ── Quick links ── */}
                    <SidebarCard title="Hızlı Erişim">
                        <div className="space-y-2">
                            <a
                                href={`https://${form.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                <ExternalLink size={12} />
                                Siteyi ziyaret et
                            </a>
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <Globe size={12} />
                                Dashboard'da seç
                            </button>
                        </div>
                    </SidebarCard>

                    {/* ── Summary ── */}
                    <SidebarCard title="Bilgi">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Slug</span>
                                <code className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">{form.slug}</code>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Domain</span>
                                <span className="text-slate-700">{form.domain}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Aktif modüller</span>
                                <span className="text-indigo-600 font-semibold">{enabledModules.length} / {ALL_MODULES.length}</span>
                            </div>
                        </div>
                    </SidebarCard>
                </>
            }
        >
            {/* ── Success message ── */}
            {successMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-lg mb-4">
                    <Check size={15} />
                    {successMsg}
                </div>
            )}

            {/* ── Basic info ── */}
            <FormSection title="Genel Bilgiler" description="Site adı, domain ve açıklama">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Site Adı (TR)" required>
                        <input type="text" value={form.name} onChange={set("name")} className="input" placeholder="Örn: Atago TR" />
                    </FormField>
                    <FormField label="Site Adı (EN)">
                        <input type="text" value={form.name_en} onChange={set("name_en")} className="input" placeholder="e.g. Atago TR" />
                    </FormField>
                    <FormField label="Slug (Benzersiz Kimlik)" required>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={set("slug")}
                            className="input font-mono text-xs"
                            placeholder="Örn: atagotr"
                            disabled={!isNew}
                        />
                        {!isNew && <p className="text-[10px] text-slate-400 mt-1">Slug oluşturulduktan sonra değiştirilemez.</p>}
                    </FormField>
                    <FormField label="Domain" required>
                        <input type="text" value={form.domain} onChange={set("domain")} className="input" placeholder="atagotr.com" />
                    </FormField>
                    <FormField label="Has E-Commerce">
                        <div className="flex items-center gap-2 h-10">
                            <input
                                type="checkbox"
                                checked={form.has_ecommerce}
                                onChange={(e) => setForm(f => ({ ...f, has_ecommerce: e.target.checked }))}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <span className="text-sm text-slate-600">Bu site e-ticaret özelliklerini kullanır</span>
                        </div>
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <FormField label="Açıklama (TR)">
                        <textarea value={form.description} onChange={set("description")} className="input textarea" rows={3} placeholder="Bu site hakkında kısa bilgi..." />
                    </FormField>
                    <FormField label="Açıklama (EN)">
                        <textarea value={form.description_en} onChange={set("description_en")} className="input textarea" rows={3} placeholder="Short info about this site..." />
                    </FormField>
                </div>
            </FormSection>

            {/* ── Content Modules — the key feature ── */}
            <FormSection
                title="İçerik Modülleri"
                description="Bu sitenin beslendiği içerik türlerini seçin. Kapattığınız modüller Dashboard'da ve site API'sında görünmez."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ALL_MODULES.map((mod) => {
                        const Icon = mod.icon;
                        const enabled = enabledModules.includes(mod.key);
                        return (
                            <div
                                key={mod.key}
                                onClick={() => toggleModule(mod.key)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${enabled
                                    ? "border-indigo-200 bg-indigo-50/60 shadow-sm"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                                    }`}
                            >
                                {/* Module icon */}
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-indigo-500 shadow-sm" : "bg-slate-100"
                                    }`}>
                                    <Icon size={16} className={enabled ? "text-white" : "text-slate-400"} />
                                </div>

                                {/* Label & description */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold leading-tight ${enabled ? "text-indigo-800" : "text-slate-500"
                                        }`}>
                                        {mod.label}
                                        <span className={`ml-1.5 text-[10px] font-normal ${enabled ? "text-indigo-400" : "text-slate-300"
                                            }`}>
                                            {mod.labelEn}
                                        </span>
                                    </p>
                                    <p className={`text-xs leading-snug mt-0.5 ${enabled ? "text-indigo-500/70" : "text-slate-400"
                                        }`}>
                                        {mod.description}
                                    </p>
                                </div>

                                {/* Toggle indicator */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${enabled
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-slate-200 bg-white"
                                    }`}>
                                    {enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Aktif olmayan modüller bu sitenin Dashboard görünümünde ve genel API yanıtlarında yer almaz.
                    İçerik global havuzda kalır fakat bu siteye beslenmez.
                </p>
            </FormSection>

            {/* ── E-Commerce Advanced Settings ── */}
            {form.has_ecommerce && (
                <FormSection
                    title="E-Ticaret Yapılandırması"
                    description="Ödeme sistemi (Iyzico), vergi oranları ve kargo ayarlarını buradan yönetin."
                >
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-6">
                        {/* ── Gateway ── */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Ödeme Sistemi (Iyzico Hosted Checkout)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Iyzico API Key">
                                    <input
                                        type="password"
                                        value={ecommerceConfig.iyzico_api_key}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, iyzico_api_key: e.target.value }))}
                                        className="input font-mono text-xs"
                                        placeholder="api_key_..."
                                    />
                                </FormField>
                                <FormField label="Iyzico Secret Key">
                                    <input
                                        type="password"
                                        value={ecommerceConfig.iyzico_secret_key}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, iyzico_secret_key: e.target.value }))}
                                        className="input font-mono text-xs"
                                        placeholder="secret_key_..."
                                    />
                                </FormField>
                                <FormField label="API Base URL">
                                    <select
                                        value={ecommerceConfig.iyzico_base_url}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, iyzico_base_url: e.target.value }))}
                                        className="input select"
                                    >
                                        <option value="https://sandbox-api.iyzipay.com">Sandbox (Test)</option>
                                        <option value="https://api.iyzipay.com">Live (Canlı)</option>
                                    </select>
                                </FormField>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200/60" />

                        {/* ── Financials ── */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Finansal Ayarlar ve Vergiler
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <FormField label="Para Birimi">
                                    <select
                                        value={ecommerceConfig.currency}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, currency: e.target.value }))}
                                        className="input select"
                                    >
                                        <option value="TRY">Türk Lirası (₺)</option>
                                        <option value="USD">Amerikan Doları ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                    </select>
                                </FormField>
                                <FormField label="Varsayılan KDV Oranı (%)">
                                    <input
                                        type="number"
                                        value={ecommerceConfig.vat_rate}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, vat_rate: e.target.value }))}
                                        className="input"
                                        placeholder="20"
                                    />
                                </FormField>
                                <FormField label="İletişim E-Postası (Sipariş Bildirimleri)">
                                    <input
                                        type="email"
                                        value={ecommerceConfig.contact_email}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                                        className="input"
                                        placeholder="orders@site.com"
                                    />
                                </FormField>
                                <FormField label="Düşük Stok Uyarısı (Adet)">
                                    <input
                                        type="number"
                                        value={ecommerceConfig.low_stock_threshold}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                                        className="input"
                                        placeholder="5"
                                    />
                                </FormField>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200/60" />

                        {/* ── Checkout & Shipping ── */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Ödeme ve Teslimat Kuralları
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <FormField label="Sabit Kargo Ücreti">
                                    <input
                                        type="number"
                                        value={ecommerceConfig.flat_shipping_cost}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, flat_shipping_cost: e.target.value }))}
                                        className="input"
                                        placeholder="0.00"
                                    />
                                </FormField>
                                <FormField label="Ücretsiz Kargo Alt Limiti">
                                    <input
                                        type="number"
                                        value={ecommerceConfig.free_shipping_threshold}
                                        onChange={(e) => setEcommerceConfig(prev => ({ ...prev, free_shipping_threshold: e.target.value }))}
                                        className="input"
                                        placeholder="0.00"
                                    />
                                </FormField>
                                <FormField label="Misafir Alışverişi">
                                    <div className="flex items-center gap-2 h-10">
                                        <input
                                            type="checkbox"
                                            checked={ecommerceConfig.allow_guest_checkout}
                                            onChange={(e) => setEcommerceConfig(prev => ({ ...prev, allow_guest_checkout: e.target.checked }))}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="text-sm text-slate-600">Üye olmadan sipariş verebilir</span>
                                    </div>
                                </FormField>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200/60" />

                        {/* ── Test Iyzico Connection ── */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1">
                                    Iyzico Bağlantısını Sına
                                </h4>
                                <p className="text-xs text-slate-500 max-w-lg">
                                    Yukarıda girdiğiniz bilgilerin geçerli olup olmadığını anlamak için canlı bağlantı testi yapın. Değişiklik yaptıysanız, en son halinin test edileceğini unutmayın.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <button
                                    onClick={handleTestIyzico}
                                    disabled={testingIyzico || !ecommerceConfig.iyzico_api_key || !ecommerceConfig.iyzico_secret_key}
                                    className={`btn h-9 px-4 text-sm font-medium ${iyzicoTestResult?.status === 'ok' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 disabled:opacity-50'} rounded-lg flex items-center gap-2 transition-all`}
                                >
                                    {testingIyzico ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                                    Bağlantıyı Test Et
                                </button>
                                {iyzicoTestResult && (
                                    <div className={`flex items-center justify-end gap-1.5 text-[11px] font-medium ${iyzicoTestResult.status === 'ok' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {iyzicoTestResult.status === 'ok' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                        {iyzicoTestResult.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </FormSection>
            )}
        </FormPage>
    );
}
