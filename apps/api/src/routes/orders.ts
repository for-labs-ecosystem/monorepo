import { Hono } from "hono";
import { eq, sql, and, or, like, count, isNull } from "drizzle-orm";
import { orders, orderItems } from "@forlabs/db/schema";
import { createDb } from "../lib/db";

type Env = {
    Bindings: { DB: D1Database };
    Variables: { siteId: number };
};

const ordersRoute = new Hono<Env>();

/**
 * GET /api/orders
 * Admin: list orders with filtering by site, status, payment_status, search.
 */
ordersRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const siteParam = c.req.query("site_id");
    const statusParam = c.req.query("status");
    const paymentParam = c.req.query("payment_status");
    const searchParam = c.req.query("search");

    const conditions: any[] = [];

    // Site filter
    if (siteParam === "all") {
        // no filter
    } else if (siteParam) {
        conditions.push(eq(orders.site_id, Number(siteParam)));
    } else {
        conditions.push(eq(orders.site_id, siteId));
    }

    // Order status filter
    if (statusParam && statusParam !== "all" && statusParam !== "undefined") {
        conditions.push(eq(orders.status, statusParam as any));
    }

    // Payment status filter
    if (paymentParam && paymentParam !== "all" && paymentParam !== "undefined") {
        conditions.push(eq(orders.payment_status, paymentParam as any));
    }

    // Search
    if (searchParam) {
        conditions.push(
            or(
                like(orders.order_number, `%${searchParam}%`),
                like(orders.customer_name, `%${searchParam}%`),
                like(orders.customer_email, `%${searchParam}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(sql`${orders.created_at} DESC`);

    return c.json({ data: result, count: result.length });
});

/**
 * GET /api/orders/pending-count
 * Returns count of unseen orders (seen_at IS NULL).
 */
ordersRoute.get("/pending-count", async (c) => {
    const db = createDb(c.env.DB);

    const result = await db
        .select({ value: count() })
        .from(orders)
        .where(isNull(orders.seen_at))
        .get();

    return c.json({ count: result?.value ?? 0 });
});

/**
 * GET /api/orders/:id
 * Admin: get single order with parsed items.
 */
ordersRoute.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .get();

    if (!order) return c.json({ error: "Order not found" }, 404);

    // Auto-mark as seen on first view
    if (!order.seen_at) {
        await db
            .update(orders)
            .set({ seen_at: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(orders.id, id));
    }

    // Parse items JSON for convenience
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
 * PATCH /api/orders/:id
 * Admin: update order status, payment_status, admin_notes.
 */
ordersRoute.patch("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updates: Record<string, any> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    if (body.status) updates.status = body.status;
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.tracking_number !== undefined) updates.notes = body.tracking_number;

    const updated = await db
        .update(orders)
        .set(updates)
        .where(eq(orders.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Order not found" }, 404);
    return c.json({ data: updated });
});

/**
 * DELETE /api/orders/:id
 * Admin: permanently delete an order (primarily for test cleanup).
 */
ordersRoute.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const order = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, id))
        .get();

    if (!order) return c.json({ error: "Order not found" }, 404);

    // Delete related order items first
    await db.delete(orderItems).where(eq(orderItems.order_id, id));
    await db.delete(orders).where(eq(orders.id, id));

    return c.json({ message: "Sipariş başarıyla silindi.", id });
});

/**
 * GET /api/orders/:id/invoice
 * Generate a downloadable HTML invoice for a paid order.
 */
ordersRoute.get("/:id/invoice", async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .get();

    if (!order) return c.json({ error: "Order not found" }, 404);

    let parsedItems: any[] = [];
    try {
        parsedItems = JSON.parse(order.items);
    } catch {
        parsedItems = [];
    }

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: currency || "TRY",
        }).format(amount);
    };

    const date = new Date(order.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const isCorporate = order.customer_type === "corporate";

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="utf-8" />
    <title>Fatura #${order.order_number}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; padding: 40px; font-size: 13px; }
        .invoice { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .brand span { color: #6366f1; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; }
        .invoice-meta p { color: #64748b; margin-top: 4px; }
        .parties { display: flex; gap: 40px; margin-bottom: 30px; }
        .party { flex: 1; }
        .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; }
        .party-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .party p { color: #64748b; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 280px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; color: #64748b; }
        .totals .total { border-top: 2px solid #1e293b; padding-top: 8px; margin-top: 4px; font-size: 16px; font-weight: 800; color: #1e293b; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .paid { background: #ecfdf5; color: #059669; }
        .pending { background: #fefce8; color: #ca8a04; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
        @media print { body { padding: 20px; } .no-print { display: none !important; } }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <div class="brand">for<span>-labs.</span></div>
                <p style="color:#64748b; margin-top:4px;">Laboratory Intelligence Platform</p>
            </div>
            <div class="invoice-meta">
                <h2>Fatura</h2>
                <p><strong>#${order.order_number}</strong></p>
                <p>${date}</p>
                <span class="status-badge ${order.payment_status === "paid" ? "paid" : "pending"}">
                    ${order.payment_status === "paid" ? "Ödendi" : "Ödeme Bekliyor"}
                </span>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <div class="party-label">Satıcı</div>
                <div class="party-name">For-Labs Laboratuvar Teknolojileri</div>
                <p>İstanbul, Türkiye</p>
            </div>
            <div class="party">
                <div class="party-label">Alıcı</div>
                <div class="party-name">${isCorporate && order.company_name ? order.company_name : order.customer_name}</div>
                ${isCorporate ? `<p>VD: ${order.tax_office || "—"} / VN: ${order.tax_number || "—"}</p>` : ""}
                <p>${order.customer_email}</p>
                ${order.customer_phone ? `<p>${order.customer_phone}</p>` : ""}
                ${order.billing_address ? `<p>${order.billing_address}</p>` : ""}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Ürün</th>
                    <th class="text-right">Adet</th>
                    <th class="text-right">Birim Fiyat</th>
                    <th class="text-right">Toplam</th>
                </tr>
            </thead>
            <tbody>
                ${parsedItems.map((item: any, i: number) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${item.title || item.product_name || "Ürün #" + item.product_id}</strong></td>
                    <td class="text-right">${item.qty || item.quantity || 1}</td>
                    <td class="text-right">${formatPrice(item.unit_price || 0, order.currency)}</td>
                    <td class="text-right"><strong>${formatPrice(item.total_price || 0, order.currency)}</strong></td>
                </tr>`).join("")}
            </tbody>
        </table>

        <div class="totals">
            <div class="row"><span>Ara Toplam</span><span>${formatPrice(order.subtotal, order.currency)}</span></div>
            <div class="row"><span>KDV (%20)</span><span>${formatPrice(order.tax, order.currency)}</span></div>
            <div class="row total"><span>Genel Toplam</span><span>${formatPrice(order.total, order.currency)}</span></div>
        </div>

        ${order.shipping_address ? `<div style="margin-top:24px;padding:12px;background:#f8fafc;border-radius:8px;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Teslimat Adresi</strong><p style="margin-top:4px;color:#475569;">${order.shipping_address}</p></div>` : ""}

        <div class="footer">
            <p>Bu belge For-Labs Laboratuvar Teknolojileri tarafından elektronik ortamda oluşturulmuştur.</p>
            <p style="margin-top:4px;">for-labs.com — info@for-labs.com</p>
        </div>
    </div>
    <div class="no-print" style="text-align:center;margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">Yazdır / PDF İndir</button>
    </div>
</body>
</html>`;

    return c.html(html);
});

export default ordersRoute;
