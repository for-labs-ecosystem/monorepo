import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
    LayoutDashboard,
    Package,
    FileText,
    Wrench,
    BookOpen,
    FolderOpen,
    Tag,
    Image,
    MessageSquare,
    ShoppingCart,
    Globe,
    Users,
    Settings,
    LogOut,
    ChevronRight,
} from "lucide-react";

const navSections = [
    {
        label: null,
        items: [
            { to: "/", label: "Dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "İçerik",
        items: [
            { to: "/products", label: "Ürünler", icon: Package },
            { to: "/articles", label: "Makaleler", icon: FileText },
            { to: "/services", label: "Hizmetler", icon: Wrench },
            { to: "/pages", label: "Sayfalar", icon: BookOpen },
            { to: "/projects", label: "Projeler", icon: FolderOpen },
            { to: "/categories", label: "Kategoriler", icon: Tag },
            { to: "/media", label: "Medya", icon: Image },
        ],
    },
    {
        label: "Ticaret",
        items: [
            { to: "/inquiries", label: "Talepler", icon: MessageSquare },
            { to: "/orders", label: "Siparişler", icon: ShoppingCart },
        ],
    },
    {
        label: "Sistem",
        items: [
            { to: "/sites", label: "Siteler", icon: Globe },
            { to: "/users", label: "Kullanıcılar", icon: Users },
            { to: "/settings", label: "Ayarlar", icon: Settings },
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
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* ── Sidebar — dark panel ── */}
            <aside className="w-60 flex-shrink-0 flex flex-col bg-[#0f172a] overflow-hidden">
                {/* Logo */}
                <div className="h-14 flex items-center px-5 border-b border-white/8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs tracking-tight">FL</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold leading-none">For-Labs</p>
                            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">CMS Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {navSections.map((section, si) => (
                        <div key={si}>
                            {section.label && (
                                <p className="sidebar-nav-section-label mb-1.5">
                                    {section.label}
                                </p>
                            )}
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                end={item.to === "/"}
                                                className={({ isActive }) =>
                                                    `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-150 ${isActive
                                                        ? "bg-indigo-500/15 text-indigo-400"
                                                        : "text-slate-400 hover:bg-white/6 hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <Icon
                                                            size={15}
                                                            strokeWidth={isActive ? 2 : 1.75}
                                                            className="flex-shrink-0"
                                                        />
                                                        <span className="flex-1">{item.label}</span>
                                                        {isActive && (
                                                            <ChevronRight size={12} className="opacity-50" />
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User footer */}
                <div className="flex-shrink-0 p-3 border-t border-white/8">
                    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/6 transition-colors group">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-semibold flex-shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-xs font-medium truncate leading-tight">
                                {user?.name}
                            </p>
                            <p className="text-slate-500 text-[10px] truncate leading-tight capitalize">
                                {user?.role?.replace("_", " ")}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/15 hover:text-red-400 text-slate-500"
                            title="Çıkış Yap"
                        >
                            <LogOut size={13} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main content — white/light ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <span className="text-slate-500 font-medium">For-Labs CMS</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-slate-500">Canlı</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
