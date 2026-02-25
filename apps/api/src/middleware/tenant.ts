import type { Context, Next } from "hono";
import { DOMAIN_MAP, DEFAULT_SITE_SLUG } from "@forlabs/shared";
import { eq } from "drizzle-orm";
import { sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

/**
 * Tenant middleware — resolves the Host header to a site record.
 *
 * Sets on Hono context:
 *   c.set("siteSlug", string)
 *   c.set("siteId", number)
 *   c.set("site", SiteRow)
 */
export async function tenantMiddleware(c: Context, next: Next) {
    const host = c.req.header("host") || "";
    // Strip port for local dev (e.g. "localhost:8787" → "localhost")
    const hostname = host.split(":")[0];

    const slug = DOMAIN_MAP[hostname] || DEFAULT_SITE_SLUG;

    const db = createDb(c.env.DB);
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
