import { drizzle } from "drizzle-orm/d1";
import * as schema from "@forlabs/db/schema";

/**
 * Create a typed Drizzle client from Hono's D1 binding.
 * Usage: const db = createDb(c.env.DB);
 */
export function createDb(d1: D1Database) {
    return drizzle(d1, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
