import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AdminLayout from "./components/AdminLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import DashboardPage from "./pages/DashboardPage";

// Content list pages
import ProductsPage from "./pages/ProductsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ServicesPage from "./pages/ServicesPage";
import PagesPage from "./pages/PagesPage";
import ProjectsPage from "./pages/ProjectsPage";
import CategoriesPage from "./pages/CategoriesPage";
import MediaPage from "./pages/MediaPage";

// Commerce
import InquiriesPage from "./pages/InquiriesPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MembersPage from "./pages/MembersPage";

// Intelligence Platform
import WizardStepsPage from "./pages/WizardStepsPage";

// System
import SitesPage from "./pages/SitesPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";

// Full-page form routes
import ProductFormPage from "./pages/ProductFormPage";
import ArticleFormPage from "./pages/ArticleFormPage";
import ServiceFormPage from "./pages/ServiceFormPage";
import ProjectFormPage from "./pages/ProjectFormPage";
import CategoryFormPage from "./pages/CategoryFormPage";
import PageFormPage from "./pages/PageFormPage";
import SiteDetailPage from "./pages/SiteDetailPage";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
            <Route path="/login/callback" element={<LoginCallbackPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={<DashboardPage />} />

              {/* Content lists */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="wizard" element={<WizardStepsPage />} />

              {/* Full-page forms — Products */}
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />

              <Route path="articles/new" element={<ArticleFormPage />} />
              <Route path="articles/:id/edit" element={<ArticleFormPage />} />

              <Route path="services/new" element={<ServiceFormPage />} />
              <Route path="services/:id/edit" element={<ServiceFormPage />} />

              <Route path="projects/new" element={<ProjectFormPage />} />
              <Route path="projects/:id/edit" element={<ProjectFormPage />} />

              <Route path="categories/new" element={<CategoryFormPage />} />
              <Route path="categories/:id/edit" element={<CategoryFormPage />} />

              <Route path="pages/new" element={<PageFormPage />} />
              <Route path="pages/:id/edit" element={<PageFormPage />} />

              {/* Commerce */}
              <Route path="inquiries" element={<InquiriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="members" element={<MembersPage />} />

              {/* System */}
              <Route path="sites" element={<SitesPage />} />
              <Route path="sites/new" element={<SiteDetailPage />} />
              <Route path="sites/:idOrSlug" element={<SiteDetailPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
