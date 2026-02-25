import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: number | string;
    color: string;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color} group-hover:scale-110 transition-transform`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: () => api.getProducts(),
    });
    const { data: articles } = useQuery({
        queryKey: ["articles"],
        queryFn: () => api.getArticles(),
    });
    const { data: services } = useQuery({
        queryKey: ["services"],
        queryFn: () => api.getServices(),
    });
    const { data: pages } = useQuery({
        queryKey: ["pages"],
        queryFn: () => api.getPages(),
    });
    const { data: projects } = useQuery({
        queryKey: ["projects"],
        queryFn: () => api.getProjects(),
    });
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => api.getCategories(),
    });
    const { data: inquiries } = useQuery({
        queryKey: ["inquiries"],
        queryFn: () => api.getInquiries(),
    });
    const { data: orders } = useQuery({
        queryKey: ["orders"],
        queryFn: () => api.getOrders(),
    });
    const { data: sites } = useQuery({
        queryKey: ["sites"],
        queryFn: () => api.getSites(),
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Hoş geldin, {user?.name}. Sistemin genel durumu aşağıda.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon="📦"
                    label="Ürünler"
                    value={products?.count ?? "—"}
                    color="bg-blue-500/10"
                />
                <StatCard
                    icon="📝"
                    label="Makaleler"
                    value={articles?.count ?? "—"}
                    color="bg-green-500/10"
                />
                <StatCard
                    icon="🔧"
                    label="Hizmetler"
                    value={services?.count ?? "—"}
                    color="bg-orange-500/10"
                />
                <StatCard
                    icon="📄"
                    label="Sayfalar"
                    value={pages?.count ?? "—"}
                    color="bg-purple-500/10"
                />
                <StatCard
                    icon="🏗️"
                    label="Projeler"
                    value={projects?.count ?? "—"}
                    color="bg-teal-500/10"
                />
                <StatCard
                    icon="🏷️"
                    label="Kategoriler"
                    value={categories?.count ?? "—"}
                    color="bg-yellow-500/10"
                />
                <StatCard
                    icon="💬"
                    label="Talepler"
                    value={inquiries?.count ?? "—"}
                    color="bg-pink-500/10"
                />
                <StatCard
                    icon="🛒"
                    label="Siparişler"
                    value={orders?.count ?? "—"}
                    color="bg-cyan-500/10"
                />
            </div>

            {/* Sites overview */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    🌐 Aktif Siteler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sites?.data?.map((site: any) => (
                        <div
                            key={site.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-accent/30 transition-colors"
                        >
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${site.is_active ? "bg-success" : "bg-destructive"
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {site.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{site.domain}</p>
                            </div>
                            {site.has_ecommerce && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                    E-Ticaret
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
