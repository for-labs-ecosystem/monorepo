import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Başlık" },
    { key: "slug", label: "Slug" },
    { key: "page_type", label: "Tür" },
];
const formFields = [
    { key: "title", label: "Başlık", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "content", label: "İçerik (HTML)", type: "textarea" as const },
    { key: "meta_title", label: "SEO Başlık" },
    { key: "meta_description", label: "SEO Açıklama" },
    {
        key: "page_type", label: "Tür", type: "select" as const, options: [
            { value: "corporate", label: "Kurumsal" },
            { value: "legal", label: "Hukuki" },
            { value: "info", label: "Bilgi" },
            { value: "landing", label: "Landing" },
        ]
    },
];

export default function PagesPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["pages"], queryFn: () => api.getPages() });
    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) await api.updatePage(modal.data.id, formData);
        else await api.createPage(formData);
        queryClient.invalidateQueries({ queryKey: ["pages"] });
    };
    return (
        <>
            <DataTable title="Sayfalar" icon="📄" columns={columns} data={data?.data || []} isLoading={isLoading} onAdd={() => setModal({ mode: "add" })} onEdit={(row) => setModal({ mode: "edit", data: row })} addLabel="Yeni Sayfa" />
            {modal && <FormModal title={modal.mode === "edit" ? "Sayfa Düzenle" : "Yeni Sayfa"} fields={formFields} initialData={modal.data} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
        </>
    );
}
