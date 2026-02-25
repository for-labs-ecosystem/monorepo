import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ServicesPage from "./pages/ServicesPage";
import PagesPage from "./pages/PagesPage";
import ProjectsPage from "./pages/ProjectsPage";
import CategoriesPage from "./pages/CategoriesPage";
import InquiriesPage from "./pages/InquiriesPage";
import OrdersPage from "./pages/OrdersPage";
import SitesPage from "./pages/SitesPage";
import MediaPage from "./pages/MediaPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="inquiries" element={<InquiriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="sites" element={<SitesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
