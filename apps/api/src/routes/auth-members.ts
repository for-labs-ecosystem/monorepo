import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { members, orders, inquiries, inquiryMessages } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/password";
import { signJwt, verifyJwt } from "../lib/jwt";

type Env = {
    Bindings: { DB: D1Database; JWT_SECRET?: string };
    Variables: { siteId: number };
};

const memberAuthRoute = new Hono<Env>();

const JWT_DEFAULT_SECRET = "forlabs-dev-secret-change-in-prod";

function generateId(): string {
    return crypto.randomUUID();
}

/**
 * POST /api/member-auth/register
 * Public: register a new member account.
 */
memberAuthRoute.post("/register", async (c) => {
    const siteId = c.get("siteId");
    const body = await c.req.json();
    const { email, password, full_name, phone, company_name } = body;

    if (!email || !password || !full_name) {
        return c.json(
            { error: "E-posta, şifre ve ad soyad alanları zorunludur." },
            400
        );
    }

    if (password.length < 6) {
        return c.json(
            { error: "Şifre en az 6 karakter olmalıdır." },
            400
        );
    }

    const db = createDb(c.env.DB);

    // Check for existing email
    const existing = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.email, email.toLowerCase().trim()))
        .get();

    if (existing) {
        return c.json(
            { error: "Bu e-posta adresi zaten kayıtlı." },
            409
        );
    }

    const password_hash = await hashPassword(password);
    const id = generateId();

    const newMember = await db
        .insert(members)
        .values({
            id,
            site_id: siteId,
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

    // Issue JWT token
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const token = await signJwt(
        {
            sub: newMember.id,
            email: newMember.email,
            type: "member", // distinguish from admin tokens
        },
        jwtSecret,
        60 * 60 * 24 * 7 // 7 days
    );

    return c.json({
        data: {
            token,
            member: {
                id: newMember.id,
                full_name: newMember.full_name,
                email: newMember.email,
                phone: newMember.phone,
                company_name: newMember.company_name,
                is_active: newMember.is_active,
                addresses: newMember.addresses,
                cart_data: newMember.cart_data,
                favorite_products: newMember.favorite_products,
                favorite_articles: newMember.favorite_articles,
            },
        },
    });
});

/**
 * POST /api/member-auth/login
 * Public: authenticate with email + password.
 */
memberAuthRoute.post("/login", async (c) => {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
        return c.json(
            { error: "E-posta ve şifre alanları zorunludur." },
            400
        );
    }

    const db = createDb(c.env.DB);

    const member = await db
        .select()
        .from(members)
        .where(eq(members.email, email.toLowerCase().trim()))
        .get();

    if (!member) {
        return c.json(
            { error: "E-posta veya şifre hatalı." },
            401
        );
    }

    if (!member.is_active) {
        return c.json(
            { error: "Hesabınız devre dışı bırakılmıştır." },
            403
        );
    }

    if (!member.password_hash) {
        return c.json(
            {
                error: "Bu hesap Google ile kayıt olmuştur. Lütfen Google ile giriş yapın.",
            },
            400
        );
    }

    const valid = await verifyPassword(password, member.password_hash);
    if (!valid) {
        return c.json(
            { error: "E-posta veya şifre hatalı." },
            401
        );
    }

    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const token = await signJwt(
        {
            sub: member.id,
            email: member.email,
            type: "member",
        },
        jwtSecret,
        60 * 60 * 24 * 7 // 7 days
    );

    return c.json({
        data: {
            token,
            member: {
                id: member.id,
                full_name: member.full_name,
                email: member.email,
                phone: member.phone,
                company_name: member.company_name,
                is_active: member.is_active,
                addresses: member.addresses,
                cart_data: member.cart_data,
                favorite_products: member.favorite_products,
                favorite_articles: member.favorite_articles,
            },
        },
    });
});

/**
 * GET /api/member-auth/me
 * Protected: get current member's full profile (addresses, cart, favorites).
 */
memberAuthRoute.get("/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

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
            addresses: members.addresses,
            cart_data: members.cart_data,
            favorite_products: members.favorite_products,
            favorite_articles: members.favorite_articles,
            created_at: members.created_at,
            updated_at: members.updated_at,
        })
        .from(members)
        .where(eq(members.id, decoded.sub as string))
        .get();

    if (!member) {
        return c.json({ error: "Üye bulunamadı." }, 404);
    }

    return c.json({ data: member });
});

