import { Hono } from "hono";
import { eq, desc, sql, and, or, like, count } from "drizzle-orm";
import { inquiries, inquiryMessages } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { verifyJwt } from "../lib/jwt";
import { sendInquiryNotificationEmail } from "../lib/inquiry-mail";

type Env = {
    Bindings: { DB: D1Database; JWT_SECRET?: string; RESEND_API_KEY?: string };
    Variables: { siteId: number };
};

const inquiriesRoute = new Hono<Env>();

const JWT_DEFAULT_SECRET = "forlabs-dev-secret-change-in-prod";

/**
 * POST /api/inquiries
 * Public endpoint — visitors submit contact/quote forms.
 * The site_id is auto-set by tenant middleware.
 */
inquiriesRoute.post("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const body = await c.req.json();

    // Basic validation
    if (!body.sender_name || !body.sender_email) {
        return c.json(
            { error: "sender_name and sender_email are required" },
            400
        );
    }

    // Everything except the reserved fields goes into payload
    const { sender_name, sender_email, ...rest } = body;
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(rest)) {
        if (value !== null && value !== undefined && value !== "") {
            payload[key] = String(value);
        }
    }

    let member_id: string | null = null;
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
        try {
            const decoded = await verifyJwt(token, jwtSecret);
            if (decoded && decoded.type === "member") {
                member_id = decoded.sub as string;
            }
        } catch (err) {
            // Ignore token errors for public endpoint
        }
    }

    const db = createDb(c.env.DB);

    const inserted = await db
        .insert(inquiries)
        .values({
            site_id: siteId,
            member_id,
            sender_name,
            sender_email,
            payload: Object.keys(payload).length > 0 ? payload : null,
        })
        .returning()
        .get();

    if (payload.message) {
        await db
            .insert(inquiryMessages)
            .values({
                inquiry_id: inserted.id,
                sender: "user",
                message: payload.message,
            })
            .run();
    }

    await sendInquiryNotificationEmail({
        siteId,
        senderName: sender_name,
        senderEmail: sender_email,
        payload,
        resendApiKey: c.env.RESEND_API_KEY,
    });

    return c.json(
        { data: { id: inserted.id }, message: "Inquiry submitted successfully" },
        201
    );
});

/**
 * GET /api/inquiries
 * Admin endpoint — list inquiries with advanced filtering.
 * Query params:
 * - site_id: "all" for all sites, or specific site ID
 * - status: "new" | "read" | "replied" | "archived" | "unread" (combines new+read)
 * - search: search in name, email, company, subject, message
 */
inquiriesRoute.get("/", async (c) => {
    const currentSiteId = c.get("siteId") as number;
    const siteParam = c.req.query("site_id");
    const statusParam = c.req.query("status");
    const searchParam = c.req.query("search");
    const db = createDb(c.env.DB);

    // Build WHERE conditions
    const conditions = [];

    // Site filter
    if (siteParam === "all") {
        // No site filter - show all sites
    } else if (siteParam) {
        conditions.push(eq(inquiries.site_id, Number(siteParam)));
    } else {
        // Default to current site
        conditions.push(eq(inquiries.site_id, currentSiteId));
    }

    // Status filter
    const validStatuses = ["new", "read", "replied", "archived"];
    if (statusParam === "unread") {
        conditions.push(
            or(eq(inquiries.status, "new"), eq(inquiries.status, "read"))
        );
    } else if (statusParam && statusParam !== "all" && validStatuses.includes(statusParam)) {
        conditions.push(eq(inquiries.status, statusParam as "new" | "read" | "replied" | "archived"));
    }

    // Search filter — sender fields + payload JSON text
    if (searchParam) {
        conditions.push(
            or(
                like(inquiries.sender_name, `%${searchParam}%`),
                like(inquiries.sender_email, `%${searchParam}%`),
                like(inquiries.payload, `%${searchParam}%`)
            )
        );
    }

    const result = await db
        .select()
        .from(inquiries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(inquiries.created_at));

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/inquiries/pending-count
 * Returns count of unread inquiries (status = 'new').
 */
inquiriesRoute.get("/pending-count", async (c) => {
    const db = createDb(c.env.DB);

    const result = await db
        .select({ value: count() })
        .from(inquiries)
        .where(eq(inquiries.status, "new"))
        .get();

    return c.json({ count: result?.value ?? 0 });
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
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(inquiries.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Inquiry not found" }, 404);
    return c.json({ data: updated });
});

/**
 * DELETE /api/inquiries/:id
 * Admin endpoint — permanently delete an inquiry.
 */
inquiriesRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const deleted = await db
        .delete(inquiries)
        .where(eq(inquiries.id, id))
        .returning()
        .get();

    if (!deleted) return c.json({ error: "Inquiry not found" }, 404);
    return c.json({ data: { id: deleted.id }, message: "Inquiry deleted successfully" });
});

/**
 * GET /api/inquiries/:id/messages
 * Admin endpoint — list messages for a specific inquiry.
 */
inquiriesRoute.get("/:id/messages", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const { inquiryMessages } = await import("@forlabs/db/schema");

    const messages = await db
        .select()
        .from(inquiryMessages)
        .where(eq(inquiryMessages.inquiry_id, id))
        .orderBy(inquiryMessages.created_at)
        .all();

    return c.json({ data: messages });
});

/**
 * POST /api/inquiries/:id/messages
 * Admin endpoint — admin replies to an inquiry.
 */
inquiriesRoute.post("/:id/messages", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    if (!body.message) {
        return c.json({ error: "Mesaj alanı zorunludur." }, 400);
    }

    const db = createDb(c.env.DB);

    const { inquiryMessages } = await import("@forlabs/db/schema");

    const newMsg = await db
        .insert(inquiryMessages)
        .values({
            inquiry_id: id,
            sender: "admin",
            message: body.message,
        })
        .returning()
        .get();

    // Reset status to replied
    await db
        .update(inquiries)
        .set({ status: "replied", updated_at: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(inquiries.id, id));

    return c.json({ data: newMsg, message: "Mesaj gönderildi." }, 201);
});

export default inquiriesRoute;
