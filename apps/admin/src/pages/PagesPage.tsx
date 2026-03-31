import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import { FileCode, Globe, CheckCircle2, ExternalLink } from "lucide-react";

const SITE_URLS: Record<string, string> = {
    forlabs: "https://forlabs-web.pages.dev",
    atagotr: "https://forlabs-atagotr.pages.dev",
};

function getSiteUrl(siteSlug: string, pageSlug: string): string {
    const base = SITE_URLS[siteSlug] || `https://${siteSlug}.com`;
    return `${base}/${pageSlug}`;
}

export default function PagesPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, string | number>>({
        site_id: "all"
    });

    const { data: itemsRes, isLoading: itemsLoading } = useQuery({
        queryKey: ["pages"],
        queryFn: () => api.getPages(),
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const items = itemsRes?.data || [];
    const sites = sitesRes?.data || [];

    const filteredData = useMemo(() => {
        return items.filter((p: any) => {
            const siteMatch = filters.site_id === "all" ||
                (p.sites?.some((s: any) => String(s.id) === String(filters.site_id)));
            return siteMatch;
        });
    }, [items, filters]);

    const columns = [
        {
            key: "title",
            label: "Sayfa Bilgisi",
            render: (v: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                        <FileCode size={18} className="text-slate-400" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-[13px] leading-tight">{v}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">/{row.slug}</div>
                    </div>
                </div>
            )
        },
        {
            key: "sites",
            label: "Yayın & Menü Konumu",
            render: (_v: any, row: any) => <NavBadges sites={row.sites} navigations={row.navigations} />
        },
        {
            key: "is_active",
            label: "Durum",
            width: "100px",
            render: (v: any) =>
                v ? (
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] px-2 py-1 bg-emerald-50 rounded-lg uppercase tracking-tighter">
                        <CheckCircle2 size={12} /> Yayında
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] px-2 py-1 bg-slate-50 rounded-lg uppercase tracking-tighter">
                        Taslak
                    </div>
                ),
        },
        {
            key: "slug",
            label: "",
            width: "40px",
            render: (_v: any, row: any) => {
                const site = row.sites?.[0];
                if (!site) return null;
                const url = getSiteUrl(site.slug || site.domain, row.slug);
                return (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Sayfayı yeni sekmede aç"
                    >
                        <ExternalLink size={14} />
                    </a>
                );
            },
        },
    ];

    const filterGroups = [
        {
            key: "site_id",
            label: "Site",
            pluralLabel: "Siteler",
            options: sites.map((s: any) => ({ label: s.name, value: String(s.id) }))
        }
    ];

    return (
        <DataTable
            title="Dinamik Sayfalar"
            description="Sabit içerikler, kurumsal sayfalar ve KVKK metinleri"
            columns={columns}
            data={filteredData}
            isLoading={itemsLoading}
            onAdd={() => navigate("/pages/new")}
            onEdit={(row) => navigate(`/pages/${row.id}/edit`)}
            addLabel="Yeni Sayfa"
            filters={filterGroups}
            activeFilters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        />
    );
}

const LOC_LABELS: Record<string, { label: string; color: string }> = {
    header: { label: "Header", color: "text-sky-600 bg-sky-50 border-sky-100" },
    footer: { label: "Footer", color: "text-amber-600 bg-amber-50 border-amber-100" },
    hidden: { label: "Gizli Link", color: "text-slate-500 bg-slate-50 border-slate-200" },
};

function NavBadges({ sites, navigations }: { sites?: any[]; navigations?: any[] }) {
    if (!sites || sites.length === 0) {
        return <span className="text-[10px] text-slate-300 italic">Hiçbir sitede yok</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {sites.map((s: any) => {
                const nav = navigations?.find((n: any) => n.site_id === s.id);
                const loc = nav ? LOC_LABELS[nav.location] : null;
                const parentLabel = nav?.parent_name ? ` > ${nav.parent_name}` : "";

                return (
                    <div
                        key={s.id}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tight bg-indigo-50/60 border-indigo-100/50 text-indigo-600"
                    >
                        <Globe size={9} className="text-indigo-400 shrink-0" />
                        <span>{s.name}</span>
                        {loc && (
                            <span className={`ml-0.5 px-1 py-px rounded text-[8px] border ${loc.color}`}>
                                {loc.label}{parentLabel}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
