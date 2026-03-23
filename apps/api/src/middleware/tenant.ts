import type { Context, Next } from "hono";
import { DOMAIN_MAP, DEFAULT_SITE_SLUG } from "@forlabs/shared";
import { eq } from "drizzle-orm";
import { sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

/**
 * Tenant middleware — resolves the Host header to a site record.
 *
 * Admin panel override: when ?site_id=N is present in the query string,
 * that site is resolved directly (allows the admin to view any tenant's data).
 *
 * Sets on Hono context:
 *   c.set("siteSlug", string)
 *   c.set("siteId", number)
 *   c.set("site", SiteRow)
 */
export async function tenantMiddleware(c: Context, next: Next) {
    const db = createDb(c.env.DB);

    // ── Admin override via query param ──
    const siteIdParam = c.req.query("site_id");
    if (siteIdParam) {
        const siteId = Number(siteIdParam);
        if (!isNaN(siteId) && siteId > 0) {
            const site = await db
                .select()
                .from(sites)
                .where(eq(sites.id, siteId))
                .get();
            if (site && site.is_active) {
                c.set("siteSlug", site.slug);
                c.set("siteId", site.id);
                c.set("site", site);
                await next();
                return;
            }
        }
    }

    // ── Default: resolve from Host header ──
    const host = c.req.header("host") || "";
    const hostname = host.split(":")[0];
    const slug = DOMAIN_MAP[hostname] || DEFAULT_SITE_SLUG;

    const site = await db
        .select()
        .from(sites)
        .where(eq(sites.slug, slug))
        .get();

    if (!site || !site.is_active) {
        return c.json({ error: "Site not found or inactive" }, 404);
    }

    c.set("siteSlug", site.slug);
    c.set("siteId", site.id);
    c.set("site", site);

    await next();
}
