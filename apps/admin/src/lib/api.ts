const API_BASE = "/api";

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

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
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams}`;
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

    // Auth
    login(email: string, password: string) {
        return this.request<{ data: { token: string; user: any } }>(
            "/auth/login",
            { method: "POST", body: JSON.stringify({ email, password }) }
        );
    }

    me() {
        return this.request<{ data: any }>("/auth/me");
    }

    // Sites
    getSites() {
        return this.request<{ data: any[]; count: number }>("/sites");
    }

    // Products
    getProducts() {
        return this.request<{ data: any[]; count: number }>("/products");
    }
    getProduct(slug: string) {
        return this.request<{ data: any }>(`/products/${slug}`);
    }
    createProduct(data: any) {
        return this.request<{ data: any }>("/products", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateProduct(id: number, data: any) {
        return this.request<{ data: any }>(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Articles
    getArticles() {
        return this.request<{ data: any[]; count: number }>("/articles");
    }
    createArticle(data: any) {
        return this.request<{ data: any }>("/articles", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateArticle(id: number, data: any) {
        return this.request<{ data: any }>(`/articles/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Services
    getServices() {
        return this.request<{ data: any[]; count: number }>("/services");
    }
    createService(data: any) {
        return this.request<{ data: any }>("/services", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateService(id: number, data: any) {
        return this.request<{ data: any }>(`/services/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Pages
    getPages() {
        return this.request<{ data: any[]; count: number }>("/pages");
    }
    createPage(data: any) {
        return this.request<{ data: any }>("/pages", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updatePage(id: number, data: any) {
        return this.request<{ data: any }>(`/pages/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Projects
    getProjects() {
        return this.request<{ data: any[]; count: number }>("/projects");
    }
    createProject(data: any) {
        return this.request<{ data: any }>("/projects", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateProject(id: number, data: any) {
        return this.request<{ data: any }>(`/projects/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Categories
    getCategories() {
        return this.request<{ data: any[]; count: number }>("/categories");
    }
    createCategory(data: any) {
        return this.request<{ data: any }>("/categories", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    updateCategory(id: number, data: any) {
        return this.request<{ data: any }>(`/categories/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // Inquiries
    getInquiries(status?: string) {
        const params = status ? { status } : undefined;
        return this.request<{ data: any[]; count: number }>("/inquiries", {
            params,
        });
    }
    updateInquiryStatus(id: number, status: string, admin_notes?: string) {
        return this.request<{ data: any }>(`/inquiries/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status, admin_notes }),
        });
    }

    // Orders
    getOrders() {
        return this.request<{ data: any[]; count: number }>("/checkout/orders");
    }
}

export const api = new ApiClient();
