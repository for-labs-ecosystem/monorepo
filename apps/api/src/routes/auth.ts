import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { users } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { signJwt, verifyJwt } from "../lib/jwt";

const authRoute = new Hono();

/**
 * GET /api/auth/google/url
 * Returns the Google OAuth consent URL for the frontend to redirect to.
 */
authRoute.get("/google/url", async (c) => {
    const clientId = (c.env as any).GOOGLE_CLIENT_ID;
    const redirectUri = (c.env as any).GOOGLE_REDIRECT_URI || "http://localhost:5173/login/callback";

    if (!clientId) {
        return c.json({ error: "Google OAuth not configured" }, 500);
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
    });

    return c.json({ data: { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` } });
});

/**
 * POST /api/auth/google/callback
 * Exchanges Google auth code for user info, checks DB whitelist, returns JWT.
 */
authRoute.post("/google/callback", async (c) => {
    const { code, redirect_uri } = await c.req.json();

    if (!code) {
        return c.json({ error: "Authorization code is required" }, 400);
    }

    const clientId = (c.env as any).GOOGLE_CLIENT_ID;
    const clientSecret = (c.env as any).GOOGLE_CLIENT_SECRET;
    const finalRedirectUri = redirect_uri || (c.env as any).GOOGLE_REDIRECT_URI || "http://localhost:5173/login/callback";

    if (!clientId || !clientSecret) {
        return c.json({ error: "Google OAuth not configured" }, 500);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: finalRedirectUri,
            grant_type: "authorization_code",
        }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
        return c.json({ error: "Google authentication failed" }, 401);
    }

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser: any = await userInfoRes.json();
    if (!googleUser.email) {
        return c.json({ error: "Could not retrieve email from Google" }, 401);
    }

    // Check if user is authorized in our DB
    const db = createDb(c.env.DB);
    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email.toLowerCase()))
        .get();

    if (!user) {
        return c.json({
            error: "Bu e-posta adresi sisteme kayıtlı değil. Yöneticinizden yetkilendirme talep edin.",
        }, 403);
    }

    if (!user.is_active) {
        return c.json({
            error: "Hesabınız askıya alınmış. Lütfen yöneticinizle iletişime geçin.",
        }, 403);
    }

    // Update name, avatar, last_login on every login
    const now = new Date().toISOString();
    await db
        .update(users)
        .set({
            name: googleUser.name || user.name,
            avatar_url: googleUser.picture || user.avatar_url,
            last_login: now,
        })
        .where(eq(users.id, user.id))
        .run();

    // Generate JWT
    const jwtSecret = (c.env as any).JWT_SECRET || "forlabs-dev-secret-change-in-prod";
    const token = await signJwt(
        {
            sub: user.id,
            email: user.email,
            name: googleUser.name || user.name,
            avatar_url: googleUser.picture || user.avatar_url,
            role: user.role,
        },
        jwtSecret
    );

    return c.json({
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: googleUser.name || user.name,
                avatar_url: googleUser.picture || user.avatar_url,
                role: user.role,
            },
        },
    });
});

/**
 * GET /api/auth/me
 * Get current user info from JWT token.
 */
authRoute.get("/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = (c.env as any).JWT_SECRET || "forlabs-dev-secret-change-in-prod";

    try {
        const decoded = await verifyJwt(token, jwtSecret);
        if (!decoded) {
            return c.json({ error: "Invalid token" }, 401);
        }

        return c.json({
            data: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                avatar_url: decoded.avatar_url,
                role: decoded.role,
            },
        });
    } catch {
        return c.json({ error: "Invalid token" }, 401);
    }
});

export default authRoute;
