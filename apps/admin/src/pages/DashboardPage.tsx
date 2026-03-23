import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import {
    Globe, Package, FileText, Wrench, BookOpen, FolderKanban,
    Plus, ArrowRight, ExternalLink, InboxIcon, Loader2,
    ShoppingCart, Settings, Layers, Bell, ChevronDown, Search, Check,
    Star, Pencil,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6) return "İyi geceler";
    if (h < 12) return "Günaydın";
    if (h < 18) return "İyi günler";
    return "İyi akşamlar";
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ─── Rich Site Selector ───────────────────────────────────────────────────────
function RichSiteSelector({
    sites,
    selected,
    onChange,
}: {
    sites: any[];
    selected: any | null;
    onChange: (site: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Panel position: computed from trigger rect, rendered via portal (no z-index hell)
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

    const calcPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPanelStyle({
            position: "fixed",
            top: rect.bottom + 6,
            left: rect.left,
            width: Math.max(rect.width, 320),
            zIndex: 9999,
        });
    }, []);

    const openPanel = () => {
        calcPosition();
        setOpen(true);
        setQuery("");
        setTimeout(() => searchRef.current?.focus(), 60);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", handler);
        // Recalc on scroll/resize
        window.addEventListener("scroll", calcPosition, true);
        window.addEventListener("resize", calcPosition);
        return () => {
            window.removeEventListener("mousedown", handler);
            window.removeEventListener("scroll", calcPosition, true);
            window.removeEventListener("resize", calcPosition);
        };
    }, [open, calcPosition]);

    const filtered = useMemo(() => {
        if (!query) return sites;
        const q = query.toLowerCase();
        return sites.filter(
            (s) =>
                s.name?.toLowerCase().includes(q) ||
                s.domain?.toLowerCase().includes(q)
        );
    }, [sites, query]);

    const active = filtered.filter((s) => s.is_active);
    const passive = filtered.filter((s) => !s.is_active);

    const SiteRow = ({ site }: { site: any }) => {
        const isSelected = selected?.id === site.id;
        return (
            <button
                onClick={() => { onChange(site); setOpen(false); setQuery(""); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
            >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${site.is_active ? "bg-emerald-400" : "bg-slate-300"
                    }`} />

                {/* Name + domain */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-semibold truncate ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                            {site.name}
                        </span>
                        {site.has_ecommerce && (
                            <span className="flex items-center gap-0.5 text-[10px] text-indigo-400 bg-indigo-50 rounded px-1.5 py-0.5 font-medium shrink-0">
                                <ShoppingCart size={8} /> E-Ticaret
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{site.domain}</p>
                </div>

                {/* Module count */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Layers size={9} />
                    <span>{
                        (() => {
                            try {
                                const m = site.enabled_modules;
                                if (!m) return 5;
                                return (typeof m === "string" ? JSON.parse(m) : m).length;
                            } catch { return 5; }
                        })()
                    } mod</span>
                </div>

                {/* Selected checkmark */}
                {isSelected && <Check size={13} className="text-indigo-500 shrink-0" />}
            </button>
        );
    };

    return (
        <>
            {/* ── Trigger ── */}
            <button
                ref={triggerRef}
                onClick={open ? () => setOpen(false) : openPanel}
                className={`
                    flex items-center gap-2.5 pl-3 pr-2.5 py-2
                    bg-white/90 border rounded-xl shadow-sm
                    transition-all min-w-55 max-w-75
                    ${open
                        ? "border-indigo-400 ring-2 ring-indigo-400/20"
                        : "border-slate-200 hover:border-indigo-300 hover:shadow"
                    }
                `}
            >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${selected?.is_active ? "bg-emerald-400" : "bg-slate-300"}`} />

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
                        {selected?.name ?? "Site seçin"}
                    </p>
                    {selected && (
                        <p className="text-[10px] text-slate-400 leading-none truncate mt-0.5">
                            {selected.domain}
                        </p>
                    )}
                </div>

                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* ── Panel (portal → no z-index issues) ── */}
            {open && createPortal(
                <div
                    ref={panelRef}
                    style={panelStyle}
                    className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Search */}
                    <div className="px-3 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Site ara..."
                                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="overflow-y-auto max-h-72">
                        {filtered.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Sonuç bulunamadı</p>
                        ) : (
                            <>
                                {active.length > 0 && (
                                    <>
                                        <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-100">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                Aktif siteler ({active.length})
                                            </p>
                                        </div>
                                        {active.map((site) => <SiteRow key={site.id} site={site} />)}
                                    </>
                                )}
                                {passive.length > 0 && (
                                    <>
                                        <div className="px-4 py-1.5 bg-slate-50/80 border-t border-b border-slate-100">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                Pasif siteler ({passive.length})
                                            </p>
                                        </div>
                                        {passive.map((site) => <SiteRow key={site.id} site={site} />)}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{sites.length} site toplam</span>
                        <button
                            onClick={() => { setOpen(false); }}
                            className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium"
                        >
                            Kapat
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// ─── Content Table ────────────────────────────────────────────────────────────
const ALL_TABS = [
    { key: "products", label: "Ürünler", icon: Package, cols: ["ID", "Başlık", "Slug", "Fiyat"] },
    { key: "articles", label: "Makaleler", icon: FileText, cols: ["ID", "Başlık", "Slug", "Yazar"] },
    { key: "services", label: "Hizmetler", icon: Wrench, cols: ["ID", "Başlık", "Slug"] },
    { key: "pages", label: "Sayfalar", icon: BookOpen, cols: ["ID", "Başlık", "Slug"] },
    { key: "projects", label: "Projeler", icon: FolderKanban, cols: ["ID", "Başlık", "Slug"] },
] as const;

type TabKey = typeof ALL_TABS[number]["key"];

function parseSiteModules(site: any): string[] | null {
    if (!site?.enabled_modules) return null;
    try {
        const raw = site.enabled_modules;
        return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
        return null;
    }
}

function formatPrice(price?: number | string, currency = "TRY") {
    if (!price) return null;
    const p = typeof price === "string" ? parseFloat(price) : price;
    const symbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
    return `${symbol}${p.toLocaleString("tr-TR")}`;
}

function DashboardProductRow({
    product,
    isLast,
    onEdit,
}: {
    product: any;
    isLast: boolean;
    onEdit: () => void;
}) {
    const price = formatPrice(product.price, product.currency);
    const comparePrice = formatPrice(product.compare_price, product.currency);
    const isFeatured = !!product.is_featured;

    return (
        <div
            className={`group flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors duration-100 ${!isLast ? "border-b border-slate-100" : ""
                }`}
        >
            {/* Thumbnail */}
            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-slate-300"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`; }}
                    />
                ) : (
                    <Package size={16} className="text-slate-300" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-800 text-[13px] leading-tight truncate">
                        {product.title}
                    </span>
                    {isFeatured && (
                        <Star size={10} className="shrink-0 text-amber-400 fill-amber-400" />
                    )}
                    {product.campaign_label && (
                        <span className="shrink-0 text-[9px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            {product.campaign_label}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {product.brand && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {product.brand}
                        </span>
                    )}
                    {product.brand && product.sites?.length > 0 && (
                        <span className="text-slate-200 text-xs select-none">·</span>
                    )}
                    {product.sites?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Globe size={10} className="text-slate-300 shrink-0" />
                            {product.sites.map((site: any, i: number) => (
                                <span key={site.id} className="text-[10px] text-slate-400">
                                    {site.name}{i < product.sites.length - 1 ? "," : ""}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="shrink-0 text-right min-w-20">
                {price ? (
                    <>
                        <div className="font-semibold text-slate-800 text-sm tabular-nums">{price}</div>
                        {comparePrice && (
                            <div className="text-[10px] text-slate-300 line-through tabular-nums">{comparePrice}</div>
                        )}
                    </>
                ) : (
                    <span className="text-xs text-slate-300">—</span>
                )}
            </div>

            {/* Action */}
            <div className="shrink-0">
                <button
                    onClick={onEdit}
                    className="btn btn-ghost btn-sm group"
                >
                    <Pencil size={12} />
                    <span className="text-xs">Düzenle</span>
                </button>
            </div>
        </div>
    );
}

function SiteContentTable({
    siteId,
    tab,
    onNavigate,
}: {
    siteId: number;
    tab: TabKey;
    onNavigate: (path: string) => void;
}) {
    const fetchers: Record<string, () => any> = {
        products: () => api.getProducts(siteId),
        articles: () => api.getArticles(siteId),
        services: () => api.getServices({ site_id: siteId }),
        pages: () => api.getPages(siteId),
        projects: () => api.getProjects(siteId),
    };

    const { data, isLoading } = useQuery({
        queryKey: [tab, "by-site", siteId],
        queryFn: fetchers[tab],
        staleTime: 20_000,
    });

    const rawItems: any[] = data?.data || [];
    const items = rawItems.filter((item: any) =>
        item.sites?.some((s: any) => s.id === siteId)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-indigo-400" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-10">
                <InboxIcon size={28} strokeWidth={1} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Bu sitede henüz {ALL_TABS.find(t => t.key === tab)?.label.toLowerCase()} yok</p>
                <button onClick={() => onNavigate(`/${tab}/new`)} className="btn btn-secondary btn-sm mt-3">
                    <Plus size={13} /> İlk içeriği ekle
                </button>
            </div>
        );
    }

    if (tab === "products") {
        return (
            <div className="bg-white">
                {items.map((item, idx) => (
                    <DashboardProductRow
                        key={item.id}
                        product={item}
                        isLast={idx === items.length - 1}
                        onEdit={() => onNavigate(`/${tab}/${item.id}/edit`)}
                    />
                ))}
            </div>
        );
    }

    // fallback to original table for other content types
    const renderCell = (item: any, col: string) => {
        if (col === "ID") return <span className="text-xs text-slate-400 font-mono">#{item.id}</span>;
        if (col === "Başlık") return <span className="font-medium text-slate-800 text-sm">{item.title ?? item.name ?? "—"}</span>;
        if (col === "Slug") return <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{item.slug ?? "—"}</code>;
        if (col === "Fiyat") return item.price
            ? <span className="text-sm font-semibold text-slate-800">₺{item.price.toLocaleString("tr-TR")}</span>
            : <span className="text-slate-300">—</span>;
        if (col === "Yazar") return <span className="text-sm text-slate-500">{item.author ?? "—"}</span>;
        return <span className="text-slate-400">—</span>;
    };

    const cols = ALL_TABS.find(t => t.key === tab)?.cols ?? [];

    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        {cols.map((c) => <th key={c}>{c}</th>)}
                        <th className="text-right pr-4">İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            {cols.map((col) => (
                                <td key={col}>{renderCell(item, col)}</td>
                            ))}
                            <td className="text-right pr-3">
                                <button
                                    onClick={() => onNavigate(`/${tab}/${item.id}/edit`)}
                                    className="btn btn-ghost btn-sm group"
                                >
                                    <Pencil size={12} />
                                    <span className="text-xs">Düzenle</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("products");

    const { data: sitesData, isLoading: sitesLoading } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
        staleTime: 60_000,
    });

    const sites: any[] = sitesData?.data ?? [];

    const [selectedSite, setSelectedSite] = useState<any | null>(() => {
        try {
            const saved = localStorage.getItem("dashboard_selected_site_id");
            return saved ? { id: Number(saved) } : null;
        } catch { return null; }
    });

    const currentSite = (selectedSite?.id ? sites.find((s) => s.id === selectedSite.id) : null) ?? sites[0] ?? null;

    const handleSiteChange = (site: any) => {
        setSelectedSite(site);
        try { localStorage.setItem("dashboard_selected_site_id", String(site.id)); } catch {}
    };

    const siteModules = parseSiteModules(currentSite);
    const visibleTabs = useMemo(() => {
        if (!siteModules) return ALL_TABS;
        return ALL_TABS.filter((t) => siteModules.includes(t.key));
    }, [siteModules]);

    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.key === activeTab)) {
            setActiveTab(visibleTabs[0].key);
        }
    }, [visibleTabs, activeTab]);

    const { data: inquiriesNew } = useQuery({
        queryKey: ["inquiries", "new"],
        queryFn: () => api.getInquiries({ status: "new" }),
    });

    const newInquiryCount = inquiriesNew?.count ?? 0;
    const moduleCount = siteModules?.length ?? ALL_TABS.length;

    return (
        <div>
            {/* ══════════════════════════════════════════════════════════════
                COMMAND CENTER BANNER
            ══════════════════════════════════════════════════════════════ */}
            <div className="relative mb-5 rounded-2xl overflow-visible bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900">
                {/* Decorative layers — pointer-events:none so they don't block clicks */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zm40 0V0h1' stroke='%23fff' stroke-width='.5'/%3E%3Cpath d='M0 0h40v1H0zm0 40h40' stroke='%23fff' stroke-width='.5'/%3E%3C/svg%3E")`,
                    }} />
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative px-6 py-5 flex flex-col gap-4">

                    {/* ── Row 1: Greeting + actions ── */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-white leading-tight">
                                {getGreeting()},{" "}
                                <span className="text-indigo-300">{user?.role === 'admin' || user?.role === 'super_admin' ? 'Super Admin' : user?.name?.split(" ")[0]}</span>
                            </h1>
                            <p className="text-[13px] text-slate-400 mt-0.5">{getFormattedDate()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {newInquiryCount > 0 && (
                                <button
                                    onClick={() => navigate("/inquiries")}
                                    className="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Bell size={12} />
                                    {newInquiryCount} yeni talep
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/sites")}
                                className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Tüm siteler <ArrowRight size={11} />
                            </button>
                        </div>
                    </div>

                    {/* ── Row 2: Site selector + meta ── */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Label + selector */}
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                                Hangi siteyi yönetmek istiyorsunuz?
                            </p>
                            {sitesLoading ? (
                                <div className="h-10 w-56 bg-white/10 animate-pulse rounded-xl" />
                            ) : (
                                <RichSiteSelector
                                    sites={sites}
                                    selected={currentSite}
                                    onChange={handleSiteChange}
                                />
                            )}
                        </div>

                        {/* Meta chips */}
                        {currentSite && (
                            <div className="hidden sm:flex items-center gap-2 mt-5">
                                <a
                                    href={`https://${currentSite.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors bg-white/5 rounded-md px-2 py-1"
                                >
                                    <ExternalLink size={9} />
                                    {currentSite.domain}
                                </a>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 rounded-md px-2 py-1">
                                    <Layers size={9} />
                                    {moduleCount} modül
                                </span>
                                {currentSite.has_ecommerce && (
                                    <span className="flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-500/10 rounded-md px-2 py-1">
                                        <ShoppingCart size={9} /> E-Ticaret
                                    </span>
                                )}
                                {!currentSite.is_active && (
                                    <span className="text-[11px] text-amber-400 bg-amber-400/10 rounded-md px-2 py-1">
                                        Pasif
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Spacer + settings */}
                        {currentSite && (
                            <div className="ml-auto mt-5 shrink-0">
                                <button
                                    onClick={() => navigate(`/sites/${currentSite.slug}`)}
                                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors"
                                >
                                    <Settings size={11} />
                                    Site ayarları
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Site-Centric Content Tabs ── */}
            {currentSite ? (
                <div className="card overflow-hidden">
                    <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-4">
                        {visibleTabs.length === 0 ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                                Bu site için içerik modülü tanımlanmamış.
                                <button
                                    onClick={() => navigate(`/sites/${currentSite.slug}`)}
                                    className="text-indigo-500 hover:text-indigo-700 underline"
                                >
                                    Ayarla
                                </button>
                            </div>
                        ) : (
                            <>
                                {visibleTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${isActive
                                                ? "border-indigo-500 text-indigo-600"
                                                : "border-transparent text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            <Icon size={14} strokeWidth={isActive ? 2 : 1.75} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                                <div className="ml-auto">
                                    <button
                                        onClick={() => navigate(`/${activeTab}/new`)}
                                        className="btn btn-primary btn-sm my-2"
                                    >
                                        <Plus size={13} />
                                        Yeni {ALL_TABS.find((t) => t.key === activeTab)?.label.replace("ler", "").replace("lar", "").trim()}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-0">
                        <SiteContentTable
                            siteId={currentSite.id}
                            tab={activeTab as TabKey}
                            onNavigate={navigate}
                        />
                    </div>
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <Globe size={32} strokeWidth={1} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Henüz site kaydı yok</p>
                    <button
                        onClick={() => navigate("/sites")}
                        className="btn btn-primary btn-sm mt-4 mx-auto"
                    >
                        <Plus size={13} /> Site Ekle
                    </button>
                </div>
            )}
        </div>
    );
}
