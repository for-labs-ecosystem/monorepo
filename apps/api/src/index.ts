import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { tenantMiddleware } from "./middleware/tenant";
import { moduleGuard } from "./middleware/moduleGuard";
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
import mediaRoute from "./routes/media";
import navigationsRoute from "./routes/navigations";
import ordersRoute from "./routes/orders";
import usersRoute from "./routes/users";
import settingsRoute from "./routes/settings";
import matchRoute from "./routes/match";
import membersRoute from "./routes/members";
import memberAuthRoute from "./routes/auth-members";
import wizardStepsRoute from "./routes/wizard-steps";

import type { Bindings } from "./lib/types";

const app = new Hono<{ Bindings: Bindings }>();

// ─── Global middleware ───
app.use("*", logger());
app.use(
    "*",
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://admin.for-labs.com",
            "https://for-labs.com",
            "https://www.for-labs.com",
            "https://atagotr.com",
            "https://www.atagotr.com",
            "https://gidakimya.com",
            "https://www.gidakimya.com",
            "http://localhost:5178",
            "https://forlabs-gidakimya.pages.dev",
            "https://labkurulum.com",
            "https://www.labkurulum.com",
            "https://gidatest.com",
            "https://alerjen.net",
            "https://hijyenkontrol.com",
            "https://forlabs-admin.pages.dev",
            "https://forlabs-web.pages.dev",
            "https://forlabs-atagotr.pages.dev",
            "http://localhost:5176",
            "https://forlabs-labkurulum.pages.dev",
            "http://localhost:5177",
            "https://www.alerjen.net",
            "https://forlabs-alerjen.pages.dev",
            "http://localhost:5179",
            "https://www.hijyenkontrol.com",
            "https://forlabs-hijyenkontrol.pages.dev",
            "http://localhost:5180",
            "https://www.gidatest.com",
            "https://forlabs-gidatest.pages.dev",
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

// ─── Users management (NO tenant middleware — admin-global, super_admin only) ───
app.route("/api/users", usersRoute);

// ─── Settings (NO tenant middleware — global singleton config) ───
app.route("/api/settings", settingsRoute);

// ─── R2 media serve (NO tenant middleware — public asset serving) ───
app.get("/api/media/serve/*", async (c) => {
    const key = c.req.path.replace("/api/media/serve/", "");
    if (!key) return c.json({ error: "No key" }, 400);

    const object = await c.env.MEDIA.get(key);
    if (!object) return c.json({ error: "Not found" }, 404);

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Disposition", "inline");

    return new Response(object.body, { headers });
});

// ─── Tenant-scoped API routes ───
const api = new Hono<{ Bindings: Bindings }>();
api.use("*", tenantMiddleware);

// Content routes (CRUD + Override) — module guard enforces site's enabled_modules
// Note: two use() calls per module — one for root list, one for sub-paths
api.use("/products", moduleGuard("products"));
api.use("/products/*", moduleGuard("products"));
api.use("/articles", moduleGuard("articles"));
api.use("/articles/*", moduleGuard("articles"));
api.use("/services", moduleGuard("services"));
api.use("/services/*", moduleGuard("services"));
api.use("/pages", moduleGuard("pages"));
api.use("/pages/*", moduleGuard("pages"));
api.use("/projects", moduleGuard("projects"));
api.use("/projects/*", moduleGuard("projects"));
api.route("/products", productsRoute);
api.route("/articles", articlesRoute);
api.route("/categories", categoriesRoute);
api.route("/sites", sitesRoute);
api.route("/services", servicesRoute);
api.route("/pages", pagesRoute);
api.route("/projects", projectsRoute);
api.route("/navigations", navigationsRoute);

// Intelligence Platform
api.route("/match", matchRoute);
api.route("/wizard-steps", wizardStepsRoute);

// Forms & Commerce
api.route("/inquiries", inquiriesRoute);
api.route("/checkout", checkoutRoute);
api.route("/orders", ordersRoute);
api.route("/members", membersRoute);
api.route("/member-auth", memberAuthRoute);
api.route("/media", mediaRoute);

// Mount all tenant-scoped routes under /api
app.route("/api", api);

// ─── 404 handler ───
app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
});

// ─── Error handler ───
app.onError((err, c) => {
    console.error(`API Error: ${err.message}`, err);
    return c.json({ 
        error: "Internal Server Error", 
        message: err.message,
        stack: c.env.ENVIRONMENT === "development" ? err.stack : undefined
    }, 500);
});

export default app;
