import { Hono } from "hono";
import type { Context, Next } from "hono";
import { eq, desc } from "drizzle-orm";
import { users } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { verifyJwt } from "../lib/jwt";

type Env = { Bindings: { DB: D1Database; JWT_SECRET?: string } };

const usersRoute = new Hono<Env>();

/**
 * Auth guard — ensures only super_admin can manage users.
 */
async function requireSuperAdmin(c: Context<Env>, next: Next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || "forlabs-dev-secret-change-in-prod";
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded) {
        return c.json({ error: "Invalid token" }, 401);
    }

    if (decoded.role !== "super_admin") {
        return c.json({ error: "Bu işlem için Super Admin yetkisi gereklidir" }, 403);
    }

    (c as any)._currentUser = decoded;
    await next();
}

/**
 * GET /api/users
 * List all users. Requires super_admin.
 */
usersRoute.get("/", requireSuperAdmin, async (c) => {
    const db = createDb(c.env.DB);
    const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.created_at))
        .all();

    return c.json({ data: allUsers, count: allUsers.length });
});

/**
 * POST /api/users
 * Authorize a new user (email + role only). Requires super_admin.
 */
usersRoute.post("/", requireSuperAdmin, async (c) => {
    const body = await c.req.json();
    const { email, role } = body;

    if (!email || !email.includes("@")) {
        return c.json({ error: "Geçerli bir e-posta adresi giriniz" }, 400);
    }

    const validRoles = ["admin", "editor"];
    if (!role || !validRoles.includes(role)) {
        return c.json({ error: "Rol admin veya editor olmalıdır" }, 400);
    }

    const db = createDb(c.env.DB);

    // Check if email already exists
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .get();

    if (existing) {
        return c.json({ error: "Bu e-posta adresi zaten kayıtlı" }, 409);
    }

    const result = await db
        .insert(users)
        .values({
            email: email.toLowerCase().trim(),
            role,
        })
        .returning()
        .get();

    return c.json({ data: result }, 201);
});

/**
 * PATCH /api/users/:id
 * Update user role or is_active status. Requires super_admin.
 */
usersRoute.patch("/:id", requireSuperAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const currentUser = (c as any)._currentUser;

    const db = createDb(c.env.DB);

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .get();

    if (!user) {
        return c.json({ error: "Kullanıcı bulunamadı" }, 404);
    }

    // Prevent modifying the root super_admin account
    if (user.email === "info@for-labs.com") {
        return c.json({ error: "Root hesap değiştirilemez" }, 403);
    }

    // Prevent self-deactivation
    if (currentUser.sub === id && body.is_active === false) {
        return c.json({ error: "Kendi hesabınızı askıya alamazsınız" }, 403);
    }

    const updates: Record<string, any> = {};
    if (body.role !== undefined) {
        const validRoles = ["admin", "editor"];
        if (!validRoles.includes(body.role)) {
            return c.json({ error: "Rol admin veya editor olmalıdır" }, 400);
        }
        updates.role = body.role;
    }
    if (body.is_active !== undefined) {
        updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
        return c.json({ error: "Güncellenecek alan belirtilmedi" }, 400);
    }

    const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning()
        .get();

    return c.json({ data: result });
});

/**
 * DELETE /api/users/:id
 * Permanently delete a user. Requires super_admin.
 */
usersRoute.delete("/:id", requireSuperAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const currentUser = (c as any)._currentUser;

    const db = createDb(c.env.DB);

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .get();

    if (!user) {
        return c.json({ error: "Kullanıcı bulunamadı" }, 404);
    }

    // Prevent deleting the root super_admin account
    if (user.email === "info@for-labs.com") {
        return c.json({ error: "Root hesap silinemez" }, 403);
    }

    // Prevent self-deletion
    if (currentUser.sub === id) {
        return c.json({ error: "Kendi hesabınızı silemezsiniz" }, 403);
    }

    await db.delete(users).where(eq(users.id, id)).run();

    return c.json({ message: "Kullanıcı silindi", id });
});

export default usersRoute;
