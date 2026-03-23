import { Hono } from "hono";
import { eq, sql, and, or, like, desc } from "drizzle-orm";
import { members, orders } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import { hashPassword } from "../lib/password";

type Env = {
    Bindings: { DB: D1Database };
    Variables: { siteId: number };
};

const membersRoute = new Hono<Env>();

// All member management endpoints require admin auth
membersRoute.use("*", authMiddleware);

/**
 * GET /api/members
 * Admin: list members with filtering by site_id, search, active status.
 * Supports ?site_id=all to list across all tenants.
 */
membersRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const siteParam = c.req.query("site_id");
    const searchParam = c.req.query("search");
    const activeParam = c.req.query("is_active");

    const conditions: any[] = [];

    // Site filter
    if (siteParam === "all") {
        // no filter — list across all tenants
    } else if (siteParam) {
        conditions.push(eq(members.site_id, Number(siteParam)));
    } else {
        conditions.push(eq(members.site_id, siteId));
    }

    // Active status filter
    if (activeParam !== undefined && activeParam !== "all") {
        conditions.push(eq(members.is_active, Number(activeParam)));
    }

    // Search by name, email, company
    if (searchParam) {
        conditions.push(
            or(
                like(members.full_name, `%${searchParam}%`),
                like(members.email, `%${searchParam}%`),
                like(members.company_name, `%${searchParam}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select({
            id: members.id,
            site_id: members.site_id,
            full_name: members.full_name,
            email: members.email,
            phone: members.phone,
            company_name: members.company_name,
            is_active: members.is_active,
            // Auth method indicators (never return actual hashes!)
            has_password: sql<number>`CASE WHEN ${members.password_hash} IS NOT NULL THEN 1 ELSE 0 END`,
            has_google: sql<number>`CASE WHEN ${members.google_id} IS NOT NULL THEN 1 ELSE 0 END`,
            addresses: members.addresses,
            cart_data: members.cart_data,
            favorite_products: members.favorite_products,
            favorite_articles: members.favorite_articles,
            created_at: members.created_at,
            updated_at: members.updated_at,
        })
        .from(members)
        .where(whereClause)
        .orderBy(sql`${members.created_at} DESC`);

    return c.json({ data: result, count: result.length });
});

/**
 * POST /api/members
 * Admin: create a new member (with password hash).
 */
membersRoute.post("/", async (c) => {
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const { full_name, email, password, phone, company_name, site_id } = body;

    if (!full_name || !email || !password || !site_id) {
        return c.json(
            { error: "Ad soyad, e-posta, şifre ve site alanları zorunludur." },
            400
        );
    }

    // Check duplicate
    const existing = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.email, email.toLowerCase().trim()))
        .get();

    if (existing) {
        return c.json({ error: "Bu e-posta adresi zaten kayıtlı." }, 409);
    }

    const password_hash = await hashPassword(password);
    const id = crypto.randomUUID();

    const created = await db
        .insert(members)
        .values({
            id,
            site_id: Number(site_id),
            full_name: full_name.trim(),
            email: email.toLowerCase().trim(),
            password_hash,
            phone: phone?.trim() || null,
            company_name: company_name?.trim() || null,
            is_active: 1,
            addresses: null,
            cart_data: null,
            favorite_products: null,
            favorite_articles: null,
        })
        .returning()
        .get();

    return c.json({ data: created }, 201);
});

/**
 * GET /api/members/:id
 * Admin: get single member detail.
 * NEVER returns password_hash or google_id for security.
 */
membersRoute.get("/:id", async (c) => {
    const id = c.req.param("id");
    const db = createDb(c.env.DB);

    const member = await db
        .select({
            id: members.id,
            site_id: members.site_id,
            full_name: members.full_name,
            email: members.email,
            phone: members.phone,
            company_name: members.company_name,
            is_active: members.is_active,
            has_password: sql<number>`CASE WHEN ${members.password_hash} IS NOT NULL THEN 1 ELSE 0 END`,
            has_google: sql<number>`CASE WHEN ${members.google_id} IS NOT NULL THEN 1 ELSE 0 END`,
            addresses: members.addresses,
            cart_data: members.cart_data,
            favorite_products: members.favorite_products,
            favorite_articles: members.favorite_articles,
            created_at: members.created_at,
            updated_at: members.updated_at,
        })
        .from(members)
        .where(eq(members.id, id))
        .get();

    if (!member) return c.json({ error: "Member not found" }, 404);

    return c.json({ data: member });
});

/**
 * GET /api/members/:id/orders
 * Admin: list orders associated with this member (matched by email).
 */
membersRoute.get("/:id/orders", async (c) => {
    const id = c.req.param("id");
    const db = createDb(c.env.DB);

    const member = await db
        .select({ email: members.email })
        .from(members)
        .where(eq(members.id, id))
        .get();

    if (!member) return c.json({ error: "Member not found" }, 404);

    const memberOrders = await db
        .select({
            id: orders.id,
            order_number: orders.order_number,
            status: orders.status,
            payment_status: orders.payment_status,
            total: orders.total,
            currency: orders.currency,
            created_at: orders.created_at,
        })
        .from(orders)
        .where(eq(orders.customer_email, member.email))
        .orderBy(desc(orders.created_at))
        .all();

    return c.json({ data: memberOrders });
});

/**
 * PUT /api/members/:id/reset-password
 * Admin: set a new password for a member.
 */
membersRoute.put("/:id/reset-password", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const { password } = body;
    if (!password || password.length < 6) {
        return c.json({ error: "Şifre en az 6 karakter olmalıdır." }, 400);
    }

    const password_hash = await hashPassword(password);

    const updated = await db
        .update(members)
        .set({
            password_hash,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(members.id, id))
        .returning({ id: members.id })
        .get();

    if (!updated) return c.json({ error: "Member not found" }, 404);

    return c.json({ message: "Şifre başarıyla sıfırlandı." });
});

/**
 * PUT /api/members/:id
 * Admin: update member info / active status.
 * NEVER allows changing password_hash or google_id from admin panel.
 */
membersRoute.put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updates: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    // Allowed fields for admin update
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.company_name !== undefined) updates.company_name = body.company_name;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.addresses !== undefined) updates.addresses = body.addresses;

    const updated = await db
        .update(members)
        .set(updates)
        .where(eq(members.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Member not found" }, 404);

    return c.json({ data: updated });
});

/**
 * DELETE /api/members/:id
 * Admin: permanently delete a member.
 * This is intentionally destructive — use with caution.
 */
membersRoute.delete("/:id", async (c) => {
    const id = c.req.param("id");
    const db = createDb(c.env.DB);

    const member = await db
        .select({ id: members.id, full_name: members.full_name })
        .from(members)
        .where(eq(members.id, id))
        .get();

    if (!member) return c.json({ error: "Member not found" }, 404);

    await db.delete(members).where(eq(members.id, id));

    return c.json({ message: "Üye başarıyla silindi.", id });
});

export default membersRoute;
