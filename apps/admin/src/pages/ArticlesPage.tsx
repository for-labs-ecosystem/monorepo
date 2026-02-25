import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Başlık" },
    { key: "slug", label: "Slug" },
    { key: "author", label: "Yazar" },
];

const formFields = [
    { key: "title", label: "Başlık", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "excerpt", label: "Özet", type: "textarea" as const },
    { key: "content", label: "İçerik (HTML)", type: "textarea" as const },
    { key: "author", label: "Yazar" },
    { key: "cover_image_url", label: "Kapak Görseli URL" },
];

export default function ArticlesPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["articles"], queryFn: () => api.getArticles() });

    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) {
            await api.updateArticle(modal.data.id, formData);
        } else {
            await api.createArticle(formData);
        }
        queryClient.invalidateQueries({ queryKey: ["articles"] });
    };

    return (
        <>
            <DataTable title="Makaleler" icon="📝" columns={columns} data={data?.data || []} isLoading={isLoading} onAdd={() => setModal({ mode: "add" })} onEdit={(row) => setModal({ mode: "edit", data: row })} addLabel="Yeni Makale" />
            {modal && <FormModal title={modal.mode === "edit" ? "Makale Düzenle" : "Yeni Makale"} fields={formFields} initialData={modal.data} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
        </>
    );
}
