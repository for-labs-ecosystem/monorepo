import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
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
    UserCircle,
    Settings,
    LogOut,
    ChevronRight,
    Wand2,
} from "lucide-react";

const navSections = [
    {
        label: null,
        items: [
            { to: "/", label: "Site Monitoring", icon: LayoutDashboard },
        ],
    },
    {
        label: "E-Ticaret",
        items: [
            { to: "/orders", label: "Siparişler", icon: ShoppingCart },
            { to: "/members", label: "Üye Yönetimi", icon: UserCircle },
            { to: "/inquiries", label: "Talepler", icon: MessageSquare },
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
            { to: "/wizard", label: "Sihirbaz", icon: Wand2 },
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

const PAGE_TITLES: Record<string, { label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }> = {
    "/": { label: "Site Control", icon: LayoutDashboard },
    "/products": { label: "Ürünler", icon: Package },
    "/articles": { label: "Makaleler", icon: FileText },
    "/services": { label: "Hizmetler", icon: Wrench },
    "/pages": { label: "Sayfalar", icon: BookOpen },
    "/projects": { label: "Projeler", icon: FolderOpen },
    "/categories": { label: "Kategoriler", icon: Tag },
    "/media": { label: "Medya", icon: Image },
    "/inquiries": { label: "Talepler", icon: MessageSquare },
    "/orders": { label: "Siparişler", icon: ShoppingCart },
    "/members": { label: "Üye Yönetimi", icon: UserCircle },
    "/sites": { label: "Siteler", icon: Globe },
    "/users": { label: "Kullanıcılar", icon: Users },
    "/settings": { label: "Ayarlar", icon: Settings },
    "/wizard": { label: "Sihirbaz", icon: Wand2 },
};

function usePageTitle() {
    const { pathname } = useLocation();
    const base = "/" + pathname.split("/")[1];
    return PAGE_TITLES[base] ?? PAGE_TITLES["/"];
}

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const pageInfo = usePageTitle();
    const [imageError, setImageError] = useState(false);

    const { data: pendingData } = useQuery({
        queryKey: ["orders-pending-count"],
        queryFn: () => api.getOrdersPendingCount(),
        refetchInterval: 15000,
        refetchIntervalInBackground: true,
    });
    const pendingCount = pendingData?.count ?? 0;

    const { data: inquiryPendingData } = useQuery({
        queryKey: ["inquiries-pending-count"],
        queryFn: () => api.getInquiriesPendingCount(),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
    const inquiryPendingCount = inquiryPendingData?.count ?? 0;

    // Update browser tab title with notification count
    useEffect(() => {
        const total = pendingCount + inquiryPendingCount;
        const baseTitle = "For-Labs CMS Panel";
        if (total > 0) {
            document.title = `(${total}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }, [pendingCount, inquiryPendingCount]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* ── Sidebar — dark panel ── */}
            <aside className="w-60 shrink-0 flex flex-col bg-[#0f172a] overflow-hidden">
                {/* Logo */}
                <div className="h-14 flex items-center px-6 border-b border-white/8 shrink-0">
                  <NavLink to="/" className="flex items-end group w-full font-sans text-[11px] font-bold uppercase text-slate-300 hover:text-white transition-colors">
                        <span className="tracking-[0.15em] leading-none mb-1 mr-1">Ecosystem</span>
                        <img
                            src="/forlabs-logo.svg"
                            alt="For-Labs Logo"
                            className="h-[22px] w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav flex-1 overflow-y-auto py-4 px-3 space-y-5">
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
                                                            className="shrink-0"
                                                        />
                                                        <span className="flex-1">{item.label}</span>
                                                        {item.to === "/orders" && pendingCount > 0 && (
                                                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none min-w-4.5 text-center">
                                                                {pendingCount}
                                                            </span>
                                                        )}
                                                        {item.to === "/inquiries" && inquiryPendingCount > 0 && (
                                                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none min-w-4.5 text-center">
                                                                {inquiryPendingCount}
                                                            </span>
                                                        )}
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
                <div className="shrink-0 p-3 border-t border-white/8">
                    <div className="flex items-center gap-2.5 px-2 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <p className="text-slate-500 text-[10px] truncate leading-tight capitalize">
                            {user?.role?.replace("_", " ")}
                        </p>
                    </div>
                </div>
            </aside>

            {/* ── Main content — white/light ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-white border-b border-slate-200">
                    {/* Left: current page label + icon */}
                    <div className="flex items-center gap-2">
                        <pageInfo.icon size={15} strokeWidth={1.75} className="text-slate-400" />
                        {pageInfo.label === "Site Control" ? (
                            <span className="text-sm font-medium text-slate-600">
                                Ekosistemdeki tüm sitelerin içeriklerini görün.
                            </span>
                        ) : (
                            <span className="text-sm font-semibold text-slate-700">
                                {pageInfo.label}
                            </span>
                        )}
                    </div>

                    {/* Right: user chip + logout */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                            {user?.avatar_url && !imageError ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name || ""}
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 text-[10px] font-bold shrink-0">
                                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                            )}
                            <span className="text-xs font-medium text-slate-600 leading-none">{user?.name || user?.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                            title="Çıkış Yap"
                        >
                            <LogOut size={13} />
                            <span className="hidden sm:inline">Çıkış</span>
                        </button>
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
