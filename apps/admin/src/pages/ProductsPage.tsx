import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import { ShoppingCart, Star } from "lucide-react";

const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "title", label: "Başlık" },
    {
        key: "slug", label: "Slug", render: (v: string) => (
            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{v}</code>
        )
    },
    {
        key: "price",
        label: "Fiyat",
        width: "120px",
        render: (v: number) =>
            v ? (
                <span className="font-medium text-slate-800">
                    ₺{v.toLocaleString("tr-TR")}
                </span>
            ) : (
                <span className="text-slate-300">—</span>
            ),
    },
    {
        key: "is_featured",
        label: "Öne Çıkan",
        width: "100px",
        render: (v: any) =>
            v ? (
                <span className="badge badge-accent flex items-center gap-1 w-fit">
                    <Star size={10} className="fill-current" />
                    Evet
                </span>
            ) : (
                <span className="text-slate-300 text-xs">—</span>
            ),
    },
];

export default function ProductsPage() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.getProducts(),
    });

    return (
        <DataTable
            title="Ürünler"
            description="Tüm ürünlerin listesi"
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onAdd={() => navigate("/products/new")}
            onEdit={(row) => navigate(`/products/${row.id}/edit`)}
            addLabel="Yeni Ürün"
        />
    );
}
