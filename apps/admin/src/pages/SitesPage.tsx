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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            onClick={() => navigate(`/sites/${site.slug}`)}
                            className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Decorative background element on hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Globe size={18} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-[15px] leading-tight group-hover:text-indigo-600 transition-colors">
                                                {site.name}
                                            </p>
                                            <a
                                                href={`https://${site.domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-slate-400 hover:text-indigo-500 flex items-center gap-1 mt-0.5 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {site.domain}
                                                <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${site.is_active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-200"}`} />
                                    </div>
                                </div>

                                {site.description && (
                                    <p className="text-[13px] text-slate-500 mb-5 line-clamp-2 min-h-10 leading-relaxed">
                                        {site.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-mono border border-slate-100">
                                        {site.slug}
                                    </span>
                                    {site.has_ecommerce && (
                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-semibold flex items-center gap-1.5 border border-indigo-100">
                                            <ShoppingCart size={11} strokeWidth={2.5} />
                                            E-Ticaret
                                        </span>
                                    )}
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${site.is_active
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-slate-50 text-slate-500 border-slate-100"
                                        }`}>
                                        {site.is_active ? "Aktif" : "Pasif"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
