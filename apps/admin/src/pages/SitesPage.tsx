import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Globe, ExternalLink, ShoppingCart, Plus } from "lucide-react";

export default function SitesPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    const sites: any[] = data?.data || [];

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Siteler</h1>
                    <p className="page-subtitle">
                        Sisteme kayıtlı tüm tenant domainleri —{" "}
                        <span className="font-medium text-slate-700">{sites.length}</span> site
                    </p>
                </div>
                <button
                    onClick={() => navigate("/sites/new")}
                    className="btn btn-primary btn-sm"
                >
                    <Plus size={14} /> Yeni Site
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            className="card card-hover p-5 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                        <Globe size={16} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm leading-tight">
                                            {site.name}
                                        </p>
                                        <a
                                            href={`https://${site.domain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {site.domain}
                                            <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${site.is_active ? "bg-emerald-400" : "bg-slate-300"}`} />
                            </div>

                            {site.description && (
                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{site.description}</p>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="badge badge-muted font-mono">{site.slug}</span>
                                {site.has_ecommerce && (
                                    <span className="badge badge-accent flex items-center gap-1">
                                        <ShoppingCart size={9} />
                                        E-Ticaret
                                    </span>
                                )}
                                {site.is_active ? (
                                    <span className="badge badge-success">Aktif</span>
                                ) : (
                                    <span className="badge badge-muted">Pasif</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
