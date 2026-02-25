import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";

const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Başlık" },
    { key: "slug", label: "Slug" },
    { key: "service_type", label: "Tür" },
    { key: "price", label: "Fiyat", render: (v: number) => v ? `₺${v.toLocaleString("tr-TR")}` : "—" },
];

const formFields = [
    { key: "title", label: "Başlık", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "description", label: "Açıklama", type: "textarea" as const },
    { key: "content", label: "Detay (HTML)", type: "textarea" as const },
    {
        key: "service_type", label: "Tür", type: "select" as const, options: [
            { value: "analysis", label: "Analiz" },
            { value: "setup", label: "Kurulum" },
            { value: "audit", label: "Denetim" },
            { value: "consulting", label: "Danışmanlık" },
            { value: "training", label: "Eğitim" },
        ]
    },
    { key: "price", label: "Fiyat (₺)", type: "number" as const },
];

export default function ServicesPage() {
    const [modal, setModal] = useState<{ mode: "add" | "edit"; data?: any } | null>(null);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: () => api.getServices() });

    const handleSubmit = async (formData: Record<string, any>) => {
        if (modal?.mode === "edit" && modal.data?.id) await api.updateService(modal.data.id, formData);
        else await api.createService(formData);
        queryClient.invalidateQueries({ queryKey: ["services"] });
    };

    return (
        <>
            <DataTable title="Hizmetler" icon="🔧" columns={columns} data={data?.data || []} isLoading={isLoading} onAdd={() => setModal({ mode: "add" })} onEdit={(row) => setModal({ mode: "edit", data: row })} addLabel="Yeni Hizmet" />
            {modal && <FormModal title={modal.mode === "edit" ? "Hizmet Düzenle" : "Yeni Hizmet"} fields={formFields} initialData={modal.data} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
        </>
    );
}
