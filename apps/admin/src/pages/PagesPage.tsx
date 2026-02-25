import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";

const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "title", label: "Başlık" },
    {
        key: "slug", label: "Slug", render: (v: string) => (
            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v}</code>
        )
    },
    {
        key: "page_type", label: "Tür", render: (v: string) => (
            <span className="badge badge-muted capitalize">{v || "—"}</span>
        )
    },
];

export default function PagesPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({ queryKey: ["pages"], queryFn: () => api.getPages() });
    return (
        <DataTable
            title="Sayfalar"
            description="Dinamik CMS sayfaları"
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onAdd={() => navigate("/pages/new")}
            onEdit={(row) => navigate(`/pages/${row.id}/edit`)}
            addLabel="Yeni Sayfa"
        />
    );
}
