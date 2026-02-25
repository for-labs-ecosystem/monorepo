import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { users } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const authRoute = new Hono();

/**
 * POST /api/auth/login
 * Admin login — returns a JWT token.
 * For MVP, uses a simple password check.
 * In production, use proper bcrypt/argon2 hashing.
 */
authRoute.post("/login", async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
        return c.json({ error: "Email and password are required" }, 400);
    }

    const db = createDb(c.env.DB);
    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .get();

    if (!user || !user.is_active) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    // MVP: simple hash comparison
    // In production, use Web Crypto API with PBKDF2 or external bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (user.password_hash !== hashHex) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate JWT using Web Crypto API (Edge-compatible)
    const jwtSecret = (c.env as any).JWT_SECRET || "forlabs-dev-secret-change-in-prod";

    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(
        JSON.stringify({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: now,
            exp: now + 86400, // 24 hours
        })
    )
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(`${header}.${payload}`)
    );

    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const token = `${header}.${payload}.${sig}`;

    return c.json({
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        },
    });
});

/**
 * GET /api/auth/me
 * Get current user info from token.
 */
authRoute.get("/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = (c.env as any).JWT_SECRET || "forlabs-dev-secret-change-in-prod";

    try {
        const [header, payload, sig] = token.split(".");

        // Verify signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(jwtSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        // Decode signature
        const sigPadded = sig.replace(/-/g, "+").replace(/_/g, "/");
        const sigBinary = atob(sigPadded);
        const sigArray = new Uint8Array(sigBinary.length);
        for (let i = 0; i < sigBinary.length; i++) {
            sigArray[i] = sigBinary.charCodeAt(i);
        }

        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigArray,
            encoder.encode(`${header}.${payload}`)
        );

        if (!valid) {
            return c.json({ error: "Invalid token" }, 401);
        }

        const payloadPadded = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(payloadPadded));

        // Check expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return c.json({ error: "Token expired" }, 401);
        }

        return c.json({
            data: {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
            },
        });
    } catch {
        return c.json({ error: "Invalid token" }, 401);
    }
});

export default authRoute;
