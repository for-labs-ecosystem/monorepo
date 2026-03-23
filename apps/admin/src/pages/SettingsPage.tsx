import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
    Building2,
    CreditCard,
    Mail,
    DollarSign,
    Eye,
    EyeOff,
    Save,
    CheckCircle2,
    AlertTriangle,
    Info,
    Loader2,
    ShieldCheck,
    Truck,
} from "lucide-react";

// ─── Types ───
interface CompanyInfo {
    company_name: string;
    tax_number: string;
    tax_office: string;
    address: string;
    phone: string;
    mersis_no: string;
    billing_email: string;
    kep_address: string;
}

interface IyzicoConfig {
    api_key: string;
    secret_key: string;
    base_url: string;
    is_sandbox: boolean;
    require_3d_secure: boolean;
    max_installments: number;
}

interface SmtpConfig {
    host: string;
    port: string | number;
    user: string;
    password: string;
    sender_email: string;
    sender_name: string;
}

interface EcommerceConfig {
    default_currency: string;
    default_vat_rate: string | number;
    shipping_cost: string | number;
    free_shipping_threshold: string | number;
    order_prefix: string;
}

// ─── Tab definitions ───
const TABS = [
    { id: "company", label: "Şirket & Fatura", icon: Building2, desc: "Resmi bilgiler ve fatura adresi" },
    { id: "iyzico", label: "Ödeme Altyapısı", icon: CreditCard, desc: "Iyzico API yapılandırması" },
    { id: "smtp", label: "E-posta (SMTP)", icon: Mail, desc: "Mail sunucu yapılandırması" },
    { id: "ecommerce", label: "E-Ticaret & Finans", icon: DollarSign, desc: "Para birimi ve KDV" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Defaults ───
const DEFAULT_COMPANY: CompanyInfo = { company_name: "", tax_number: "", tax_office: "", address: "", phone: "", mersis_no: "", billing_email: "", kep_address: "" };
const DEFAULT_IYZICO: IyzicoConfig = { api_key: "", secret_key: "", base_url: "https://api.iyzipay.com", is_sandbox: true, require_3d_secure: true, max_installments: 1 };
const DEFAULT_SMTP: SmtpConfig = { host: "", port: "587", user: "", password: "", sender_email: "", sender_name: "" };
const DEFAULT_ECOMMERCE: EcommerceConfig = { default_currency: "TRY", default_vat_rate: "20", shipping_cost: "0", free_shipping_threshold: "0", order_prefix: "FL-" };

// ─── Helpers ───
function PasswordInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input pr-10 font-mono text-sm"
                autoComplete="off"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
            >
                {show ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
            </button>
        </div>
    );
}

function SaveButton({ saving, dirty }: { saving: boolean; dirty: boolean }) {
    return (
        <button
            type="submit"
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
            {saving ? (
                <Loader2 size={15} className="animate-spin" strokeWidth={2} />
            ) : (
                <Save size={15} strokeWidth={2} />
            )}
            Değişiklikleri Kaydet
        </button>
    );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4">
            <CheckCircle2 size={16} strokeWidth={2} />
            {message}
        </div>
    );
}

function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
    return (
        <div className="mb-1.5">
            <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">{children}</label>
            {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
        </div>
    );
}

