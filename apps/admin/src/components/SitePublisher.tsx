import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Globe, Loader2, ChevronDown, ChevronRight, Star, Menu, DollarSign } from "lucide-react";

export interface SiteVisibility {
    siteId: number;
    siteName: string;
    domain: string;
    isVisible: boolean;
    is_featured?: boolean;
    hide_price?: boolean;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    // Navigation placement fields
    nav_location?: "header" | "footer" | "hidden";
    nav_parent_id?: number | null;
    nav_sort_order?: number;
}

interface SitePublisherProps {
    visibilityState: SiteVisibility[];
    onChange: React.Dispatch<React.SetStateAction<SiteVisibility[]>>;
    saving?: boolean;
    showNavPlacement?: boolean;
}

export default function SitePublisher({
    visibilityState,
    onChange,
    saving,
    showNavPlacement = false,
}: SitePublisherProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    // Fetch all nav items for parent-node selectors
    const { data: allNavsRes } = useQuery({
        queryKey: ["navigations-all"],
        queryFn: () => api.getNavigations(),
        enabled: showNavPlacement,
    });
    const allNavItems = allNavsRes?.data || [];

    // Initialize visibility state if empty
    useEffect(() => {
        if (data?.data && visibilityState.length === 0) {
            const initial = data.data.map((site: any) => ({
                siteId: site.id,
                siteName: site.name,
                domain: site.domain,
                isVisible: false, // Default is not selected for new elements
                is_featured: false,
                hide_price: false,
                meta_title: "",
                meta_description: "",
                canonical_url: "",
                nav_location: "hidden" as const,
                nav_parent_id: null,
                nav_sort_order: 0,
            }));
            onChange(initial);
        }
    }, [data, visibilityState.length, onChange]);

    if (isLoading) {
        return (
            <div className="p-4 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-xs">Siteler Yükleniyor...</span>
            </div>
        );
    }

    const sites = data?.data || [];
    if (sites.length === 0) {
        return <div className="text-sm text-slate-500">Site bulunamadı.</div>;
    }

    const toggleSite = (siteId: number) => {
        onChange(prev => prev.map(s => s.siteId === siteId ? { ...s, isVisible: !s.isVisible } : s));
    };

    const toggleFeatured = (siteId: number) => {
        onChange(prev => prev.map(s => s.siteId === siteId ? { ...s, is_featured: !s.is_featured } : s));
    };

    const toggleHidePrice = (siteId: number) => {
        onChange(prev => prev.map(s => s.siteId === siteId ? { ...s, hide_price: !s.hide_price } : s));
    };

    const updateField = (siteId: number, field: keyof SiteVisibility, value: string | number | null) => {
        onChange(prev => prev.map(s => s.siteId === siteId ? { ...s, [field]: value } : s));
    };

    return (
        <div className="space-y-3">
            {visibilityState.map(sv => (
                <SiteCard
                    key={sv.siteId}
                    sv={sv}
                    onToggle={() => toggleSite(sv.siteId)}
                    onToggleFeatured={() => toggleFeatured(sv.siteId)}
                    onToggleHidePrice={() => toggleHidePrice(sv.siteId)}
                    onUpdate={(field, val) => updateField(sv.siteId, field, val)}
                    disabled={saving}
                    showNavPlacement={showNavPlacement}
                    navItems={allNavItems.filter((n: any) => n.site_id === sv.siteId)}
                />
            ))}
        </div>
    );
}

