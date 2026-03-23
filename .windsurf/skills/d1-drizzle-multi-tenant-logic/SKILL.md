---
name: d1-drizzle-multi-tenant-logic
description: Use this skill when modifying the database schema, writing queries, or handling multi-tenant content isolation. Enforces Drizzle ORM and Inheritance logic.
---

# D1 Database & Drizzle ORM

## Goal
Use Drizzle ORM for all D1 interactions and maintain the multi-tenant "Inheritance/Override" logic.

## Instructions
- **ALWAYS use Drizzle ORM.** Never write raw SQL strings for migrations or queries. Update `schema.ts` and use `drizzle-kit` commands.
- Use SQLite specific Drizzle types (`sqliteTable`, `integer`, `text`, `real`).
- **Tenant Detection:** Identify the tenant via the `Host` header mapping, not hardcoded URLs.
- **Inheritance Logic (CRITICAL):** For shared content (like products), always query the global table AND the `site_overrides` table. If an override exists for the current `site_id`, use the override values; otherwise, fallback to the global values.

## Guardrails
- Never drop tables or columns directly if data exists; use additive migrations.
- Always include `created_at` and `updated_at` timestamps.