/**
 * PUT /api/member-auth/profile
 * Protected: update own profile data.
 */
memberAuthRoute.put("/profile", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const body = await c.req.json();
    const db = createDb(c.env.DB);
    const updates: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.company_name !== undefined) updates.company_name = body.company_name;
    if (body.addresses !== undefined) updates.addresses = body.addresses;
    if (body.favorite_products !== undefined) updates.favorite_products = body.favorite_products;
    if (body.favorite_articles !== undefined) updates.favorite_articles = body.favorite_articles;
    if (body.cart_data !== undefined) updates.cart_data = body.cart_data;

    const updated = await db
        .update(members)
        .set(updates)
        .where(eq(members.id, decoded.sub as string))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Üye bulunamadı." }, 404);

    return c.json({
        data: {
            id: updated.id,
            site_id: updated.site_id,
            full_name: updated.full_name,
            email: updated.email,
            phone: updated.phone,
            company_name: updated.company_name,
            is_active: updated.is_active,
            addresses: updated.addresses,
            cart_data: updated.cart_data,
            favorite_products: updated.favorite_products,
            favorite_articles: updated.favorite_articles,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
        },
    });
});

/**
 * GET /api/member-auth/orders
 * Protected: list orders for the logged-in member (matched by email).
 */
memberAuthRoute.get("/orders", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const siteId = c.get("siteId");

    // Get member email
    const member = await db
        .select({ email: members.email })
        .from(members)
        .where(eq(members.id, decoded.sub as string))
        .get();

    if (!member) {
        return c.json({ error: "Üye bulunamadı." }, 404);
    }

    // Fetch orders by email + site_id
    const memberOrders = await db
        .select({
            id: orders.id,
            order_number: orders.order_number,
            status: orders.status,
            payment_status: orders.payment_status,
            total: orders.total,
            currency: orders.currency,
            items: orders.items,
            created_at: orders.created_at,
            customer_name: orders.customer_name,
            shipping_address: orders.shipping_address,
        })
        .from(orders)
        .where(
            and(
                eq(orders.customer_email, member.email),
                eq(orders.site_id, siteId)
            )
        )
        .orderBy(desc(orders.created_at))
        .all();

    return c.json({ data: memberOrders });
});

/**
 * GET /api/member-auth/orders/:id
 * Protected: get single order detail for the logged-in member.
 */
memberAuthRoute.get("/orders/:id", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const orderId = Number(c.req.param("id"));

    // Get member email
    const member = await db
        .select({ email: members.email })
        .from(members)
        .where(eq(members.id, decoded.sub as string))
        .get();

    if (!member) {
        return c.json({ error: "Üye bulunamadı." }, 404);
    }

    // Fetch order and verify ownership
    const order = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.id, orderId),
                eq(orders.customer_email, member.email)
            )
        )
        .get();

    if (!order) {
        return c.json({ error: "Sipariş bulunamadı." }, 404);
    }

    let parsedItems: any[] = [];
    try {
        parsedItems = JSON.parse(order.items);
    } catch {
        parsedItems = [];
    }

    return c.json({
        data: {
            ...order,
            parsed_items: parsedItems,
        },
    });
});

/**
 * POST /api/member-auth/orders/:id/cancel
 * Protected: cancel own order (only if status is 'pending').
 */
memberAuthRoute.post("/orders/:id/cancel", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const orderId = Number(c.req.param("id"));

    // Get member email
    const member = await db
        .select({ email: members.email })
        .from(members)
        .where(eq(members.id, decoded.sub as string))
        .get();

    if (!member) {
        return c.json({ error: "Üye bulunamadı." }, 404);
    }

    // Fetch order and verify ownership
    const order = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.id, orderId),
                eq(orders.customer_email, member.email)
            )
        )
        .get();

    if (!order) {
        return c.json({ error: "Sipariş bulunamadı." }, 404);
    }

    // Only allow cancel if order status is 'pending'
    if (order.status !== "pending") {
        return c.json(
            {
                error:
                    "Bu sipariş şu an iptal edilemez. Yalnızca 'Bekliyor' durumundaki siparişler iptal edilebilir.",
            },
            400
        );
    }

    const updated = await db
        .update(orders)
        .set({
            status: "cancelled" as any,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(orders.id, orderId))
        .returning()
        .get();

    return c.json({ data: updated, message: "Sipariş başarıyla iptal edildi." });
});

