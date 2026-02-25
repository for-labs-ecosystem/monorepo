import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { inquiries } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const inquiriesRoute = new Hono();

/**
 * POST /api/inquiries
 * Public endpoint — visitors submit contact/quote forms.
 * The site_id is auto-set by tenant middleware.
 */
inquiriesRoute.post("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();

    // Basic validation
    if (!body.name || !body.email || !body.message) {
        return c.json(
            { error: "name, email, and message are required" },
            400
        );
    }

    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(inquiries)
        .values({
            site_id: siteId,
            name: body.name,
            email: body.email,
            phone: body.phone || null,
            company: body.company || null,
            subject: body.subject || null,
            message: body.message,
            source_type: body.source_type || null,
            source_id: body.source_id || null,
        })
        .returning()
        .get();

    return c.json(
        { data: { id: inserted.id }, message: "Inquiry submitted successfully" },
        201
    );
});

/**
 * GET /api/inquiries
 * Admin endpoint — list all inquiries for the current site.
 * Supports ?status=new|read|replied|archived filtering.
 */
inquiriesRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const statusFilter = c.req.query("status");
    const db = createDb(c.env.DB);

    let query = db
        .select()
        .from(inquiries)
        .where(eq(inquiries.site_id, siteId))
        .orderBy(desc(inquiries.created_at));

    // If status filter provided, narrow down
    if (statusFilter) {
        query = db
            .select()
            .from(inquiries)
            .where(
                sql`${inquiries.site_id} = ${siteId} AND ${inquiries.status} = ${statusFilter}`
            )
            .orderBy(desc(inquiries.created_at));
    }

    const result = await query;
    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/inquiries/:id
 * Admin endpoint — get single inquiry detail.
 */
inquiriesRoute.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, id))
        .get();

    if (!result) return c.json({ error: "Inquiry not found" }, 404);
    return c.json({ data: result });
});

/**
 * PATCH /api/inquiries/:id/status
 * Admin endpoint — update inquiry status and optional notes.
 */
inquiriesRoute.patch("/:id/status", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(inquiries)
        .set({
            status: body.status,
            admin_notes: body.admin_notes ?? undefined,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(inquiries.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Inquiry not found" }, 404);
    return c.json({ data: updated });
});

export default inquiriesRoute;
