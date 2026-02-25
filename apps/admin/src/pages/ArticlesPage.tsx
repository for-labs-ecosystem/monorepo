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
    { key: "author", label: "Yazar", render: (v: string) => v || <span className="text-slate-300">—</span> },
    {
        key: "excerpt", label: "Özet", render: (v: string) => (
            <span className="text-slate-500 text-xs line-clamp-1">{v || "—"}</span>
        )
    },
];

export default function ArticlesPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({ queryKey: ["articles"], queryFn: () => api.getArticles() });
    return (
        <DataTable
            title="Makaleler"
            description="Blog ve bilgi bankası içerikleri"
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onAdd={() => navigate("/articles/new")}
            onEdit={(row) => navigate(`/articles/${row.id}/edit`)}
            addLabel="Yeni Makale"
        />
    );
}
