import type { Context, Next } from "hono";

/**
 * Module Guard Middleware
 *
 * Checks if the requested content module is enabled for the current site.
 * If `enabled_modules` is null/empty on the site record, all modules are enabled.
 * Admin requests (?admin=true) bypass this guard.
 *
 * Usage in index.ts:
 *   api.use("/products/*", moduleGuard("products"));
 */
export function moduleGuard(moduleKey: string) {
    return async (c: Context, next: Next) => {
        // Admin requests bypass module guard
        if (c.req.query("admin") === "true") {
            await next();
            return;
        }

        const site = c.get("site") as any;

        if (site?.enabled_modules) {
            try {
                const enabled: string[] =
                    typeof site.enabled_modules === "string"
                        ? JSON.parse(site.enabled_modules)
                        : site.enabled_modules;

                if (!enabled.includes(moduleKey)) {
                    return c.json({ error: "Module not enabled for this site" }, 404);
                }
            } catch {
                // Malformed JSON — allow through
            }
        }

        await next();
    };
}
