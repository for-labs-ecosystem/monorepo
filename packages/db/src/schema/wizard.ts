import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";

/**
 * Wizard steps — each row is a fill-in-the-blank sentence step.
 * Admin can create unlimited steps per site.
 * `field_key` maps to the matching engine's product column lookup.
 */
export const wizardSteps = sqliteTable(
    "wizard_steps",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        step_number: integer("step_number").notNull(),
        field_key: text("field_key").notNull(),
        title: text("title"),
        title_en: text("title_en"),
        prefix: text("prefix"),
        prefix_en: text("prefix_en"),
        suffix: text("suffix"),
        suffix_en: text("suffix_en"),
        is_active: integer("is_active", { mode: "boolean" })
            .notNull()
            .default(true),
        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        uniqueIndex("wizard_steps_site_step_unique").on(
            table.site_id,
            table.step_number
        ),
    ]
);

/**
 * Wizard options — dropdown choices for each step.
 * `match_tags` is a JSON array of strings used by the matching engine
 * to find relevant products. Falls back to [value] if empty.
 */
export const wizardOptions = sqliteTable("wizard_options", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    step_id: integer("step_id")
        .notNull()
        .references(() => wizardSteps.id),
    label: text("label").notNull(),
    label_en: text("label_en"),
    value: text("value").notNull(),
    description: text("description"),
    description_en: text("description_en"),
    match_tags: text("match_tags"),
    sort_order: integer("sort_order").notNull().default(0),
    is_active: integer("is_active", { mode: "boolean" })
        .notNull()
        .default(true),
    created_at: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});
