import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Başlık" },
    { key: "slug", label: "Slug" },
    { key: "client_name", label: "Müşteri" },
    { key: "location", label: "Konum" },
];
const formFields = [
    { key: "title", label: "Başlık", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "description", label: "Açıklama", type: "textarea" as const },
    { key: "content", label: "Detay (HTML)", type: "textarea" as const },
    { key: "client_name", label: "Müşteri Adı" },
    { key: "location", label: "Konum" },
    { key: "completion_date", label: "Tamamlanma Tarihi", placeholder: "2025-06" },
    { key: "cover_image_url", label: "Kapak Görseli URL" },
];

export default function ProjectsPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => api.getProjects() });
    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) await api.updateProject(modal.data.id, formData);
        else await api.createProject(formData);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
    };
    return (
        <>
            <DataTable title="Projeler" icon="🏗️" columns={columns} data={data?.data || []} isLoading={isLoading} onAdd={() => setModal({ mode: "add" })} onEdit={(row) => setModal({ mode: "edit", data: row })} addLabel="Yeni Proje" />
            {modal && <FormModal title={modal.mode === "edit" ? "Proje Düzenle" : "Yeni Proje"} fields={formFields} initialData={modal.data} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
        </>
    );
}
