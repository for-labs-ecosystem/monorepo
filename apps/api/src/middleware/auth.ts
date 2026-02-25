import type { Context, Next } from "hono";

/**
 * Simple JWT auth guard placeholder.
 * In Faz 2, this will verify JWT tokens for admin endpoints.
 * For now, it passes through for development.
 */
export async function authMiddleware(c: Context, next: Next) {
    // TODO: Implement JWT verification in Faz 2
    // const token = c.req.header("Authorization")?.replace("Bearer ", "");
    // if (!token) return c.json({ error: "Unauthorized" }, 401);
    // const payload = await verifyJwt(token, c.env.JWT_SECRET);
    // c.set("userId", payload.sub);
    await next();
}
