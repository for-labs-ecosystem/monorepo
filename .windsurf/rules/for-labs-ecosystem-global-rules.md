---
description: Global rules for the forlabs-ecosystem monorepo — applies to all apps and packages
trigger: always_on
---

# FORLABS ECOSYSTEM — GLOBAL RULES

Bu monorepo, Cloudflare tabanlı multi-tenant bir CMS ekosistemine aittir.
**Bu dosyadaki kurallar tüm `apps/*` ve `packages/*` çalışmalarında her zaman önceliklidir.**

## 1. CLOUDFLARE KAYNAK KORUMASI (KESİN KURAL)

- Tüm Cloudflare kaynakları (D1, R2, Worker, Pages, KV) `forlabs-` prefix'i ile başlar.
- `forlabs-` prefix'i olmayan hiçbir Cloudflare kaynağına erişme, değiştirme veya silme.
- **Cloudflare Account ID:** `57c81dc1c11c10710648a8c505dd2`
- **D1 veritabanı:** `forlabs-cms-db` (ID: `affd3b85-8f03-4f40-b1c9-a6749235daf0`)
- **R2 bucket:** `forlabs-media-bucket`

## 2. MONOREPO YAPISI

```
apps/
  api/          — Hono.js Cloudflare Worker (port 8787)
  admin/        — CMS Admin Panel, Vite + React 19 (port 5173)
  web-forlabs/  — for-labs.com public website, Vite + React 19 (port 5174)
packages/
  db/           — Drizzle ORM şeması, D1 migration'lar
  shared/       — Paylaşılan TypeScript tipleri, Zod validator'ler, DOMAIN_MAP sabitleri
  ui/           — Boş placeholder (henüz kullanılmıyor)
```

- **Package manager:** npm workspaces (`npm install <pkg> -w apps/<app>`)
- **Monorepo task runner:** Turborepo (`turbo.json`)
- **Node.js:** ≥18.0.0

## 3. MULTI-TENANT MİMARİSİ

- **7 site:** forlabs, atagotr, gidakimya, labkurulum, gidatest, alerjen, hijyenkontrol
- Tenant çözümleme: `Host` header → `DOMAIN_MAP` (packages/shared) → site slug → D1 lookup
- Admin panelinde tenant: `?site_id=N` query parametresi
- **Global tablolar + `site_*_overrides`** tabloları ile COALESCE inheritance pattern'i
- Override tabloları: `site_product_overrides`, `site_article_overrides`, `site_category_overrides`

## 4. VERİTABANI KURALLARI (packages/db)

- ORM: **Drizzle ORM** — ham SQL veya başka ORM yasak.
- Runtime: **Cloudflare D1** (SQLite dialect) — asla Postgres/MySQL syntax kullanma.
- Şema değişikliklerinde: önce `packages/db/src/schema/` güncelle, ardından `drizzle-kit generate` ile migration oluştur.
- Migration'ları asla manuel düzenleme — generate et.
- `is_visible` default değeri: **1** (true), asla 0 olmasın.
- JSON kolonları (`features`, `gallery`, `specs` vb.) için `mode: "json"` kullanma — string olarak sakla, API katmanında `JSON.parse/stringify` yap.

## 5. API KURALLARI (apps/api)

- Framework: **Hono.js** — Express veya başka framework yasak.
- Runtime: **Cloudflare Workers** — `fs`, `path`, Node.js built-in modülleri yasak.
- Tüm tenant-scoped route'lar `tenantMiddleware` içinden geçer.
- Auth gerektiren route'lar `authMiddleware` içinden geçer.
- `/api/auth`, `/api/users`, `/api/settings` — tenant middleware'siz, global admin route'lar.
- Response format: her zaman `{ data: ... }` veya `{ data: ..., count: N }` şeklinde.
- Hata response: `{ error: "mesaj" }` ile uygun HTTP status kodu.

## 6. TİP PAYLAŞIMI (packages/shared)

- Tüm entity tipleri (`Product`, `Article`, `Service`, `Page`, `Order`, `Media` vb.) **yalnızca** `@forlabs/shared`'dan import edilir.
- `apps/admin` ve `apps/web-forlabs` içinde hiçbir zaman entity tipi yeniden tanımlanmaz.
- Zod validator'ler de `@forlabs/shared`'dadır — kopyalama.

## 7. FRONTEND GENEL KURALLARI (admin + web-forlabs)

- TypeScript **strict mode** — `any` tipi kesinlikle yasak.
- Styling: **TailwindCSS v4** (`@tailwindcss/vite` plugin) — `tailwind.config.js` gerekmez.
- İkon kütüphanesi: **Lucide React** — başka ikon kütüphanesi ekleme.
- Veri çekme: **TanStack React Query v5** — `useEffect` + `fetch` kombinasyonu yasak.
- Import'lar dosyanın en üstünde olmalı — orta veya alt kısımda import yasak.
- **Tasarım Dili (Laboratory Clean):** Bembeyaz, ferah, medikal temizlikte bir arayüz (bol whitespace, `border-slate-200` gibi ince açık gri çizgiler, net tipografi).
- **Dark Mode Yasak:** Hiçbir projede karanlık mod kullanılmayacak, `dark:` varyantları yazılmayacak.

## 8. GİZLİLİK & GÜVENLİK

- API anahtarları, şifreler, JWT secret'lar asla kaynak koduna yazılmaz.
- Cloudflare Worker secret'ları `wrangler secret put` ile set edilir.
- Frontend env değişkenleri `VITE_` prefix'i ile `.env` dosyasında tutulur.
- `.env` dosyaları `.gitignore`'a eklidir.
- Ödeme işlemleri yalnızca `apps/api/src/routes/checkout.ts` üzerinden Iyzico ile yapılır.

## 9. AUTHENTICATION (KİMLİK DOĞRULAMA) MİMARİSİ
- **KESİNLİKLE ŞİFRE YOK:** Sistemde geleneksel şifre (password) veya hash mantığı KULLANILMAZ.
- Admin panele girişler SADECE **Google OAuth 2.0 (SSO)** ile yapılır. Veritabanındaki `users` tablosunda yetkisi olan e-postalar içeri alınır. `seed.sql` veya benzeri dosyalarda şifre oluşturmaya çalışma.

## 10. GELİŞTİRME KOMUTLARI

```bash
npm run dev                          # Tüm servisleri turbo ile başlat
npm run dev -w apps/api              # Sadece API (port 8787)
npm run dev -w apps/admin            # Sadece admin (port 5173)
npm run dev -w apps/web-forlabs     # Sadece web (port 5174)
npm run build                        # Tüm build
npm run db:generate -w packages/db  # Drizzle migration oluştur
npm run typecheck                    # Tüm tip kontrolü
```
