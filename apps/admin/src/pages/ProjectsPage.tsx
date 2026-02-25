import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";

const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "title", label: "Başlık" },
    { key: "client_name", label: "Müşteri", render: (v: string) => v || <span className="text-slate-300">—</span> },
    {
        key: "location", label: "Lokasyon", render: (v: string) => (
            v ? <span className="badge badge-muted">{v}</span> : <span className="text-slate-300">—</span>
        )
    },
];

export default function ProjectsPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => api.getProjects() });
    return (
        <DataTable
            title="Projeler"
            description="Portföy ve proje çalışmaları"
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            onAdd={() => navigate("/projects/new")}
            onEdit={(row) => navigate(`/projects/${row.id}/edit`)}
            addLabel="Yeni Proje"
        />
    );
}
