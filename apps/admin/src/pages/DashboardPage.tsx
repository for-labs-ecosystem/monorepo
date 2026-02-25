import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
    Package, FileText, Wrench, BookOpen,
    FolderOpen, Tag, MessageSquare, ShoppingCart,
    Globe, TrendingUp, Plus, ArrowRight,
    CheckCircle, Clock, AlertCircle,
} from "lucide-react";

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    description?: string;
    href: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

function StatCard({ icon: Icon, label, value, description, href, color, bgColor, borderColor }: StatCardProps) {
    const navigate = useNavigate();
    return (
        <div
            className={`card card-hover p-5 cursor-pointer border-l-4 ${borderColor}`}
            onClick={() => navigate(href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(href)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                    {description && (
                        <p className="text-xs text-slate-400 mt-1">{description}</p>
                    )}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} flex-shrink-0`}>
                    <Icon size={18} className={color} strokeWidth={1.75} />
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`${href}/new`); }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    <Plus size={12} />
                    Yeni ekle
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(href); }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Tümünü gör
                    <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

const statDefinitions = [
    { key: "products", icon: Package, label: "Ürünler", href: "/products", color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-l-indigo-500" },
    { key: "articles", icon: FileText, label: "Makaleler", href: "/articles", color: "text-sky-600", bgColor: "bg-sky-50", borderColor: "border-l-sky-500" },
    { key: "services", icon: Wrench, label: "Hizmetler", href: "/services", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-l-orange-500" },
    { key: "pages", icon: BookOpen, label: "Sayfalar", href: "/pages", color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-l-purple-500" },
    { key: "projects", icon: FolderOpen, label: "Projeler", href: "/projects", color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-l-teal-500" },
    { key: "categories", icon: Tag, label: "Kategoriler", href: "/categories", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-l-amber-500" },
    { key: "inquiries", icon: MessageSquare, label: "Talepler", href: "/inquiries", color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-l-rose-500" },
    { key: "orders", icon: ShoppingCart, label: "Siparişler", href: "/orders", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-l-emerald-500" },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const queries = statDefinitions.map((def) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useQuery({
            queryKey: [def.key],
            queryFn: () => {
                const map: Record<string, () => any> = {
                    products: api.getProducts.bind(api),
                    articles: api.getArticles.bind(api),
                    services: api.getServices.bind(api),
                    pages: api.getPages.bind(api),
                    projects: api.getProjects.bind(api),
                    categories: api.getCategories.bind(api),
                    inquiries: api.getInquiries.bind(api),
                    orders: api.getOrders.bind(api),
                };
                return map[def.key]?.();
            },
        })
    );

    const { data: sites } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const { data: inquiriesNew } = useQuery({
        queryKey: ["inquiries", "new"],
        queryFn: () => api.getInquiries("new"),
    });

    return (
        <div>
            {/* ── Header ── */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        Hoş geldiniz, <span className="font-medium text-slate-700">{user?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(inquiriesNew?.count ?? 0) > 0 && (
                        <button
                            onClick={() => navigate("/inquiries")}
                            className="btn btn-secondary btn-sm"
                        >
                            <AlertCircle size={13} className="text-rose-500" />
                            <span className="text-rose-600">{inquiriesNew?.count} yeni talep</span>
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                        <TrendingUp size={13} />
                        <span className="font-medium">Sistem aktif</span>
                    </div>
                </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {statDefinitions.map((def, i) => (
                    <StatCard
                        key={def.key}
                        icon={def.icon}
                        label={def.label}
                        value={queries[i].data?.count ?? "—"}
                        href={def.href}
                        color={def.color}
                        bgColor={def.bgColor}
                        borderColor={def.borderColor}
                    />
                ))}
            </div>

            {/* ── Sites + quick activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Sites */}
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-800">Aktif Siteler</h2>
                            <span className="badge badge-muted">{sites?.count ?? 0}</span>
                        </div>
                        <button
                            onClick={() => navigate("/sites")}
                            className="btn btn-ghost btn-sm text-xs"
                        >
                            Tüm siteler <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {sites?.data?.map((site: any) => (
                            <div
                                key={site.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${site.is_active ? "bg-emerald-400" : "bg-slate-300"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{site.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{site.domain}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {site.has_ecommerce && (
                                        <span className="badge badge-accent">E-Ticaret</span>
                                    )}
                                    <span className="badge badge-muted">{site.slug}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick info */}
                <div className="space-y-4">
                    {/* System health */}
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Sistem Durumu</h2>
                        <div className="space-y-2.5">
                            {[
                                { label: "API Sunucusu", status: "Aktif", ok: true },
                                { label: "Veritabanı (D1)", status: "Aktif", ok: true },
                                { label: "R2 Depolama", status: "Aktif", ok: true },
                                { label: "Iyzico API", status: "Sandbox", ok: false },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">{item.label}</span>
                                    <span className={`flex items-center gap-1 font-medium ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>
                                        {item.ok
                                            ? <CheckCircle size={11} />
                                            : <Clock size={11} />
                                        }
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick create */}
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold text-slate-800 mb-3">Hızlı Oluştur</h2>
                        <div className="space-y-1.5">
                            {[
                                { label: "Yeni Ürün", href: "/products/new", icon: Package },
                                { label: "Yeni Hizmet", href: "/services/new", icon: Wrench },
                                { label: "Yeni Sayfa", href: "/pages/new", icon: BookOpen },
                                { label: "Yeni Proje", href: "/projects/new", icon: FolderOpen },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => navigate(item.href)}
                                        className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                                    >
                                        <Plus size={13} className="text-indigo-500" />
                                        <Icon size={13} className="text-slate-400" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
