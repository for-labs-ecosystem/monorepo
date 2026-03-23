import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable, { SiteLabels } from "../components/DataTable";
import { Briefcase, CheckCircle2, XCircle } from "lucide-react";

export default function ServicesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<Record<string, string | number>>({
        site_id: "all"
    });

    const { data: servicesRes, isLoading: itemsLoading } = useQuery({
        queryKey: ["services"],
        queryFn: () => api.getServices(),
    });

    const { data: sitesRes } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });

    const services = servicesRes?.data || [];
    const sites = sitesRes?.data || [];

    const filteredData = useMemo(() => {
        return services.filter((s: any) => {
            const siteMatch = filters.site_id === "all" ||
                (s.sites?.some((site: any) => String(site.id) === String(filters.site_id)));
            return siteMatch;
        });
    }, [services, filters]);

    const columns = [
        {
            key: "title",
            label: "Hizmet / Servis",
            render: (v: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
                        <Briefcase size={18} className="text-slate-400" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-[13px] leading-tight">{v}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1">{row.service_type || "Genel Hizmet"}</div>
                    </div>
                </div>
            )
        },
        {
            key: "category_name",
            label: "Kategori",
            width: "140px",
            render: (v: string) => <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">{v || "—"}</span>
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
        }
    ];

    return (
        <DataTable
            title="Hizmetler"
            description="Endüstriyel hizmetler ve teknik servis yönetimi"
            columns={columns}
            data={filteredData}
            isLoading={itemsLoading}
            onAdd={() => navigate("/services/new")}
            onEdit={(row) => navigate(`/services/${row.id}/edit`)}
            onDelete={(row) => deleteMutation.mutate(row.id)}
            addLabel="Yeni Hizmet"
            filters={filterGroups}
            activeFilters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        />
    );
}