/**
 * GET /api/member-auth/inquiries
 * Protected: list inquiries for the logged-in member.
 */
memberAuthRoute.get("/inquiries", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const siteId = c.get("siteId");

    // Fetch inquiries by member_id + site_id
    const memberInquiries = await db
        .select()
        .from(inquiries)
        .where(
            and(
                eq(inquiries.member_id, decoded.sub as string),
                eq(inquiries.site_id, siteId)
            )
        )
        .orderBy(desc(inquiries.created_at))
        .all();

    return c.json({ data: memberInquiries });
});

/**
 * DELETE /api/member-auth/inquiries/:id
 * Protected: delete an inquiry owned by the logged-in member.
 */
memberAuthRoute.delete("/inquiries/:id", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const inquiryId = Number(c.req.param("id"));
    const siteId = c.get("siteId");

    const inquiry = await db
        .select({ id: inquiries.id })
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, inquiryId),
                eq(inquiries.member_id, decoded.sub as string),
                eq(inquiries.site_id, siteId)
            )
        )
        .get();

    if (!inquiry) {
        return c.json({ error: "Talep bulunamadı." }, 404);
    }

    await db.delete(inquiries).where(eq(inquiries.id, inquiryId));

    return c.json({ success: true, message: "Talep silindi." });
});

/**
 * GET /api/member-auth/inquiries/:id/messages
 * Protected: list messages for a specific inquiry.
 */
memberAuthRoute.get("/inquiries/:id/messages", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const inquiryId = Number(c.req.param("id"));

    // Verify ownership
    const inquiry = await db
        .select()
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, inquiryId),
                eq(inquiries.member_id, decoded.sub as string)
            )
        )
        .get();

    if (!inquiry) {
        return c.json({ error: "Talep bulunamadı." }, 404);
    }

    const messages = await db
        .select()
        .from(inquiryMessages)
        .where(eq(inquiryMessages.inquiry_id, inquiryId))
        .orderBy(inquiryMessages.created_at)
        .all();

    return c.json({ data: messages });
});

/**
 * POST /api/member-auth/inquiries/:id/messages
 * Protected: user replies to an inquiry.
 */
memberAuthRoute.post("/inquiries/:id/messages", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const body = await c.req.json();
    if (!body.message) {
        return c.json({ error: "Mesaj alanı zorunludur." }, 400);
    }

    const db = createDb(c.env.DB);
    const inquiryId = Number(c.req.param("id"));

    // Verify ownership
    const inquiry = await db
        .select()
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, inquiryId),
                eq(inquiries.member_id, decoded.sub as string)
            )
        )
        .get();

    if (!inquiry) {
        return c.json({ error: "Talep bulunamadı." }, 404);
    }

    const newMsg = await db
        .insert(inquiryMessages)
        .values({
            inquiry_id: inquiryId,
            sender: "user",
            message: body.message,
        })
        .returning()
        .get();

    // Reset status to unread (new)
    await db
        .update(inquiries)
        .set({ status: "new", updated_at: sql`(CURRENT_TIMESTAMP)` })
        .where(eq(inquiries.id, inquiryId));

    return c.json({ data: newMsg, message: "Mesaj gönderildi." }, 201);
});

/**
 * PATCH /api/member-auth/inquiries/:id/read
 * Protected: mark an inquiry as read by the member.
 */
memberAuthRoute.patch("/inquiries/:id/read", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = c.env.JWT_SECRET || JWT_DEFAULT_SECRET;
    const decoded = await verifyJwt(token, jwtSecret);

    if (!decoded || decoded.type !== "member") {
        return c.json({ error: "Geçersiz veya süresi dolmuş token." }, 401);
    }

    const db = createDb(c.env.DB);
    const inquiryId = Number(c.req.param("id"));

    // Verify ownership
    const inquiry = await db
        .select()
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, inquiryId),
                eq(inquiries.member_id, decoded.sub as string)
            )
        )
        .get();

    if (!inquiry) {
        return c.json({ error: "Talep bulunamadı." }, 404);
    }

    // Only update to read if it's currently replied
    if (inquiry.status === "replied") {
        await db
            .update(inquiries)
            .set({ status: "read", updated_at: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(inquiries.id, inquiryId));
    }

    return c.json({ success: true });
});

