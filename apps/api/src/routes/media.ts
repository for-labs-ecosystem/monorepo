import { Hono } from "hono";
import { media, sites } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { eq, desc, inArray, sql } from "drizzle-orm";

// ─── Allowed MIME types (Enterprise-grade) ───
const ALLOWED_MIMES = new Set([
    // Images (standard + next-gen)
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif", "image/bmp", "image/tiff",
    // Video
    "video/mp4", "video/webm", "video/ogg",
    // PDF & Documents
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/msword", // doc
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    // Archives
    "application/zip", "application/x-zip-compressed",
    "application/x-rar-compressed", "application/vnd.rar",
    "application/gzip",
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

type Bindings = {
    DB: D1Database;
    MEDIA: R2Bucket;
};

type Variables = {
    siteId: number;
};

const mediaRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── GET /api/media — list media (cross-tenant capable) ───
mediaRoute.get("/", async (c) => {
    const db = createDb(c.env.DB);

    const siteIdParam = c.req.query("site_id");
    const mimeFilter = c.req.query("mime");
    const search = c.req.query("q");

    // Always fetch all, then post-filter by site_ids JSON array
    let rows = await db.select().from(media).orderBy(desc(media.created_at)).all();

    // Site filter: "all" = everything, specific id = media that includes that site, empty/absent = all (global default)
    if (siteIdParam && siteIdParam !== "all") {
        const targetId = Number(siteIdParam);
        rows = rows.filter((r) => {
            if (!r.site_ids) return false; // Global items don't match specific site filter
            try {
                const ids: number[] = JSON.parse(r.site_ids);
                return ids.includes(targetId);
            } catch { return r.site_id === targetId; }
        });
    }

    // Post-filter
    let filtered = rows;
    if (mimeFilter) {
        filtered = filtered.filter((r) => r.mime_type.startsWith(mimeFilter));
    }
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((r) => r.filename.toLowerCase().includes(q));
    }

    return c.json({ data: filtered, count: filtered.length });
});

// ─── GET /api/media/:id — single item ───
mediaRoute.get("/:id", async (c) => {
    const db = createDb(c.env.DB);
    const id = Number(c.req.param("id"));

    const item = await db.select().from(media).where(eq(media.id, id)).get();
    if (!item) return c.json({ error: "Media not found" }, 404);

    return c.json({ data: item });
});

// ─── PATCH /api/media/:id — update metadata (title, alt_text, site_ids) ───
mediaRoute.patch("/:id", async (c) => {
    const db = createDb(c.env.DB);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const item = await db.select().from(media).where(eq(media.id, id)).get();
    if (!item) return c.json({ error: "Media not found" }, 404);

    const updateData: Record<string, unknown> = {
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };
    if (body.title !== undefined) updateData.title = body.title || null;
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text || null;
    if (body.site_ids !== undefined) {
        const ids: number[] = Array.isArray(body.site_ids) ? body.site_ids : [];
        updateData.site_ids = ids.length > 0 ? JSON.stringify(ids) : null;
        // Keep site_id in sync (first site or null)
        updateData.site_id = ids.length > 0 ? ids[0] : null;
    }

    const updated = await db.update(media).set(updateData).where(eq(media.id, id)).returning().get();

    return c.json({ data: updated });
});

// ─── POST /api/media/upload — multi-tenant R2 upload ───
mediaRoute.post("/upload", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);
    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
        return c.json({ error: "No file uploaded" }, 400);
    }

    // File size check (100 MB)
    if (file.size > MAX_FILE_SIZE) {
        return c.json({ error: "Dosya çok büyük (maks. 100MB)" }, 413);
    }

    // MIME type validation
    if (!ALLOWED_MIMES.has(file.type)) {
        return c.json({ error: `Desteklenmeyen dosya türü: ${file.type}` }, 415);
    }

    const currentSite = await db.select().from(sites).where(eq(sites.id, siteId)).get();
    const tenantSlug = currentSite?.slug || "global";

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const hash = Math.random().toString(36).substring(2, 8);

    // Clean filename
    const originalName = file.name;
    const ext = originalName.split(".").pop();
    const baseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();
    const filename = `${baseName}-${hash}.${ext}`;

    const category = (body.category as string) || "general";
    const key = `${tenantSlug}/${category}/${year}/${month}/${filename}`;
    const url = `/api/media/serve/${key}`;

    // Upload to R2
    await c.env.MEDIA.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
    });

    // Parse site_ids from form body (JSON string or fallback to current tenant)
    let siteIds: number[] = [];
    const rawSiteIds = body.site_ids as string;
    if (rawSiteIds) {
        try { siteIds = JSON.parse(rawSiteIds); } catch { siteIds = [siteId]; }
    } else {
        siteIds = [siteId];
    }

    // Save to D1
    const inserted = await db
        .insert(media)
        .values({
            site_id: siteIds.length > 0 ? siteIds[0] : null,
            site_ids: siteIds.length > 0 ? JSON.stringify(siteIds) : null,
            filename: originalName,
            key,
            url,
            mime_type: file.type,
            size: file.size,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

// ─── POST /api/media/bulk-delete — remove multiple from R2 + D1 ───
mediaRoute.post("/bulk-delete", async (c) => {
    const db = createDb(c.env.DB);
    const { ids } = await c.req.json<{ ids: number[] }>();

    if (!ids || ids.length === 0) {
        return c.json({ error: "No IDs provided" }, 400);
    }

    // Fetch all items to get R2 keys
    const items = await db.select().from(media).where(inArray(media.id, ids)).all();

    // Delete from R2 in parallel
    await Promise.all(items.map((item) => c.env.MEDIA.delete(item.key)));

    // Delete from D1
    await db.delete(media).where(inArray(media.id, ids)).run();

    return c.json({ message: "Deleted", count: items.length });
});

// ─── DELETE /api/media/:id — remove from R2 + D1 ───
mediaRoute.delete("/:id", async (c) => {
    const db = createDb(c.env.DB);
    const id = Number(c.req.param("id"));

    const item = await db.select().from(media).where(eq(media.id, id)).get();
    if (!item) return c.json({ error: "Media not found" }, 404);

    await c.env.MEDIA.delete(item.key);
    await db.delete(media).where(eq(media.id, id)).run();

    return c.json({ message: "Deleted", id });
});

export default mediaRoute;
