import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable, { SiteLabels } from "../components/DataTable";
import { Image as ImageIcon, Star, CheckCircle2, XCircle } from "lucide-react";

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, string | number>>({
        site_id: "all"
    });

    const { data: itemsRes, isLoading: itemsLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: () => api.getProjects(),
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const projects = itemsRes?.data || [];
    const sites = sitesRes?.data || [];

    const filteredData = useMemo(() => {
        return projects.filter((p: any) => {
            const siteMatch = filters.site_id === "all" ||
                (p.sites?.some((s: any) => String(s.id) === String(filters.site_id)));
            return siteMatch;
        });
    }, [projects, filters]);

    const columns = [
        {
            key: "title",
            label: "Proje Başlığı",
            render: (v: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                        {row.cover_image_url ? (
                            <img src={row.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={14} className="text-slate-300" />
                        )}
                    </div>
                    <div className="font-bold text-slate-800 text-[13px] leading-tight">{v}</div>
                </div>
            )
        },
        {
            key: "sites",
            label: "Yayında Olan Siteler",
            render: (v: any) => <SiteLabels sites={v} />
        },
        {
            key: "is_featured",
            label: "Öne Çıkan",
            width: "100px",
            render: (v: any) =>
                v ? (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] uppercase">
                        <Star size={10} className="fill-current" /> Vitrin
                    </div>
                ) : (
                    <span className="text-slate-200">—</span>
                ),
        },
        {
            key: "is_active",
            label: "Durum",
            width: "80px",
            render: (v: any) => v ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-200" />
        }
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
            title="Projeler"
            description="Vaka analizleri ve uygulama referansları"
            columns={columns}
            data={filteredData}
            isLoading={itemsLoading}
            onAdd={() => navigate("/projects/new")}
            onEdit={(row) => navigate(`/projects/${row.id}/edit`)}
            addLabel="Yeni Proje"
            filters={filterGroups}
            activeFilters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        />
    );
}
