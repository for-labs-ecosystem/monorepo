import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { tenantMiddleware } from "./middleware/tenant";
import { authMiddleware } from "./middleware/auth";
import productsRoute from "./routes/products";
import articlesRoute from "./routes/articles";
import categoriesRoute from "./routes/categories";
import sitesRoute from "./routes/sites";

type Bindings = {
    DB: D1Database;
    MEDIA: R2Bucket;
    ENVIRONMENT: string;
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

// ─── Tenant-scoped API routes ───
const api = new Hono<{ Bindings: Bindings }>();
api.use("*", tenantMiddleware);

// Public routes (read-only, no auth needed)
api.route("/products", productsRoute);
api.route("/articles", articlesRoute);
api.route("/categories", categoriesRoute);
api.route("/sites", sitesRoute);

// Mount all API routes under /api
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
