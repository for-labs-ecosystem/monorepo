import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { tenantMiddleware } from "./middleware/tenant";
import { authMiddleware } from "./middleware/auth";
import authRoute from "./routes/auth";
import productsRoute from "./routes/products";
import articlesRoute from "./routes/articles";
import categoriesRoute from "./routes/categories";
import sitesRoute from "./routes/sites";
import servicesRoute from "./routes/services";
import pagesRoute from "./routes/pages";
import projectsRoute from "./routes/projects";
import inquiriesRoute from "./routes/inquiries";
import checkoutRoute from "./routes/checkout";

type Bindings = {
    DB: D1Database;
    MEDIA: R2Bucket;
    ENVIRONMENT: string;
    IYZICO_API_KEY?: string;
    IYZICO_SECRET_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── Global middleware ───
app.use("*", logger());
app.use(
    "*",
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://admin.for-labs.com",
            "https://for-labs.com",
            "https://atagotr.com",
            "https://gidakimya.com",
            "https://labkurulum.com",
            "https://gidatest.com",
            "https://alerjen.net",
            "https://hijyenkontrol.com",
        ],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── Health check (no tenant required) ───
app.get("/health", (c) => {
    return c.json({
        status: "ok",
        environment: c.env.ENVIRONMENT,
        timestamp: new Date().toISOString(),
    });
});

// ─── Auth routes (NO tenant middleware — admin-global) ───
app.route("/api/auth", authRoute);

// ─── Tenant-scoped API routes ───
const api = new Hono<{ Bindings: Bindings }>();
api.use("*", tenantMiddleware);

// Content routes (CRUD + Override)
api.route("/products", productsRoute);
api.route("/articles", articlesRoute);
api.route("/categories", categoriesRoute);
api.route("/sites", sitesRoute);
api.route("/services", servicesRoute);
api.route("/pages", pagesRoute);
api.route("/projects", projectsRoute);

// Forms & Commerce
api.route("/inquiries", inquiriesRoute);
api.route("/checkout", checkoutRoute);

// Mount all tenant-scoped routes under /api
app.route("/api", api);

// ─── 404 handler ───
app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
});

// ─── Error handler ───
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
