import { Hono } from "hono";
import { eq, sql, inArray } from "drizzle-orm";
import { orders, products, sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Bindings = {
    DB: D1Database;
    IYZICO_API_KEY?: string;
    IYZICO_SECRET_KEY?: string;
};

type Variables = {
    siteId: number;
    site: any;
    user?: any;
};

const checkoutRoute = new Hono<{ Bindings: Bindings, Variables: Variables }>();

/**
 * POST /api/checkout/initialize
 *
 * Iyzico Hosted Checkout (Ortak Ödeme Sayfası) initialization.
 *
 * Flow:
 *  1. Frontend sends cart items (product_id, qty) + customer info.
 *  2. Backend verifies the site has e-commerce enabled.
 *  3. Backend recalculates totals from DB prices (NEVER trust frontend amounts).
 *  4. Backend creates a pending order in D1.
 *  5. Backend calls Iyzico API to get a payment form token/script.
 *  6. Returns the checkout form token to frontend.
 *
 * NOTE: Iyzico API keys should be stored as Worker secrets:
 *   wrangler secret put IYZICO_API_KEY
 *   wrangler secret put IYZICO_SECRET_KEY
 */
checkoutRoute.post("/initialize", async (c) => {
    const siteId = c.get("siteId") as number;
    const site = c.get("site") as any;
    const db = createDb(c.env.DB);

    // Guard: only e-commerce sites can checkout
    if (!site.has_ecommerce) {
        return c.json({ error: "E-commerce is not enabled for this site" }, 403);
    }

    const ecommerceConfig = site.ecommerce_config ? JSON.parse(site.ecommerce_config) : {};
    const taxRate = Number(ecommerceConfig.vat_rate || 20) / 100;
    const currency = ecommerceConfig.currency || "TRY";
    const iyzicoApiKey = ecommerceConfig.iyzico_api_key;
    const iyzicoSecretKey = ecommerceConfig.iyzico_secret_key;
    const iyzicoBaseUrl = (ecommerceConfig.iyzico_base_url || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");

    // Shipping rules
    const flatShippingCost = Number(ecommerceConfig.flat_shipping_cost) || 0;
    const freeShippingThreshold = Number(ecommerceConfig.free_shipping_threshold) || 0;
    // By default guest checkout is true, if explicitly false, enforce authentication
    const allowGuestCheckout = ecommerceConfig.allow_guest_checkout !== false;

    // In a fully developed auth flow, c.get("user") would exist if logged in. 
    // For now we enforce the rule explicitly.
    if (!allowGuestCheckout && !c.get("user")) {
        // Return 401 instead of 403 so frontend knows to prompt login
        return c.json({ error: "Bu sitede misafir alışverişi kapalıdır. Lütfen giriş yapın." }, 401);
    }

    const body = await c.req.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return c.json({ error: "Cart items are required" }, 400);
    }
    if (!body.customer_name || !body.customer_email) {
        return c.json({ error: "Customer name and email are required" }, 400);
    }

    // ─── CRITICAL: Recalculate totals from DB ───
    // Never trust frontend prices!
    const orderItems: Array<{
        product_id: number;
        title: string;
        qty: number;
        unit_price: number;
    }> = [];

    let subtotal = 0;

    // Batch fetch all products in one query instead of N+1
    const productIds = body.items.map((item: any) => Number(item.product_id));
    const dbProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    for (const item of body.items) {
        const product = productMap.get(Number(item.product_id));

        if (!product) {
            return c.json(
                { error: `Product with id ${item.product_id} not found` },
                404
            );
        }

        if (!product.price) {
            return c.json(
                { error: `Product "${product.title}" has no price set` },
                400
            );
        }

        const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
        const lineTotal = product.price * qty;

        orderItems.push({
            product_id: product.id,
            title: product.title,
            qty,
            unit_price: product.price,
        });

        subtotal += lineTotal;
    }

    // ─── Calculate Shipping ───
    let shippingCost = 0;
    if (flatShippingCost > 0) {
        if (freeShippingThreshold === 0 || subtotal < freeShippingThreshold) {
            shippingCost = flatShippingCost;

            // Add shipping as a line item so Iyzico accepts it and user gets a receipt
            orderItems.push({
                product_id: 0, // Special ID for shipping
                title: "Kargo Ücreti",
                qty: 1,
                unit_price: shippingCost,
            });
            subtotal += shippingCost;
        }
    }

    // Calculate tax
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Generate unique order number
    const orderNumber = `FL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // ─── Create pending order in D1 ───
    const order = await db
        .insert(orders)
        .values({
            site_id: siteId,
            order_number: orderNumber,
            customer_name: body.customer_name,
            customer_email: body.customer_email,
            customer_phone: body.customer_phone || null,
            customer_type: body.customer_type || "individual",
            company_name: body.company_name || null,
            tax_office: body.tax_office || null,
            tax_number: body.tax_number || null,
            shipping_address: body.shipping_address || null,
            billing_address: body.billing_address || null,
            items: JSON.stringify(orderItems),
            subtotal,
            tax,
            total,
            currency: currency,
            payment_status: "pending",
            status: "pending",
        })
        .returning()
        .get();

    // ─── Iyzico Hosted Checkout Form Request ───

    if (!iyzicoApiKey || !iyzicoSecretKey) {
        // Development mode: return order without Iyzico token
        return c.json(
            {
                data: {
                    order_id: order.id,
                    order_number: order.order_number,
                    total: order.total,
                    currency: order.currency,
                    items: orderItems,
                    // In production, this will contain the Iyzico checkout form script/token
                    checkout_form_content: null,
                    message:
                        "Order created. Iyzico keys not configured — set IYZICO_API_KEY and IYZICO_SECRET_KEY as Worker secrets.",
                },
            },
            201
        );
    }

    // ─── Iyzico API Call ───
    // Build Iyzico request payload
    const iyzicoPayload = {
        locale: "tr",
        conversationId: order.order_number,
        price: subtotal.toFixed(2),
        paidPrice: total.toFixed(2),
        currency: currency,
        basketId: order.order_number,
        paymentGroup: "PRODUCT",
        callbackUrl: `${c.req.url.replace("/initialize", "/webhook")}?frontend=${encodeURIComponent(c.req.header("origin") || "https://for-labs.com")}`,
        enabledInstallments: [1, 2, 3, 6],
        buyer: {
            id: `BUYER-${order.id}`,
            name: body.customer_name.split(" ")[0] || "Ad",
            surname: body.customer_name.split(" ").slice(1).join(" ") || "Soyad",
            email: body.customer_email,
            identityNumber: "11111111111", // TC placeholder — real implementation needs actual TC
            registrationAddress: body.shipping_address || "Adres belirtilmedi",
            city: "Istanbul",
            country: "Turkey",
            ip: c.req.header("cf-connecting-ip") || "127.0.0.1",
        },
        shippingAddress: {
            contactName: body.customer_name,
            city: "Istanbul",
            country: "Turkey",
            address: body.shipping_address || "Adres belirtilmedi",
        },
        billingAddress: {
            contactName: body.customer_name,
            city: "Istanbul",
            country: "Turkey",
            address: body.shipping_address || "Adres belirtilmedi",
        },
        basketItems: orderItems.map((item, index) => ({
            id: item.product_id === 0 ? "SHIPPING" : `ITEM-${item.product_id}`,
            name: item.title,
            category1: item.product_id === 0 ? "Shipping" : "Product",
            itemType: "PHYSICAL", // Iyzico requires Physical for physical goods/shipping
            price: (item.unit_price * item.qty).toFixed(2),
        })),
    };

    // ─── Iyzico HMAC Authorization Header ───
    const randomString = Math.random().toString(36).substring(2, 10);
    const hashStr = `${iyzicoApiKey}${randomString}${JSON.stringify(iyzicoPayload)}`;

    // Use Web Crypto API (Edge-compatible, no Node.js needed)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(iyzicoSecretKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(hashStr)
    );
    const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const authorizationHeader = `IYZWS ${iyzicoApiKey}:${hashBase64}`;

    try {
        const iyzicoResponse = await fetch(
            `${iyzicoBaseUrl}/payment/pay-with-iyzico/initialize`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorizationHeader,
                    "x-iyzi-rnd": randomString,
                },
                body: JSON.stringify(iyzicoPayload),
            }
        );

        const iyzicoResult = (await iyzicoResponse.json()) as any;

        if (iyzicoResult.status === "success") {
            // Store the Iyzico token for webhook verification
            await db
                .update(orders)
                .set({
                    iyzico_token: iyzicoResult.token,
                    updated_at: sql`(CURRENT_TIMESTAMP)`,
                })
                .where(eq(orders.id, order.id));

            return c.json(
                {
                    data: {
                        order_id: order.id,
                        order_number: order.order_number,
                        total: order.total,
                        currency: order.currency,
                        // The frontend renders this script to show the Iyzico payment form
                        checkout_form_content: iyzicoResult.payWithIyzicoPageUrl,
                        token: iyzicoResult.token,
                    },
                },
                201
            );
        } else {
            // Iyzico returned an error
            return c.json(
                {
                    error: "Payment initialization failed",
                    details: iyzicoResult.errorMessage || "Unknown Iyzico error",
                },
                502
            );
        }
    } catch (err) {
        console.error("Iyzico API call failed:", err);
        return c.json({ error: "Payment service unavailable" }, 503);
    }
});

/**
 * POST /api/checkout/webhook
 *
 * Iyzico Webhook / Callback endpoint.
 * Called by Iyzico after payment is completed or failed.
 * This is the ONLY place where we mark an order as "paid".
 */
checkoutRoute.post("/webhook", async (c) => {
    const db = createDb(c.env.DB);
    let body: any = {};
    const contentType = c.req.header("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
        body = await c.req.parseBody();
    } else {
        body = await c.req.json().catch(() => ({}));
    }
    const frontendUrl = c.req.query("frontend") || "https://for-labs.com";

    const token = body.token;
    if (!token) {
        return c.json({ error: "Token required" }, 400);
    }

    // Find order by Iyzico token
    const order = await db
        .select()
        .from(orders)
        .where(eq(orders.iyzico_token, token))
        .get();

    if (!order) {
        return c.json({ error: "Order not found for this token" }, 404);
    }

    // Fetch site for dynamic e-commerce config
    const site = await db.select().from(sites).where(eq(sites.id, order.site_id)).get();
    const ecommerceConfig = site?.ecommerce_config ? JSON.parse(site.ecommerce_config) : {};

    // ─── Verify payment with Iyzico Retrieve API ───
    const iyzicoApiKey = ecommerceConfig.iyzico_api_key;
    const iyzicoSecretKey = ecommerceConfig.iyzico_secret_key;
    const iyzicoBaseUrl = (ecommerceConfig.iyzico_base_url || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");

    if (iyzicoApiKey && iyzicoSecretKey) {
        try {
            const retrievePayload = {
                locale: "tr",
                conversationId: order.order_number,
                token: token,
            };

            const randomString = Math.random().toString(36).substring(2, 10);
            const hashStr = `${iyzicoApiKey}${randomString}${JSON.stringify(retrievePayload)}`;
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(iyzicoSecretKey),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(hashStr)
            );
            const hashBase64 = btoa(
                String.fromCharCode(...new Uint8Array(signature))
            );

            const iyzicoResponse = await fetch(
                `${iyzicoBaseUrl}/payment/pay-with-iyzico/retrieve`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `IYZWS ${iyzicoApiKey}:${hashBase64}`,
                        "x-iyzi-rnd": randomString,
                    },
                    body: JSON.stringify(retrievePayload),
                }
            );

            const iyzicoResult = (await iyzicoResponse.json()) as any;

            if (iyzicoResult.status === "success" && iyzicoResult.paymentStatus === "SUCCESS") {
                await db
                    .update(orders)
                    .set({
                        payment_status: "paid",
                        iyzico_payment_id: iyzicoResult.paymentId,
                        status: "processing",
                        updated_at: sql`(CURRENT_TIMESTAMP)`,
                    })
                    .where(eq(orders.id, order.id));

                return c.redirect(`${frontendUrl}/siparis-basarili?order_number=${order.order_number}`);
            } else {
                await db
                    .update(orders)
                    .set({
                        payment_status: "failed",
                        updated_at: sql`(CURRENT_TIMESTAMP)`,
                    })
                    .where(eq(orders.id, order.id));

                return c.redirect(`${frontendUrl}/odeme?error=payment_failed`);
            }
        } catch (err) {
            console.error("Iyzico retrieve failed:", err);
            return c.redirect(`${frontendUrl}/odeme?error=verification_failed`);
        }
    }

    // Development mode: directly mark as paid
    await db
        .update(orders)
        .set({
            payment_status: "paid",
            status: "processing",
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(orders.id, order.id));

    return c.redirect(`${frontendUrl}/siparis-basarili?order_number=${order.order_number}`);
});

/**
 * GET /api/checkout/orders
 * Admin: list orders for current site.
 */
checkoutRoute.get("/orders", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const result = await db
        .select()
        .from(orders)
        .where(eq(orders.site_id, siteId))
        .orderBy(sql`${orders.created_at} DESC`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/checkout/orders/:orderNumber
 * Get single order by order number.
 */
checkoutRoute.get("/orders/:orderNumber", async (c) => {
    const orderNumber = c.req.param("orderNumber");
    const db = createDb(c.env.DB);

    const order = await db
        .select()
        .from(orders)
        .where(eq(orders.order_number, orderNumber))
        .get();

    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json({ data: order });
});

/**
 * POST /api/checkout/test-iyzico
 * Admin: Test Iyzico connection with provided credentials.
 */
checkoutRoute.post("/test-iyzico", async (c) => {
    const body = await c.req.json();
    const iyzicoApiKey = body.iyzico_api_key;
    const iyzicoSecretKey = body.iyzico_secret_key;
    const iyzicoBaseUrl = (body.iyzico_base_url || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");

    if (!iyzicoApiKey || !iyzicoSecretKey) {
        return c.json({ status: "failed", message: "API Key ve Secret Key zorunludur." }, 400);
    }

    try {
        // We test using the BinNumber endpoint
        const payload = {
            locale: "tr",
            conversationId: "TEST-" + Date.now(),
            binNumber: "554960", // Meaningless valid length bin prefix
        };

        const randomString = Math.random().toString(36).substring(2, 10);
        const hashStr = `${iyzicoApiKey}${randomString}${JSON.stringify(payload)}`;

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(iyzicoSecretKey),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(hashStr));
        const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
        const authorizationHeader = `IYZWS ${iyzicoApiKey}:${hashBase64}`;

        const response = await fetch(`${iyzicoBaseUrl}/payment/bin/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authorizationHeader,
                "x-iyzi-rnd": randomString,
            },
            body: JSON.stringify(payload),
        });

        const result = (await response.json()) as any;

        if (result.status === "success" || result.errorCode === "10051") {
            // Even if bin doesn't exist, if we get a standard validation error instead of auth error, keys are correct.
            // But usually bin check returns success with empty details if bin is basically valid length.
            return c.json({ status: "ok", message: "Bağlantı başarılı! Iyzico API anahtarlarınız doğru çalışıyor." });
        } else {
            return c.json(
                { status: "failed", message: result.errorMessage || "API anahtarları geçersiz." },
                400
            );
        }
    } catch (err) {
        return c.json({ status: "error", message: "Iyzico sunucusuna ulaşılamadı. Base URL'i kontrol edin." }, 500);
    }
});
export default checkoutRoute;
