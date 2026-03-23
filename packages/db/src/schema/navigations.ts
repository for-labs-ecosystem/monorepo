import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { sites } from "./sites";
import { pages } from "./pages";

/**
 * Navigation items per site.
 * Tree structure via parent_id for header menus, footer columns, etc.
 * Pages auto-sync their slug into this table when published with a menu placement.
 */
export const navigations = sqliteTable(
    "navigations",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        site_id: integer("site_id")
            .notNull()
            .references(() => sites.id),
        // Optional FK — if this nav item was auto-created from a page
        page_id: integer("page_id").references(() => pages.id),
        name: text("name").notNull(),
        url: text("url").notNull(),
        // Self-referencing for tree structure (header dropdowns, footer columns)
        parent_id: integer("parent_id"),
        // 'header' | 'footer' | 'hidden'
        location: text("location").notNull().default("header"),
        sort_order: integer("sort_order").notNull().default(0),
        created_at: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updated_at: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => [
        index("idx_nav_site_location").on(table.site_id, table.location),
        index("idx_nav_page").on(table.site_id, table.page_id),
    ]
);
