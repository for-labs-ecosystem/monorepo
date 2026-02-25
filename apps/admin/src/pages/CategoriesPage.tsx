import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";

const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Kategori" },
    {
        key: "slug", label: "Slug", render: (v: string) => (
            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v}</code>
        )
    },
    { key: "sort_order", label: "Sıra", width: "80px" },
];

export default function CategoriesPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: () => api.getCategories() });
    return (
        <DataTable
            title="Kategoriler"
            description="Ürün ve içerik kategorileri"
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onAdd={() => navigate("/categories/new")}
            onEdit={(row) => navigate(`/categories/${row.id}/edit`)}
            addLabel="Yeni Kategori"
        />
    );
}
