import { Hono } from "hono";
import { eq, and, sql, asc } from "drizzle-orm";
import { wizardSteps, wizardOptions } from "@forlabs/db/schema";
import { createDb } from "../lib/db";
import { authMiddleware } from "../middleware/auth";

type Bindings = {
    DB: D1Database;
};

type Variables = {
    siteId: number;
};

const wizardStepsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * GET /api/wizard-steps
 * Public — returns all active steps + active options for the tenant.
 * Frontend calls this on wizard load.
 */
wizardStepsRoute.get("/", async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const steps = await db
        .select()
        .from(wizardSteps)
        .where(
            and(
                eq(wizardSteps.site_id, siteId),
                eq(wizardSteps.is_active, true)
            )
        )
        .orderBy(asc(wizardSteps.step_number));

    const stepIds = steps.map((s) => s.id);

    let options: (typeof wizardOptions.$inferSelect)[] = [];
    if (stepIds.length > 0) {
        options = await db
            .select()
            .from(wizardOptions)
            .where(eq(wizardOptions.is_active, true))
            .orderBy(asc(wizardOptions.sort_order));
    }

    const data = steps.map((step) => ({
        ...step,
        options: options
            .filter((o) => o.step_id === step.id)
            .map((o) => ({
                ...o,
                match_tags: o.match_tags ? JSON.parse(o.match_tags) : [],
            })),
    }));

    return c.json({ data });
});

/**
 * GET /api/wizard-steps/all
 * Admin — returns ALL steps (active + inactive) + ALL options.
 */
wizardStepsRoute.get("/all", authMiddleware, async (c) => {
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const steps = await db
        .select()
        .from(wizardSteps)
        .where(eq(wizardSteps.site_id, siteId))
        .orderBy(asc(wizardSteps.step_number));

    const allOptions = await db
        .select()
        .from(wizardOptions)
        .orderBy(asc(wizardOptions.sort_order));

    const data = steps.map((step) => ({
        ...step,
        options: allOptions
            .filter((o) => o.step_id === step.id)
            .map((o) => ({
                ...o,
                match_tags: o.match_tags ? JSON.parse(o.match_tags) : [],
            })),
    }));

    return c.json({ data });
});

/**
 * GET /api/wizard-steps/:id
 * Admin — single step detail + options.
 */
wizardStepsRoute.get("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    const step = await db
        .select()
        .from(wizardSteps)
        .where(eq(wizardSteps.id, id))
        .get();

    if (!step) return c.json({ error: "Step not found" }, 404);

    const opts = await db
        .select()
        .from(wizardOptions)
        .where(eq(wizardOptions.step_id, id))
        .orderBy(asc(wizardOptions.sort_order));

    return c.json({
        data: {
            ...step,
            options: opts.map((o) => ({
                ...o,
                match_tags: o.match_tags ? JSON.parse(o.match_tags) : [],
            })),
        },
    });
});

/**
 * POST /api/wizard-steps
 * Admin — create a new step. step_number auto-assigned as max+1.
 */
wizardStepsRoute.post("/", authMiddleware, async (c) => {
    const body = await c.req.json();
    const siteId = c.get("siteId") as number;
    const db = createDb(c.env.DB);

    const existing = await db
        .select({ maxNum: sql<number>`COALESCE(MAX(${wizardSteps.step_number}), 0)` })
        .from(wizardSteps)
        .where(eq(wizardSteps.site_id, siteId))
        .get();
    const nextNumber = (existing?.maxNum ?? 0) + 1;

    const inserted = await db
        .insert(wizardSteps)
        .values({
            site_id: siteId,
            step_number: nextNumber,
            field_key: body.field_key,
            title: body.title || null,
            title_en: body.title_en || null,
            prefix: body.prefix || null,
            prefix_en: body.prefix_en || null,
            suffix: body.suffix || null,
            suffix_en: body.suffix_en || null,
            is_active: body.is_active ?? true,
        })
        .returning()
        .get();

    return c.json({ data: inserted }, 201);
});

/**
 * PUT /api/wizard-steps/reorder
 * Admin — bulk reorder steps. Body: { order: [id1, id2, id3, ...] }
 * Uses temp negative values to avoid unique constraint (site_id, step_number) conflicts.
 */