function SiteCard({
    sv,
    onToggle,
    onToggleFeatured,
    onToggleHidePrice,
    onUpdate,
    disabled,
    showNavPlacement = false,
    navItems = [],
}: {
    sv: SiteVisibility;
    onToggle: () => void;
    onToggleFeatured: () => void;
    onToggleHidePrice: () => void;
    onUpdate: (field: keyof SiteVisibility, val: any) => void;
    disabled?: boolean;
    showNavPlacement?: boolean;
    navItems?: any[];
}) {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${sv.isVisible ? 'border-indigo-200 bg-white ring-1 ring-indigo-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/50 opacity-80 hover:opacity-100'}`}>
            <div
                className="flex items-center justify-between p-3"
            >
                {/* Clicking anywhere on the left part expands/collapses the SEO panel */}
                <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => setExpanded(!expanded)}
                >
                    <button
                        type="button"
                        title="SEO Ayarlarını Aç/Kapat"
                        className={`p-1 rounded-md transition-colors shrink-0 ${expanded ? 'bg-indigo-50 text-indigo-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <div>
                        <div className={`text-[13px] font-medium transition-colors flex items-center gap-2 ${sv.isVisible ? 'text-indigo-900' : 'text-slate-600'}`}>
                            <Globe size={13} className={sv.isVisible ? 'text-indigo-400' : 'text-slate-400'} />
                            {sv.siteName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono tracking-tight">{sv.domain}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Featured star toggle */}
                    {sv.isVisible && (
                        <button
                            type="button"
                            title={sv.is_featured ? "Öne çıkarmayı kaldır" : "Bu sitede öne çıkar"}
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFeatured();
                            }}
                            className={`p-1 rounded-md transition-colors ${sv.is_featured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50/50'}`}
                        >
                            <Star size={14} fill={sv.is_featured ? 'currentColor' : 'none'} />
                        </button>
                    )}
                    {/* Hide price toggle */}
                    {sv.isVisible && (
                        <button
                            type="button"
                            title={sv.hide_price ? "Fiyatı göster" : "Fiyatı gizle"}
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleHidePrice();
                            }}
                            className={`p-1 rounded-md transition-colors ${sv.hide_price ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50/50'}`}
                        >
                            <DollarSign size={14} />
                        </button>
                    )}
                    {/* Visibility toggle switch */}
                    <div
                        onClick={(e) => {
                            if (disabled) return;
                            e.stopPropagation();
                            onToggle();
                        }}
                        className={`relative w-9.5 h-5 rounded-full transition-colors cursor-pointer ${sv.isVisible ? "bg-indigo-500" : "bg-slate-200"}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sv.isVisible ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                </div>
            </div>

            {/* Navigation Placement Panel — shown when site is active */}
            {showNavPlacement && sv.isVisible && (
                <div className="px-4 pb-3 pt-3 border-t border-indigo-100/60 space-y-2.5 bg-indigo-50/20">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Menu size={10} /> Menü Konumu
                        <div className="h-px bg-indigo-100 flex-1"></div>
                    </div>
                    <NavPlacementSelector
                        location={sv.nav_location || "hidden"}
                        parentId={sv.nav_parent_id ?? null}
                        sortOrder={sv.nav_sort_order ?? 0}
                        onLocationChange={(loc) => onUpdate("nav_location", loc)}
                        onParentChange={(pid) => onUpdate("nav_parent_id", pid)}
                        onSortOrderChange={(s) => onUpdate("nav_sort_order", s)}
                        navItems={navItems}
                        disabled={disabled}
                        siteId={sv.siteId}
                    />
                </div>
            )}

            {/* Expandable SEO panel */}
            {expanded && (
                <div className="px-4 pb-4 pt-3 border-t border-slate-100/80 space-y-3 bg-slate-50/30">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        SEO Ayarları
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5 ml-0.5">Özel Meta Başlık</label>
                        <input
                            type="text"
                            disabled={disabled}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white shadow-sm"
                            value={sv.meta_title || ''}
                            onChange={(e) => onUpdate('meta_title', e.target.value)}
                            placeholder="Otomatik kullan..."
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5 ml-0.5">Özel Meta Açıklama</label>
                        <textarea
                            disabled={disabled}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 min-h-15 resize-none bg-white shadow-sm"
                            value={sv.meta_description || ''}
                            onChange={(e) => onUpdate('meta_description', e.target.value)}
                            placeholder="Otomatik kullan..."
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5 ml-0.5">Özel Canonical URL</label>
                        <input
                            type="text"
                            disabled={disabled}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono bg-white shadow-sm"
                            value={sv.canonical_url || ''}
                            onChange={(e) => onUpdate('canonical_url', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Navigation Placement Selector
 * 3 options: header | footer | hidden (gizli link — published but not in any menu)
 * Includes tree-aware parent selector and sort order input.
 */
function NavPlacementSelector({
    location,
    parentId,
    sortOrder,
    onLocationChange,
    onParentChange,
    onSortOrderChange,
    navItems,
    disabled,
    siteId,
}: {
    location: string;
    parentId: number | null;
    sortOrder: number;
    onLocationChange: (loc: "header" | "footer" | "hidden") => void;
    onParentChange: (pid: number | null) => void;
    onSortOrderChange: (s: number) => void;
    navItems: Array<{ id: number; name: string; location: string; parent_id: number | null; sort_order: number }>;
    disabled?: boolean;
    siteId?: number;
}) {
    const options: Array<{ value: "header" | "footer" | "hidden"; label: string; hint: string }> = [
        { value: "header", label: "Üst Menü (Header)", hint: "Ana navigasyon çubuğunda görünür" },
        { value: "footer", label: "Alt Menü (Footer)", hint: "Footer bölümünde görünür" },
        { value: "hidden", label: "Gizli Link", hint: "Sitede yayında ama hiçbir menüde görünmez (landing page)" },
    ];

    // Build a flat tree list with depth prefix for the dropdown
    // Roots first, then their children (depth = 1)
    const sameLocItems = navItems.filter((n) => n.location === location);
    const roots = sameLocItems.filter((n) => n.parent_id === null).sort((a, b) => a.sort_order - b.sort_order);
    const treeItems: Array<{ id: number; label: string; depth: number }> = [];
    for (const root of roots) {
        treeItems.push({ id: root.id, label: root.name, depth: 0 });
        const children = sameLocItems
            .filter((n) => n.parent_id === root.id)
            .sort((a, b) => a.sort_order - b.sort_order);
        for (const child of children) {
            treeItems.push({ id: child.id, label: child.name, depth: 1 });
        }
    }

    const showPositioning = location === "header" || location === "footer";

    return (
        <div className="space-y-1.5">
            {/* Location radio options */}
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                        location === opt.value
                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <input
                        type="radio"
                        name={`nav-placement-${siteId}`}
                        value={opt.value}
                        checked={location === opt.value}
                        onChange={() => {
                            onLocationChange(opt.value);
                            onParentChange(null);
                        }}
                        disabled={disabled}
                        className="mt-0.5 accent-indigo-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-bold leading-tight ${location === opt.value ? "text-indigo-700" : "text-slate-600"}`}>
                            {opt.label}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.hint}</div>
                    </div>
                </label>
            ))}

            {/* Position controls — shown for header & footer */}
            {showPositioning && (
                <div className="mt-2 pt-2.5 border-t border-indigo-100/80 space-y-2.5">
                    {/* Parent node selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">
                            {location === "header" ? "Üst Menü Kırılımı" : "Footer Sütunu"}
                        </label>
                        <select
                            value={parentId ?? ""}
                            onChange={(e) => onParentChange(e.target.value ? Number(e.target.value) : null)}
                            disabled={disabled}
                            className="w-full text-[11px] px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
                        >
                            <option value="">
                                {location === "header" ? "— Kök Seviye (Ana Menü Öğesi)" : "— Kök Seviye (Footer Ana Başlık)"}
                            </option>
                            {treeItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.depth === 1 ? "  └─ " : ""}{item.label}
                                </option>
                            ))}
                        </select>
                        {treeItems.length === 0 && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">
                                Bu sitede henüz menü öğesi yok. Sayfa kök seviyeye eklenecek.
                            </p>
                        )}
                    </div>

                    {/* Sort order */}
                    <div>
                        <label className="block text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">
                            Sıralama
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={sortOrder}
                            onChange={(e) => onSortOrderChange(Number(e.target.value))}
                            disabled={disabled}
                            className="w-full text-[11px] px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700"
                            placeholder="0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
