import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Kategori Adı" },
    { key: "slug", label: "Slug" },
    { key: "sort_order", label: "Sıra" },
];
const formFields = [
    { key: "name", label: "Kategori Adı", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "description", label: "Açıklama", type: "textarea" as const },
    { key: "sort_order", label: "Sıralama", type: "number" as const },
];

export default function CategoriesPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: () => api.getCategories() });
    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) await api.updateCategory(modal.data.id, formData);
        else await api.createCategory(formData);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
    };
    return (
        <>
            <DataTable title="Kategoriler" icon="🏷️" columns={columns} data={data?.data || []} isLoading={isLoading} onAdd={() => setModal({ mode: "add" })} onEdit={(row) => setModal({ mode: "edit", data: row })} addLabel="Yeni Kategori" />
            {modal && <FormModal title={modal.mode === "edit" ? "Kategori Düzenle" : "Yeni Kategori"} fields={formFields} initialData={modal.data} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
        </>
    );
}
