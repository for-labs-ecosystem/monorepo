import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, resolveMediaUrl } from "../lib/api";
import DataTable, { SiteLabels } from "../components/DataTable";
import { Star, FileText, CheckCircle2, XCircle } from "lucide-react";

export default function ArticlesPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<Record<string, string | number>>({
        site_id: "all",
        category_id: "all"
    });

    const { data: articlesRes, isLoading: itemsLoading } = useQuery({
        queryKey: ["articles"],
        queryFn: () => api.getArticles(),
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const { data: categoriesRes } = useQuery({
        queryKey: ["article-categories"],
        queryFn: () => api.getCategories(), // Reusing categories API, might need a type filter if handled on backend
    });

    const articles = articlesRes?.data || [];
    const sites = sitesRes?.data || [];
    const categories = categoriesRes?.data || [];

    // Local filtering
    const filteredData = useMemo(() => {
        return articles.filter((a: any) => {
            const siteMatch = filters.site_id === "all" ||
                (a.sites?.some((s: any) => String(s.id) === String(filters.site_id)));
            const catMatch = filters.category_id === "all" || String(a.category_id) === String(filters.category_id);
            return siteMatch && catMatch;
        });
    }, [articles, filters]);

    const columns = [
        {
            key: "title",
            label: "Makale Başlığı",
            render: (v: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 shrink-0 flex items-center justify-center overflow-hidden">
                        {row.cover_image_url ? (
                            <img src={resolveMediaUrl(row.cover_image_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <FileText size={18} className="text-indigo-300" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-800 text-[13px] leading-tight">{v}</div>
                            {row.is_featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-medium">{row.author || "Editör Ekibi"}</div>
                    </div>
                </div>
            )
        },
        {
            key: "category_name",
            label: "Kategori",
            width: "140px",
            render: (v: string) => <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">{v || "Blog"}</span>
        },
        {
            key: "sites",
            label: "Yayında Olan Siteler",
            render: (v: any) => <SiteLabels sites={v} />
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
        },
        {
            key: "category_id",
            label: "Kategori",
            pluralLabel: "Kategoriler",
            options: categories.map((c: any) => ({ label: c.name, value: String(c.id) }))
        }
    ];

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const buildArticlePath = (basePath: string) => {
        const activeSiteId = filters.site_id !== "all" ? String(filters.site_id) : "";
        return activeSiteId ? `${basePath}?site_id=${activeSiteId}` : basePath;
    };

    return (
        <DataTable
            title="Makaleler"
            description="Blog içerikleri ve bilgi bankası makaleleri"
            columns={columns}
            data={filteredData}
            isLoading={itemsLoading}
            onAdd={() => navigate(buildArticlePath("/articles/new"))}
            onEdit={(row) => navigate(buildArticlePath(`/articles/${row.id}/edit`))}
            addLabel="Yeni Makale"
            filters={filterGroups}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
        />
    );
}
