import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { settings } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import type { Bindings } from "../lib/types";

const settingsRoute = new Hono<{ Bindings: Bindings }>();

const DEFAULTS = {
    company_info: "{}",
    iyzico_config: "{}",
    smtp_config: "{}",
    ecommerce_config: "{}",
};

/**
 * GET /api/settings
 * Returns the singleton settings row (id=1).
 * If no row exists, creates one with defaults and returns it.
 */
settingsRoute.get("/", async (c) => {
    const db = createDb(c.env.DB);

    let row = await db
        .select()
        .from(settings)
        .where(eq(settings.id, 1))
        .get();

    if (!row) {
        row = await db
            .insert(settings)
            .values({ id: 1, ...DEFAULTS })
            .returning()
            .get();
    }

    // Parse JSON columns for convenience
    return c.json({
        data: {
            id: row!.id,
            company_info: safeJsonParse(row!.company_info),
            iyzico_config: safeJsonParse(row!.iyzico_config),
            smtp_config: safeJsonParse(row!.smtp_config),
            ecommerce_config: safeJsonParse(row!.ecommerce_config),
            updated_at: row!.updated_at,
        },
    });
});

/**
 * PUT /api/settings
 * Updates the singleton settings row.
 * Accepts partial updates — only provided keys are overwritten.
 */
settingsRoute.put("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updates: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    if (body.company_info !== undefined) {
        updates.company_info = JSON.stringify(body.company_info);
    }
    if (body.iyzico_config !== undefined) {
        updates.iyzico_config = JSON.stringify(body.iyzico_config);
    }
    if (body.smtp_config !== undefined) {
        updates.smtp_config = JSON.stringify(body.smtp_config);
    }
    if (body.ecommerce_config !== undefined) {
        updates.ecommerce_config = JSON.stringify(body.ecommerce_config);
    }

    // Ensure row exists (upsert safety)
    const existing = await db.select().from(settings).where(eq(settings.id, 1)).get();
    if (!existing) {
        await db.insert(settings).values({ id: 1, ...DEFAULTS });
    }

    const row = await db
        .update(settings)
        .set(updates)
        .where(eq(settings.id, 1))
        .returning()
        .get();

    return c.json({
        data: {
            id: row!.id,
            company_info: safeJsonParse(row!.company_info),
            iyzico_config: safeJsonParse(row!.iyzico_config),
            smtp_config: safeJsonParse(row!.smtp_config),
            ecommerce_config: safeJsonParse(row!.ecommerce_config),
            updated_at: row!.updated_at,
        },
    });
});

function safeJsonParse(val: string | null): any {
    if (!val) return {};
    try {
        return JSON.parse(val);
    } catch {
        return {};
    }
}

export default settingsRoute;
