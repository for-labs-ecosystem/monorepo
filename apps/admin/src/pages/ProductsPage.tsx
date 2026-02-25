import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Başlık" },
    { key: "slug", label: "Slug" },
    {
        key: "price",
        label: "Fiyat",
        render: (v: number) => (v ? `₺${v.toLocaleString("tr-TR")}` : "—"),
    },
    {
        key: "is_featured",
        label: "Öne Çıkan",
        render: (v: any) =>
            v ? (
                <span className="text-accent text-xs font-medium">★ Evet</span>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            ),
    },
];

const formFields = [
    { key: "title", label: "Başlık", required: true, placeholder: "Ürün adı" },
    { key: "slug", label: "Slug", required: true, placeholder: "urun-adi" },
    {
        key: "description",
        label: "Açıklama",
        type: "textarea" as const,
        placeholder: "Ürün açıklaması...",
    },
    { key: "price", label: "Fiyat (₺)", type: "number" as const, placeholder: "0" },
    { key: "image_url", label: "Görsel URL", placeholder: "https://..." },
];

export default function ProductsPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.getProducts(),
    });

    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) {
            await api.updateProduct(modal.data.id, formData);
        } else {
            await api.createProduct(formData);
        }
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    return (
        <>
            <DataTable
                title="Ürünler"
                icon="📦"
                columns={columns}
                data={data?.data || []}
                isLoading={isLoading}
                onAdd={() => setModal({ mode: "add" })}
                onEdit={(row) => setModal({ mode: "edit", data: row })}
                addLabel="Yeni Ürün"
            />
            {modal && (
                <FormModal
                    title={modal.mode === "edit" ? "Ürün Düzenle" : "Yeni Ürün"}
                    fields={formFields}
                    initialData={modal.data}
                    onSubmit={handleSubmit}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}
