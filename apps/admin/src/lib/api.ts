import type {
    Site,
    Category,
    Product,
    Article,
    Service,
    Page,
    Navigation,
    Project,
    Inquiry,
    Order,
    Media,
    Member,
    AdminUser,
    Settings,
    CompanyInfo,
    IyzicoConfig,
    SmtpConfig,
    EcommerceConfig,
    WizardStep,
    WizardOption,
    WizardStepWithOptions,
    WizardStepPayload,
    WizardOptionPayload,
} from "@forlabs/shared";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api";

interface FetchOptions extends RequestInit {
    params?: Record<string, string | undefined>;
}

/** Generic override payload for site-level overrides */
interface SiteOverridePayload {
    id?: number;
    site_id?: number;
    is_visible?: boolean;
    is_featured?: boolean;
    sort_order?: number;
    title?: string | null;
    title_en?: string | null;
    description?: string | null;
    description_en?: string | null;
    content?: string | null;
    content_en?: string | null;
    excerpt?: string | null;
    excerpt_en?: string | null;
    cover_image_url?: string | null;
    image_url?: string | null;
    gallery?: string | null;
    specs?: string | null;
    price?: number | null;
    compare_price?: number | null;
    campaign_label?: string | null;
    currency?: string | null;
    tags?: string | null;
    keywords?: string | null;
    meta_title?: string | null;
    meta_title_en?: string | null;
    meta_description?: string | null;
    meta_description_en?: string | null;
    canonical_url?: string | null;
    updated_at?: string;
}

