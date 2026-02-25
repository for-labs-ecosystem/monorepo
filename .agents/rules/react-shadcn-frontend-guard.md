---
trigger: always_on
---

---
name: react-shadcn-frontend-guard
description: Use this skill for frontend development (CMS Admin and Tenant Pages). Enforces React 18, Vite, Shadcn UI, and TanStack Query.
---

# Frontend Stack & UI

## Goal
Build fast, modern UIs for both the Admin CMS (SPA) and public facing websites (SEO optimized).

## Instructions
- Stack: React 18+, Vite, Tailwind CSS.
- **App Boundaries:** Be aware if you are working on `apps/admin` (CMS Panel - highly interactive) or `apps/forlabs-web` (Public Site - user facing, ecommerce capable).
- **UI Components:** ALWAYS prioritize generating and using **Shadcn UI** components. 
- **Data Fetching:** ALWAYS use **TanStack Query (React Query)** to fetch data from our `apps/api` Worker. 
- **Forms:** Use `react-hook-form` combined with `zod` for validation.

## Guardrails
- Do not write database queries directly in frontend code. Frontend must call the Hono API.