/**
 * GET /api/member-auth/google?site_id=N&redirect_uri=...
 * Public: redirect to Google OAuth consent screen.
 */
memberAuthRoute.get("/google", async (c) => {
    const clientId = (c.env as any).GOOGLE_CLIENT_ID;
    if (!clientId) {
        return c.json({ error: "Google OAuth yapılandırılmamış." }, 500);
    }

    const siteId = c.req.query("site_id") || "1";
    const redirectUri = (c.env as any).GOOGLE_MEMBER_REDIRECT_URI || (c.env as any).GOOGLE_REDIRECT_URI;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: siteId,
        access_type: "offline",
        prompt: "select_account",
    });

    return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/**
 * GET /api/member-auth/google/callback?code=...&state=site_id
 * Public: exchange code for tokens, upsert member, issue JWT, redirect to frontend.
 */
memberAuthRoute.get("/google/callback", async (c) => {
    const code = c.req.query("code");
    const rawState = decodeURIComponent(c.req.query("state") || "1");

    // state format: "siteId:returnUrl" or legacy "siteId"
    const colonIdx = rawState.indexOf(":");
    const siteId = colonIdx > -1 ? Number(rawState.slice(0, colonIdx)) : Number(rawState);
    const returnBase = colonIdx > -1 ? rawState.slice(colonIdx + 1) : null;

    const clientId = (c.env as any).GOOGLE_CLIENT_ID;
    const clientSecret = (c.env as any).GOOGLE_CLIENT_SECRET;
    const redirectUri = (c.env as any).GOOGLE_MEMBER_REDIRECT_URI || (c.env as any).GOOGLE_REDIRECT_URI;
    const defaultFrontendUrl = (c.env as any).MEMBER_FRONTEND_URL || "https://forlabs-web.pages.dev";
    const frontendUrl = returnBase || defaultFrontendUrl;

    // callbackUrl is the exact page that will receive token or error (e.g. https://forlabs-atagotr.pages.dev/auth/callback)
    const callbackUrl = frontendUrl;

    if (!code) {
        return c.redirect(`${callbackUrl}?error=oauth_cancelled`);
    }

    if (!clientId || !clientSecret) {
        return c.redirect(`${callbackUrl}?error=oauth_config`);
    }

    try {
        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json() as any;
        if (!tokenRes.ok || !tokenData.access_token) {
            return c.redirect(`${callbackUrl}?error=oauth_token`);
        }

        // Get user info from Google
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userRes.json() as any;
        if (!googleUser.email) {
            return c.redirect(`${callbackUrl}?error=oauth_userinfo`);
        }

        const db = createDb(c.env.DB);
        const jwtSecret = (c.env as any).JWT_SECRET || JWT_DEFAULT_SECRET;

        // Upsert member
        let member = await db
            .select()
            .from(members)
            .where(eq(members.email, googleUser.email.toLowerCase()))
            .get();

        if (!member) {
            const id = generateId();
            member = await db
                .insert(members)
                .values({
                    id,
                    site_id: siteId,
                    full_name: googleUser.name || googleUser.email,
                    email: googleUser.email.toLowerCase(),
                    password_hash: null,
                    phone: null,
                    company_name: null,
                    is_active: 1,
                    addresses: null,
                    cart_data: null,
                    favorite_products: null,
                    favorite_articles: null,
                })
                .returning()
                .get();
        }

        if (!member.is_active) {
            return c.redirect(`${callbackUrl}?error=account_disabled`);
        }

        const token = await signJwt(
            { sub: member.id, email: member.email, type: "member" },
            jwtSecret,
            60 * 60 * 24 * 7
        );

        return c.redirect(`${callbackUrl}?token=${token}`);
    } catch (err) {
        console.error("Google OAuth error:", err);
        return c.redirect(`${callbackUrl}?error=oauth_error`);
    }
});

export default memberAuthRoute;
