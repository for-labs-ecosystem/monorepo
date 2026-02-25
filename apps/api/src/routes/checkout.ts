import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { orders, products, sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

const checkoutRoute = new Hono();

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

    for (const item of body.items) {
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, item.product_id))
            .get();

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

    // Calculate tax (KDV 20%)
    const taxRate = 0.20;
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
            shipping_address: body.shipping_address || null,
            items: JSON.stringify(orderItems),
            subtotal,
            tax,
            total,
            currency: "TRY",
            payment_status: "pending",
            status: "pending",
        })
        .returning()
        .get();

    // ─── Iyzico Hosted Checkout Form Request ───
    // In production, this calls the Iyzico API:
    //   POST https://api.iyzipay.com/payment/iyzipos/initialize3ds/ecom
    // For now, return the order details needed for frontend integration.

    const iyzicoApiKey = (c.env as any).IYZICO_API_KEY;
    const iyzicoSecretKey = (c.env as any).IYZICO_SECRET_KEY;

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
        currency: "TRY",
        basketId: order.order_number,
        paymentGroup: "PRODUCT",
        callbackUrl: `${c.req.url.replace("/initialize", "/webhook")}`,
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
            id: `ITEM-${item.product_id}`,
            name: item.title,
            category1: "Lab Equipment",
            itemType: "PHYSICAL",
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
            "https://api.iyzipay.com/payment/pay-with-iyzico/initialize",
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
    const body = await c.req.json();

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

    // ─── Verify payment with Iyzico Retrieve API ───
    const iyzicoApiKey = (c.env as any).IYZICO_API_KEY;
    const iyzicoSecretKey = (c.env as any).IYZICO_SECRET_KEY;

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
                "https://api.iyzipay.com/payment/pay-with-iyzico/retrieve",
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

                return c.json({ status: "ok", order_number: order.order_number });
            } else {
                await db
                    .update(orders)
                    .set({
                        payment_status: "failed",
                        updated_at: sql`(CURRENT_TIMESTAMP)`,
                    })
                    .where(eq(orders.id, order.id));

                return c.json({ status: "failed", order_number: order.order_number });
            }
        } catch (err) {
            console.error("Iyzico retrieve failed:", err);
            return c.json({ error: "Verification failed" }, 500);
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

    return c.json({ status: "ok", order_number: order.order_number });
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

export default checkoutRoute;
