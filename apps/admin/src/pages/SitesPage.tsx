import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function SitesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    🌐 Siteler
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Sisteme kayıtlı tüm tenant domainleri
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.data?.map((site: any) => (
                        <div
                            key={site.id}
                            className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-foreground">{site.name}</h3>
                                    <p className="text-sm text-accent">{site.domain}</p>
                                </div>
                                <div
                                    className={`w-3 h-3 rounded-full mt-1 ${site.is_active ? "bg-success" : "bg-destructive"
                                        }`}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                                {site.description || "Açıklama yok"}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {site.slug}
                                </span>
                                {site.has_ecommerce && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                        E-Ticaret
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
