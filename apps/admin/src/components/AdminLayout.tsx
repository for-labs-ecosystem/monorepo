import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navSections = [
    {
        label: null,
        items: [
            { to: "/", label: "Dashboard", icon: "📊" },
        ],
    },
    {
        label: "İÇERİK",
        items: [
            { to: "/products", label: "Ürünler", icon: "📦" },
            { to: "/articles", label: "Makaleler", icon: "📝" },
            { to: "/services", label: "Hizmetler", icon: "🔧" },
            { to: "/pages", label: "Sayfalar", icon: "📄" },
            { to: "/projects", label: "Projeler", icon: "🏗️" },
            { to: "/categories", label: "Kategoriler", icon: "🏷️" },
            { to: "/media", label: "Medya", icon: "🖼️" },
        ],
    },
    {
        label: "TİCARET",
        items: [
            { to: "/inquiries", label: "Talepler", icon: "💬" },
            { to: "/orders", label: "Siparişler", icon: "🛒" },
        ],
    },
    {
        label: "SİSTEM",
        items: [
            { to: "/sites", label: "Siteler", icon: "🌐" },
            { to: "/users", label: "Kullanıcılar", icon: "👥" },
            { to: "/settings", label: "Ayarlar", icon: "⚙️" },
        ],
    },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-sidebar border-r border-border">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
                            FL
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-foreground">For-Labs</h1>
                            <p className="text-[10px] text-muted-foreground">CMS Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {navSections.map((section, si) => (
                        <div key={si} className={si > 0 ? "mt-5" : ""}>
                            {section.label && (
                                <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                                    {section.label}
                                </p>
                            )}
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            end={item.to === "/"}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                    ? "bg-accent/15 text-accent font-medium"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                                                }`
                                            }
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                                {user?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {user?.role}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Çıkış Yap"
                        >
                            ⏻
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
