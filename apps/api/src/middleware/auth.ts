import type { Context, Next } from "hono";
import { verifyJwt } from "../lib/jwt";

/**
 * JWT auth guard for protected admin endpoints.
 * Verifies the Bearer token and attaches decoded user info to context.
 */
export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = (c.env as any).JWT_SECRET || "forlabs-dev-secret-change-in-prod";

    const decoded = await verifyJwt(token, jwtSecret);
    if (!decoded) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }

    (c as any)._authUser = decoded;
    await next();
}
