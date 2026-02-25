import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

type Bindings = {
    DB: D1Database;
    MEDIA: R2Bucket;
    ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use("*", logger());
app.use(
    "*",
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowHeaders: ["Content-Type", "Authorization"],
    })
);

// Health check
app.get("/health", (c) => {
    return c.json({
        status: "ok",
        environment: c.env.ENVIRONMENT,
        timestamp: new Date().toISOString(),
    });
});

// API routes will be mounted here
// app.route("/api/products", productsRoute);
// app.route("/api/articles", articlesRoute);
// app.route("/api/sites", sitesRoute);

// 404 handler
app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
