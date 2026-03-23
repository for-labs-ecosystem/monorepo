---
name: forlabs-core-stack-guard
description: Use this skill for any backend or API development in the For-Labs multi-tenant CMS. Enforces Hono.js, Cloudflare Workers runtime, and Monorepo structure.
---

# Core Tech Stack & Architecture

## Goal
Enforce Cloudflare Workers compatibility, Hono.js conventions, and a strict 3-part Monorepo architecture.

## Instructions
- **Monorepo Architecture:** Always respect the 3-part structure: 1) `apps/api` (Hono Worker Gateway), 2) `apps/admin` (React Pages SPA), 3) `apps/forlabs-web` (React Pages public site).
- ALWAYS write Edge-compatible code for the Worker API. Do not use Node.js built-ins.
- Use **Hono.js** for all API routing inside the `apps/api` worker. 
- Keep the shared types and database schemas in a shared package (e.g., `packages/shared` or `packages/db`).
- Access environment variables and bindings (D1, R2) ONLY through Hono's Context (`c.env`) in the backend.

## Guardrails
- Never mix backend Worker logic into the frontend Pages apps. They must communicate strictly via REST API.