// ─── Section Components ───
function CompanySection({ data, onSave, saving }: { data: CompanyInfo; onSave: (d: CompanyInfo) => void; saving: boolean }) {
    const [form, setForm] = useState(() => data);
    const [dirty, setDirty] = useState(false);
    const set = (k: keyof CompanyInfo, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
            <div>
                <FieldLabel htmlFor="company_name" hint="Faturalarda ve resmi belgelerde görünecek">Şirket Resmi Adı</FieldLabel>
                <input id="company_name" className="input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="For Labs Teknoloji A.Ş." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FieldLabel htmlFor="tax_number">Vergi Numarası</FieldLabel>
                    <input id="tax_number" className="input font-mono" value={form.tax_number} onChange={(e) => set("tax_number", e.target.value)} placeholder="1234567890" />
                </div>
                <div>
                    <FieldLabel htmlFor="tax_office">Vergi Dairesi</FieldLabel>
                    <input id="tax_office" className="input" value={form.tax_office} onChange={(e) => set("tax_office", e.target.value)} placeholder="Beyoğlu" />
                </div>
            </div>
            <div>
                <FieldLabel htmlFor="address" hint="Merkez ofis adresi">Adres</FieldLabel>
                <textarea id="address" className="input min-h-20 resize-none" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Levent Mah. Caddesi No:1, Beşiktaş / İstanbul" />
            </div>
            <div>
                <FieldLabel htmlFor="phone">İletişim Telefonu</FieldLabel>
                <input id="phone" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+90 212 000 00 00" />
            </div>

            {/* ─── Yasal & E-Fatura ─── */}
            <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Yasal & E-Fatura Bilgileri</p>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel htmlFor="mersis_no" hint="E-Ticaret yasal zorunluluğu">MERSİS Numarası</FieldLabel>
                            <input id="mersis_no" className="input font-mono text-sm" value={form.mersis_no} onChange={(e) => set("mersis_no", e.target.value)} placeholder="0123456789012345" />
                        </div>
                        <div>
                            <FieldLabel htmlFor="billing_email" hint="E-Fatura ve muhasebe iletişimi">Fatura E-posta Adresi</FieldLabel>
                            <input id="billing_email" className="input text-sm" type="email" value={form.billing_email} onChange={(e) => set("billing_email", e.target.value)} placeholder="muhasebe@for-labs.com" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel htmlFor="kep_address" hint="Opsiyonel — Kayıtlı Elektronik Posta adresi">KEP Adresi</FieldLabel>
                        <input id="kep_address" className="input text-sm" value={form.kep_address} onChange={(e) => set("kep_address", e.target.value)} placeholder="firma@hs01.kep.tr" />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <SaveButton saving={saving} dirty={dirty} />
            </div>
        </form>
    );
}