type ArticleWritePayload = Partial<Omit<Article, "tags">> & {
    tags?: string[] | string | null;
    relatedProductIds?: number[];
};

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem("forlabs_admin_token", token);
        } else {
            localStorage.removeItem("forlabs_admin_token");
        }
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem("forlabs_admin_token");
        }
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { params, ...fetchOptions } = options;

        let url = `${API_BASE}${endpoint}`;
        if (params) {
            const filtered = Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
            ) as Record<string, string>;
            const searchParams = new URLSearchParams(filtered);
            if (searchParams.toString()) url += `?${searchParams}`;
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(fetchOptions.headers as Record<string, string>),
        };

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        if (response.status === 401) {
            this.setToken(null);
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        return data;
    }

    // Auth — Google OAuth only
    getGoogleAuthUrl() {
        return this.request<{ data: { url: string } }>("/auth/google/url");
    }

    googleCallback(code: string, redirectUri: string) {
        return this.request<{ data: { token: string; user: AdminUser } }>(
            "/auth/google/callback",
            { method: "POST", body: JSON.stringify({ code, redirect_uri: redirectUri }) }
        );
    }

    me() {
        return this.request<{ data: AdminUser }>("/auth/me");
    }

    // ─── Users ───
    getUsers() {
        return this.request<{ data: AdminUser[]; count: number }>("/users");
    }
    createUser(data: { email: string; role: string }) {
        return this.request<{ data: AdminUser }>("/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateUser(id: number, data: { role?: string; is_active?: boolean }) {
        return this.request<{ data: AdminUser }>(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }
    deleteUser(id: number) {
        return this.request<{ message: string; id: number }>(`/users/${id}`, { method: "DELETE" });
    }

    // Sites
    getSites() {
        return this.request<{ data: Site[]; count: number }>("/sites");
    }
    getSite(idOrSlug: string | number) {
        return this.request<{ data: Site }>(`/sites/${idOrSlug}`);
    }
    updateSite(idOrSlug: string | number, data: Partial<Site>) {
        return this.request<{ data: Site }>(`/sites/${idOrSlug}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    createSite(data: Partial<Site>) {
        return this.request<{ data: Site }>("/sites", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // ─── Products ───
    getProducts(siteId?: number) {
        const params: Record<string, string> = { admin: "true" };
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Product[]; count: number }>("/products", { params });
    }
    getProduct(id: number) {
        return this.request<{ data: Product }>(`/products/${id}`, { params: { admin: "true" } });
    }
    createProduct(data: Partial<Product>) {
        return this.request<{ data: Product }>("/products", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateProduct(id: number, data: Partial<Product>) {
        return this.request<{ data: Product }>(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteProduct(id: number) {
        return this.request<{ message: string }>(`/products/${id}`, { method: "DELETE" });
    }
    /** Create or update per-site visibility/override for a product */
    setProductSiteOverride(productId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/products/${productId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    /** Fetch existing overrides for a product across all sites */
    getProductOverrides(productId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/products/${productId}/overrides`);
    }

    // ─── Articles ───
    getArticles(siteId?: number) {
        const params: Record<string, string> = { admin: "true" };
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Article[]; count: number }>("/articles", { params });
    }
    getArticle(id: number, siteId?: number) {
        const params: Record<string, string> = {};
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Article }>(`/articles/${id}`, { params });
    }
    createArticle(data: ArticleWritePayload) {
        return this.request<{ data: Article }>("/articles", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateArticle(id: number, data: ArticleWritePayload) {
        return this.request<{ data: Article }>(`/articles/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteArticle(id: number) {
        return this.request<{ message: string }>(`/articles/${id}`, { method: "DELETE" });
    }
    setArticleSiteOverride(articleId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/articles/${articleId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    getArticleOverrides(articleId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/articles/${articleId}/overrides`);
    }

    // ─── Services ───
    getServices(options: { site_id?: number; admin?: string } = {}) {
        const params: Record<string, string> = {};
        if (options.site_id) params.site_id = String(options.site_id);
        if (options.admin) params.admin = options.admin;

        return this.request<{ data: Service[]; count: number }>("/services", { params });
    }
    getService(id: number) {
        return this.request<{ data: Service }>(`/services/${id}`);
    }
    createService(data: Partial<Service>) {
        return this.request<{ data: Service }>("/services", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateService(id: number, data: Partial<Service>) {
        return this.request<{ data: Service }>(`/services/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteService(id: number) {
        return this.request<{ message: string }>(`/services/${id}`, { method: "DELETE" });
    }
    setServiceSiteOverride(serviceId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/services/${serviceId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    getServiceOverrides(serviceId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/services/${serviceId}/overrides`);
    }

    // ─── Pages ───
    getPages(siteId?: number) {
        const params: Record<string, string> = { admin: "true" };
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Page[]; count: number }>("/pages", { params });
    }
    getPage(id: number) {
        return this.request<{ data: Page }>(`/pages/${id}`);
    }
    createPage(data: Partial<Page>) {
        return this.request<{ data: Page }>("/pages", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updatePage(id: number, data: Partial<Page>) {
        return this.request<{ data: Page }>(`/pages/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deletePage(id: number) {
        return this.request<{ message: string }>(`/pages/${id}`, { method: "DELETE" });
    }
    setPageSiteOverride(pageId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/pages/${pageId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    getPageOverrides(pageId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/pages/${pageId}/overrides`);
    }

    // ─── Projects ───
    getProjects(siteId?: number) {
        const params: Record<string, string> = { admin: "true" };
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Project[]; count: number }>("/projects", { params });
    }
    getProject(id: number) {
        return this.request<{ data: Project }>(`/projects/${id}`);
    }
    createProject(data: Partial<Project> & { relatedProductIds?: number[] }) {
        return this.request<{ data: Project }>("/projects", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateProject(id: number, data: Partial<Project> & { relatedProductIds?: number[] }) {
        return this.request<{ data: Project }>(`/projects/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteProject(id: number) {
        return this.request<{ message: string }>(`/projects/${id}`, { method: "DELETE" });
    }
    setProjectSiteOverride(projectId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/projects/${projectId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    getProjectOverrides(projectId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/projects/${projectId}/overrides`);
    }

    // ─── Categories ───
    getCategories(siteId?: number) {
        const params: Record<string, string> = { admin: "true" };
        if (siteId) params.site_id = String(siteId);
        return this.request<{ data: Category[]; count: number }>("/categories", { params });
    }
    getCategory(id: number) {
        return this.request<{ data: Category }>(`/categories/${id}`);
    }
    createCategory(data: Partial<Category>) {
        return this.request<{ data: Category }>("/categories", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateCategory(id: number, data: Partial<Category>) {
        return this.request<{ data: Category }>(`/categories/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteCategory(id: number) {
        return this.request<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
    }
    setCategorySiteOverride(categoryId: number, siteId: number, data: SiteOverridePayload) {
        return this.request<{ data: SiteOverridePayload }>(`/categories/${categoryId}/override?site_id=${siteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    getCategoryOverrides(categoryId: number) {
        return this.request<{ data: SiteOverridePayload[] }>(`/categories/${categoryId}/overrides`);
    }
    reorderCategories(items: Array<{ id: number; parent_id: number | null; sort_order: number }>) {
        return this.request<{ message: string; count: number }>("/categories/reorder", {
            method: "PUT",
            body: JSON.stringify({ items }),
        });
    }

    // ─── Navigations ───
    getNavigations(siteId?: number, location?: string) {
        const params: Record<string, string> = {};
        if (siteId) params.site_id = String(siteId);
        if (location) params.location = location;
        return this.request<{ data: Navigation[]; count: number }>("/navigations", { params });
    }
    getNavigationsByPage(pageId: number) {
        return this.request<{ data: Navigation[] }>(`/navigations/by-page/${pageId}`);
    }
    syncPageNavigations(data: {
        page_id: number;
        slug: string;
        title: string;
        placements: Array<{ site_id: number; location: string; parent_id: number | null; sort_order?: number }>;
    }) {
        return this.request<{ data: Navigation[]; count: number }>("/navigations/sync-page", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // ─── Inquiries ───
    getInquiries(params?: { site_id?: string; status?: string; search?: string }) {
        return this.request<{ data: Inquiry[]; count: number }>("/inquiries", { params });
    }
    getInquiry(id: number) {
        return this.request<{ data: Inquiry }>(`/inquiries/${id}`);
    }
    getInquiriesPendingCount() {
        return this.request<{ count: number }>("/inquiries/pending-count");
    }
    updateInquiryStatus(id: number, status: string) {
        return this.request<{ data: Inquiry }>(`/inquiries/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    }
    deleteInquiry(id: number) {
        return this.request<{ data: Inquiry; message: string }>(`/inquiries/${id}`, {
            method: "DELETE",
        });
    }
    getInquiryMessages(id: number) {
        return this.request<{ data: any[] }>(`/inquiries/${id}/messages`);
    }
    replyToInquiry(id: number, message: string) {
        return this.request<{ data: any }>(`/inquiries/${id}/messages`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }

    // ─── Orders ───
    getOrders(params?: { site_id?: string; status?: string; payment_status?: string; search?: string }) {
        return this.request<{ data: Order[]; count: number }>("/orders", { params });
    }
    getOrder(id: number) {
        return this.request<{ data: Order }>(`/orders/${id}`);
    }
    updateOrder(id: number, data: { status?: string; admin_notes?: string; tracking_number?: string }) {
        return this.request<{ data: Order }>(`/orders/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }
    getOrdersPendingCount() {
        return this.request<{ count: number }>("/orders/pending-count");
    }

    // ─── Members (End-user accounts) ───
    getMembers(params?: { site_id?: string; search?: string; is_active?: string }) {
        return this.request<{ data: Member[]; count: number }>("/members", { params });
    }
    getMember(id: string) {
        return this.request<{ data: Member }>(`/members/${id}`);
    }
    createMember(data: { full_name: string; email: string; password: string; phone?: string; company_name?: string; site_id: number }) {
        return this.request<{ data: Member }>("/members", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateMember(id: string, data: { full_name?: string; email?: string; phone?: string; company_name?: string; is_active?: number }) {
        return this.request<{ data: Member }>(`/members/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteMember(id: string) {
        return this.request<{ message: string; id: string }>(`/members/${id}`, { method: "DELETE" });
    }
    getMemberOrders(id: string) {
        return this.request<{ data: any[] }>(`/members/${id}/orders`);
    }
    resetMemberPassword(id: string, password: string) {
        return this.request<{ message: string }>(`/members/${id}/reset-password`, {
            method: "PUT",
            body: JSON.stringify({ password }),
        });
    }

    // ─── Orders (extended) ───
    deleteOrder(id: number) {
        return this.request<{ message: string; id: number }>(`/orders/${id}`, { method: "DELETE" });
    }
    getOrderInvoiceUrl(id: number) {
        return `${API_BASE}/orders/${id}/invoice`;
    }
    // ─── Wizard Steps & Options ───
    getWizardSteps(siteId: number) {
        return this.request<{ data: WizardStepWithOptions[] }>(`/wizard-steps/all`, {
            params: { site_id: String(siteId) },
        });
    }
    getWizardStep(id: number) {
        return this.request<{ data: WizardStepWithOptions }>(`/wizard-steps/${id}`);
    }
    createWizardStep(siteId: number, data: WizardStepPayload) {
        return this.request<{ data: WizardStep }>(`/wizard-steps`, {
            method: "POST",
            params: { site_id: String(siteId) },
            body: JSON.stringify(data),
        });
    }
    updateWizardStep(id: number, data: WizardStepPayload) {
        return this.request<{ data: WizardStep }>(`/wizard-steps/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteWizardStep(id: number) {
        return this.request<{ message: string }>(`/wizard-steps/${id}`, { method: "DELETE" });
    }
    reorderWizardSteps(siteId: number, order: number[]) {
        return this.request<{ message: string }>(`/wizard-steps/reorder`, {
            method: "PUT",
            params: { site_id: String(siteId) },
            body: JSON.stringify({ order }),
        });
    }
    createWizardOption(stepId: number, data: WizardOptionPayload) {
        return this.request<{ data: WizardOption }>(`/wizard-steps/${stepId}/options`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateWizardOption(optionId: number, data: WizardOptionPayload) {
        return this.request<{ data: WizardOption }>(`/wizard-steps/options/${optionId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    deleteWizardOption(optionId: number) {
        return this.request<{ message: string }>(`/wizard-steps/options/${optionId}`, { method: "DELETE" });
    }

    // ─── Settings (Global Singleton) ───
    getSettings() {
        return this.request<{ data: Settings }>("/settings");
    }
    updateSettings(data: { company_info?: CompanyInfo; iyzico_config?: IyzicoConfig; smtp_config?: SmtpConfig; ecommerce_config?: EcommerceConfig }) {
        return this.request<{ data: Settings }>("/settings", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Test E-Commerce configuration
    testIyzicoConnection(config: IyzicoConfig) {
        return this.request<{ status: string; message: string }>("/checkout/test-iyzico", {
            method: "POST",
            body: JSON.stringify(config),
        });
    }

    // ─── Media ───
    getMediaList(params?: { mime?: string; q?: string; site_id?: string }) {
        const p: Record<string, string> = {};
        if (params?.mime) p.mime = params.mime;
        if (params?.q) p.q = params.q;
        if (params?.site_id) p.site_id = params.site_id;
        return this.request<{ data: Media[]; count: number }>("/media", { params: p });
    }

    getMediaItem(id: number) {
        return this.request<{ data: Media }>(`/media/${id}`);
    }

    updateMedia(id: number, data: { title?: string; alt_text?: string; site_ids?: number[] }) {
        return this.request<{ data: Media }>(`/media/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    deleteMedia(id: number) {
        return this.request<{ message: string; id: number }>(`/media/${id}`, { method: "DELETE" });
    }

    bulkDeleteMedia(ids: number[]) {
        return this.request<{ message: string; count: number }>("/media/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    }

    async uploadMedia(file: File, category: string = "general", siteIds?: number[]) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        if (siteIds && siteIds.length > 0) {
            formData.append("site_ids", JSON.stringify(siteIds));
        }

        const url = `${API_BASE}/media/upload`;
        const headers: Record<string, string> = {};

        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }
        return data;
    }
}

export const api = new ApiClient();