wizardStepsRoute.put("/reorder", authMiddleware, async (c) => {
    const body = await c.req.json<{ order: number[] }>();
    const db = createDb(c.env.DB);

    if (!body.order || !Array.isArray(body.order) || body.order.length === 0) {
        return c.json({ error: "order array is required" }, 400);
    }

    // Phase 1: set all to negative temp values to avoid unique conflicts
    for (let i = 0; i < body.order.length; i++) {
        await db
            .update(wizardSteps)
            .set({ step_number: -(i + 1), updated_at: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(wizardSteps.id, body.order[i]));
    }

    // Phase 2: set final positive values
    for (let i = 0; i < body.order.length; i++) {
        await db
            .update(wizardSteps)
            .set({ step_number: i + 1 })
            .where(eq(wizardSteps.id, body.order[i]));
    }

    return c.json({ message: "Reorder successful" });
});

/**
 * PUT /api/wizard-steps/:id
 * Admin — update step content (texts, active). step_number is managed only via /reorder.
 */
wizardStepsRoute.put("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const updated = await db
        .update(wizardSteps)
        .set({
            field_key: body.field_key,
            title: body.title,
            title_en: body.title_en,
            prefix: body.prefix,
            prefix_en: body.prefix_en,
            suffix: body.suffix,
            suffix_en: body.suffix_en,
            is_active: body.is_active,
            updated_at: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(wizardSteps.id, id))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Step not found" }, 404);
    return c.json({ data: updated });
});

/**
 * DELETE /api/wizard-steps/:id
 * Admin — delete step + cascade options.
 */
wizardStepsRoute.delete("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));
    const db = createDb(c.env.DB);

    // Delete options first (no FK cascade in SQLite by default)
    await db.delete(wizardOptions).where(eq(wizardOptions.step_id, id));
    await db.delete(wizardSteps).where(eq(wizardSteps.id, id));

    return c.json({ message: "Step and its options deleted" });
});

// ─── Option CRUD ───

/**
 * POST /api/wizard-steps/:id/options
 * Admin — add option to a step.
 */
wizardStepsRoute.post("/:id/options", authMiddleware, async (c) => {
    const stepId = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const matchTags = body.match_tags
        ? JSON.stringify(body.match_tags)
        : null;

    const inserted = await db
        .insert(wizardOptions)
        .values({
            step_id: stepId,
            label: body.label,
            label_en: body.label_en || null,
            value: body.value,
            description: body.description || null,
            description_en: body.description_en || null,
            match_tags: matchTags,
            sort_order: body.sort_order ?? 0,
            is_active: body.is_active ?? true,
        })
        .returning()
        .get();

    return c.json({
        data: {
            ...inserted,
            match_tags: inserted.match_tags ? JSON.parse(inserted.match_tags) : [],
        },
    }, 201);
});

/**
 * PUT /api/wizard-options/:optionId
 * Admin — update an option.
 */
wizardStepsRoute.put("/options/:optionId", authMiddleware, async (c) => {
    const optionId = Number(c.req.param("optionId"));
    const body = await c.req.json();
    const db = createDb(c.env.DB);

    const matchTags = body.match_tags !== undefined
        ? JSON.stringify(body.match_tags)
        : undefined;

    const updateData: Record<string, unknown> = {
        label: body.label,
        label_en: body.label_en,
        value: body.value,
        description: body.description,
        description_en: body.description_en,
        sort_order: body.sort_order,
        is_active: body.is_active,
        updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    if (matchTags !== undefined) {
        updateData.match_tags = matchTags;
    }

    const updated = await db
        .update(wizardOptions)
        .set(updateData)
        .where(eq(wizardOptions.id, optionId))
        .returning()
        .get();

    if (!updated) return c.json({ error: "Option not found" }, 404);

    return c.json({
        data: {
            ...updated,
            match_tags: updated.match_tags ? JSON.parse(updated.match_tags) : [],
        },
    });
});

/**
 * DELETE /api/wizard-options/:optionId
 * Admin — delete an option.
 */
wizardStepsRoute.delete("/options/:optionId", authMiddleware, async (c) => {
    const optionId = Number(c.req.param("optionId"));
    const db = createDb(c.env.DB);

    await db.delete(wizardOptions).where(eq(wizardOptions.id, optionId));
    return c.json({ message: "Option deleted" });
});

export default wizardStepsRoute;