function IyzicoSection({ data, onSave, saving }: { data: IyzicoConfig; onSave: (d: IyzicoConfig) => void; saving: boolean }) {
    const [form, setForm] = useState(() => data);
    const [dirty, setDirty] = useState(false);
    const set = (k: keyof IyzicoConfig, v: string | boolean | number) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
            {/* Sandbox Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${form.is_sandbox ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"} transition-colors`}>
                <div className="flex items-center gap-3">
                    {form.is_sandbox ? (
                        <AlertTriangle size={18} className="text-amber-500" strokeWidth={2} />
                    ) : (
                        <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />
                    )}
                    <div>
                        <p className={`text-sm font-semibold ${form.is_sandbox ? "text-amber-700" : "text-emerald-700"}`}>
                            {form.is_sandbox ? "Test (Sandbox) Modu" : "Canlı (Production) Modu"}
                        </p>
                        <p className={`text-xs ${form.is_sandbox ? "text-amber-500" : "text-emerald-500"}`}>
                            {form.is_sandbox ? "Gerçek ödeme alınmaz, test kartlarıyla çalışır" : "Gerçek ödeme işlemi yapılır — dikkatli olun"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => set("is_sandbox", !form.is_sandbox)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.is_sandbox ? "bg-amber-400" : "bg-emerald-500"}`}
                >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.is_sandbox ? "left-0.5" : "left-6.5"}`} />
                </button>
            </div>

            <div>
                <FieldLabel htmlFor="iyzico_api_key">API Key</FieldLabel>
                <PasswordInput id="iyzico_api_key" value={form.api_key} onChange={(v) => set("api_key", v)} placeholder="sandbox-..." />
            </div>
            <div>
                <FieldLabel htmlFor="iyzico_secret_key">Secret Key</FieldLabel>
                <PasswordInput id="iyzico_secret_key" value={form.secret_key} onChange={(v) => set("secret_key", v)} placeholder="sandbox-..." />
            </div>
            <div>
                <FieldLabel htmlFor="iyzico_base_url" hint="Sandbox: https://sandbox-api.iyzipay.com — Canlı: https://api.iyzipay.com">Base URL</FieldLabel>
                <input id="iyzico_base_url" className="input font-mono text-sm" value={form.base_url} onChange={(e) => set("base_url", e.target.value)} placeholder="https://api.iyzipay.com" />
            </div>

            {/* ─── Security & Installments ─── */}
            <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Güvenlik & Taksit</p>
                <div className="space-y-4">
                    {/* 3D Secure Toggle */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${form.require_3d_secure ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"} transition-colors`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className={form.require_3d_secure ? "text-indigo-500" : "text-slate-400"} strokeWidth={2} />
                            <div>
                                <p className={`text-sm font-semibold ${form.require_3d_secure ? "text-indigo-700" : "text-slate-600"}`}>
                                    3D Secure Zorunluluğu
                                </p>
                                <p className={`text-xs ${form.require_3d_secure ? "text-indigo-500" : "text-slate-400"}`}>
                                    {form.require_3d_secure ? "Tüm ödemelerde 3D Secure doğrulaması zorunlu" : "3D Secure kapalı — fraud riski artabilir"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => set("require_3d_secure", !form.require_3d_secure)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${form.require_3d_secure ? "bg-indigo-500" : "bg-slate-300"}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.require_3d_secure ? "left-6.5" : "left-0.5"}`} />
                        </button>
                    </div>

                    {/* Max Installments */}
                    <div>
                        <FieldLabel htmlFor="max_installments" hint="1 = Yalnızca tek çekim. Maksimum taksit sayısını belirleyin.">Maksimum Taksit Sayısı</FieldLabel>
                        <select id="max_installments" className="input" value={String(form.max_installments)} onChange={(e) => set("max_installments", Number(e.target.value))}>
                            <option value="1">1 — Tek Çekim</option>
                            <option value="2">2 Taksit</option>
                            <option value="3">3 Taksit</option>
                            <option value="6">6 Taksit</option>
                            <option value="9">9 Taksit</option>
                            <option value="12">12 Taksit</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <SaveButton saving={saving} dirty={dirty} />
            </div>
        </form>
    );
}

function SmtpSection({ data, onSave, saving }: { data: SmtpConfig; onSave: (d: SmtpConfig) => void; saving: boolean }) {
    const [form, setForm] = useState(() => data);
    const [dirty, setDirty] = useState(false);
    const set = (k: keyof SmtpConfig, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <FieldLabel htmlFor="smtp_host">SMTP Host</FieldLabel>
                    <input id="smtp_host" className="input font-mono text-sm" value={form.host} onChange={(e) => set("host", e.target.value)} placeholder="smtp.gmail.com" />
                </div>
                <div>
                    <FieldLabel htmlFor="smtp_port">Port</FieldLabel>
                    <input id="smtp_port" className="input font-mono text-sm" value={form.port} onChange={(e) => set("port", e.target.value)} placeholder="587" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FieldLabel htmlFor="smtp_user">Kullanıcı Adı</FieldLabel>
                    <input id="smtp_user" className="input text-sm" value={form.user} onChange={(e) => set("user", e.target.value)} placeholder="noreply@for-labs.com" />
                </div>
                <div>
                    <FieldLabel htmlFor="smtp_password">Şifre</FieldLabel>
                    <PasswordInput id="smtp_password" value={form.password} onChange={(v) => set("password", v)} placeholder="••••••••" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FieldLabel htmlFor="sender_email">Gönderici E-posta</FieldLabel>
                    <input id="sender_email" className="input text-sm" value={form.sender_email} onChange={(e) => set("sender_email", e.target.value)} placeholder="bildirim@for-labs.com" />
                </div>
                <div>
                    <FieldLabel htmlFor="sender_name">Gönderici Adı</FieldLabel>
                    <input id="sender_name" className="input text-sm" value={form.sender_name} onChange={(e) => set("sender_name", e.target.value)} placeholder="For Labs" />
                </div>
            </div>

            {/* Test mail placeholder */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                <Info size={15} className="text-blue-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                    <p className="text-xs font-medium text-blue-700">Test E-postası</p>
                    <p className="text-xs text-blue-500 mt-0.5">SMTP bağlantısını doğrulamak için test e-postası gönderme özelliği yakında eklenecek.</p>
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <SaveButton saving={saving} dirty={dirty} />
            </div>
        </form>
    );
}

function EcommerceSection({ data, onSave, saving }: { data: EcommerceConfig; onSave: (d: EcommerceConfig) => void; saving: boolean }) {
    const [form, setForm] = useState(() => data);
    const [dirty, setDirty] = useState(false);
    const set = (k: keyof EcommerceConfig, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true); };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FieldLabel htmlFor="default_currency" hint="Tüm fiyatlar bu para biriminde gösterilir">Varsayılan Para Birimi</FieldLabel>
                    <select id="default_currency" className="input" value={form.default_currency} onChange={(e) => set("default_currency", e.target.value)}>
                        <option value="TRY">TRY — Türk Lirası (₺)</option>
                        <option value="USD">USD — Amerikan Doları ($)</option>
                        <option value="EUR">EUR — Euro (€)</option>
                        <option value="GBP">GBP — İngiliz Sterlini (£)</option>
                    </select>
                </div>
                <div>
                    <FieldLabel htmlFor="default_vat_rate" hint="Sipariş toplamına uygulanacak (%)">Varsayılan KDV Oranı</FieldLabel>
                    <div className="relative">
                        <input id="default_vat_rate" className="input pr-8 font-mono" type="number" min="0" max="100" step="1" value={form.default_vat_rate} onChange={(e) => set("default_vat_rate", e.target.value)} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">%</span>
                    </div>
                </div>
            </div>

            {/* ─── Kargo & Sipariş ─── */}
            <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Kargo & Sipariş</p>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FieldLabel htmlFor="shipping_cost" hint="Standart kargo ücreti (0 = ücretsiz)">Sabit Kargo Ücreti</FieldLabel>
                            <div className="relative">
                                <input id="shipping_cost" className="input pr-8 font-mono" type="number" min="0" step="0.01" value={form.shipping_cost} onChange={(e) => set("shipping_cost", e.target.value)} placeholder="150" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₺</span>
                            </div>
                        </div>
                        <div>
                            <FieldLabel htmlFor="free_shipping_threshold" hint="Bu tutarın üzerinde kargo bedava (0 = devre dışı)">Ücretsiz Kargo Barajı</FieldLabel>
                            <div className="relative">
                                <input id="free_shipping_threshold" className="input pr-8 font-mono" type="number" min="0" step="0.01" value={form.free_shipping_threshold} onChange={(e) => set("free_shipping_threshold", e.target.value)} placeholder="5000" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₺</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <FieldLabel htmlFor="order_prefix" hint="Sipariş numarası öneki (Örn: FL-10045)">Sipariş Numarası Öneki</FieldLabel>
                        <input id="order_prefix" className="input font-mono w-40" value={form.order_prefix} onChange={(e) => set("order_prefix", e.target.value)} placeholder="FL-" />
                    </div>

                    {/* Shipping info banner */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-violet-50 border border-violet-100">
                        <Truck size={15} className="text-violet-400 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-xs font-medium text-violet-700">Kargo Hesaplama</p>
                            <p className="text-xs text-violet-500 mt-0.5">Sepet toplamı ücretsiz kargo barajını aştığında kargo ücreti otomatik olarak sıfırlanır.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <SaveButton saving={saving} dirty={dirty} />
            </div>
        </form>
    );
}

// ─── Main Page ───
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("company");
    const [toast, setToast] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: () => api.getSettings(),
    });

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => api.updateSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            setToast("Ayarlar başarıyla kaydedildi");
        },
    });

    const settings = settingsData?.data;

    const handleSave = useCallback(
        (key: string, value: unknown) => {
            mutation.mutate({ [key]: value });
        },
        [mutation]
    );

    const hideToast = useCallback(() => setToast(null), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    const activeTabMeta = TABS.find((t) => t.id === activeTab)!;
    const ActiveIcon = activeTabMeta.icon;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Ayarlar</h1>
                <p className="page-subtitle">Global sistem konfigürasyonu</p>
            </div>

            <div className="flex gap-6 items-start">
                {/* ─── Left: Vertical Tab Navigation ─── */}
                <nav className="w-64 shrink-0 space-y-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                    isActive
                                        ? "bg-white border border-slate-200 shadow-sm"
                                        : "hover:bg-slate-50 border border-transparent"
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "bg-slate-100 text-slate-400"
                                }`}>
                                    <Icon size={17} strokeWidth={isActive ? 2 : 1.75} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                                        {tab.label}
                                    </p>
                                    <p className={`text-xs truncate ${isActive ? "text-slate-500" : "text-slate-400"}`}>
                                        {tab.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* ─── Right: Content Card ─── */}
                <div className="flex-1 min-w-0">
                    <div className="card">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <ActiveIcon size={19} className="text-indigo-600" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">{activeTabMeta.label}</h2>
                                <p className="text-xs text-slate-400">{activeTabMeta.desc}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {activeTab === "company" && (
                                <CompanySection
                                    data={{ ...DEFAULT_COMPANY, ...settings?.company_info }}
                                    onSave={(d) => handleSave("company_info", d)}
                                    saving={mutation.isPending}
                                />
                            )}
                            {activeTab === "iyzico" && (
                                <IyzicoSection
                                    data={{ ...DEFAULT_IYZICO, ...settings?.iyzico_config }}
                                    onSave={(d) => handleSave("iyzico_config", d)}
                                    saving={mutation.isPending}
                                />
                            )}
                            {activeTab === "smtp" && (
                                <SmtpSection
                                    data={{ ...DEFAULT_SMTP, ...settings?.smtp_config }}
                                    onSave={(d) => handleSave("smtp_config", d)}
                                    saving={mutation.isPending}
                                />
                            )}
                            {activeTab === "ecommerce" && (
                                <EcommerceSection
                                    data={{ ...DEFAULT_ECOMMERCE, ...settings?.ecommerce_config }}
                                    onSave={(d) => handleSave("ecommerce_config", d)}
                                    saving={mutation.isPending}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {toast && <SuccessToast message={toast} onClose={hideToast} />}
        </div>
    );
}
