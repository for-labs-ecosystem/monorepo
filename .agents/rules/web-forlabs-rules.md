---
trigger: always_on
---

---
description: Rules for apps/web-forlabs — the for-labs.com public website
trigger: always_on
---

# WEB-FORLABS (for-labs.com) — PROJE KURALLARI

Bu dosya, `apps/web-forlabs` uygulamasına özel geliştirme kurallarını tanımlar.
**Genel ekosistem kuralları (`for-labs-ecosystem-global-rules.md`) her zaman önceliklidir.**

## 1. KİMLİK & ORTAM

- **Paket adı:** `@forlabs/web-forlabs`
- **Site slug:** `forlabs` (DOMAIN_MAP'te `for-labs.com` → `forlabs`)
- **Site ID:** `1` (D1 veritabanında for-labs.com'un sabit ID'si)
- **Dev port:** `5174` (`vite --port 5174`)
- **Zorunlu `.env` değişkenleri:**
  ```
  VITE_SITE_ID=1
  VITE_API_URL=http://localhost:8787
  ```
- CORS whitelist'e `https://for-labs.com` ve `https://www.for-labs.com` `apps/api/src/index.ts`'de zaten ekli.

## 2. TEKNOLOJİ YIĞINI (STACK)

- **Framework:** React 19 + Vite 7 + TypeScript strict
- **Styling & UI:** TailwindCSS v4 ve **Shadcn UI**. (Shadcn entegrasyonu için gerekiyorsa tailwind konfigürasyonlarını kullanabilirsin).
- **Routing:** React Router v7 (`react-router-dom`)
- **Veri çekme:** TanStack React Query v5
- **Tip paylaşımı:** `@forlabs/shared` — entity tiplerini asla yeniden tanımlama
- **İkonlar:** Lucide React
- **Yeni bağımlılık eklemek:** `npm install <paket> -w apps/web-forlabs`

## 2.1 TİCARİ VİZYON VE LOUYOUT (ÇOK ÖNEMLİ)
Bu site sıradan bir B2C e-ticaret sitesi DEĞİLDİR. Sektördeki dev bir laboratuvar firmasının "Şemsiye Markası"dır (The Umbrella Trust).
- **B2B + B2C Hibrit:** Müşteriler doğrudan kredi kartıyla ürün alabilmeli (Checkout) VEYA sepetteki ürünler için "Proje Teklifi İste" butonunu kullanabilmelidir.
- **İçerik Odaklı Satış (Content-Driven):** Ürünler ve akademik makaleler (Akademi/Bilgi Bankası) iç içe geçmelidir.
- **Global Layout Şartları:** 1. En üstte diğer iştiraklerimize (Atago TR, Gıda Test vb.) link veren ince bir **"Network Bar"** OLMALIDIR.
  2. Ana menüde Logo, Çözümler, Ürünler, Hizmetler ve Akademi linkleri bulunmalıdır.
  3. En altta kurumsal güven damgalarını (ISO vb.) barındıran geniş bir **"Mega Footer"** OLMALIDIR.

## 3. API İLETİŞİM KURALLARI (KESİN)

- `packages/db` veya Drizzle ORM **asla** import edilmez — bu bir frontend uygulamasıdır.
- Tüm veri isteği `VITE_API_URL` üzerinden HTTP ile yapılır.
- Her API isteğinde `?site_id=${VITE_SITE_ID}` query parametresi gönderilir.
- API base URL: `import.meta.env.VITE_API_URL` — asla hardcode etme.
- Tüm endpoint çağrıları `src/lib/api.ts` üzerinden merkezi olarak yapılır.
- **Standart istek örneği:**
  ```ts
  const API_BASE = import.meta.env.VITE_API_URL;
  const SITE_ID  = import.meta.env.VITE_SITE_ID;

  fetch(`${API_BASE}/api/products?site_id=${SITE_ID}`)
  ```

## 4. VERİ ÇEKME PATERNİ (TanStack Query)

- Tüm veri çekme `useQuery` / `useMutation` hook'ları ile yapılır — `useEffect + fetch` kombinasyonu yasak.
- Query key'leri her zaman `siteId` içerir: `['products', siteId]`
- Loading ve error state'leri her bileşende handle edilir.
- `QueryClient` konfigürasyonu: `src/lib/queryClient.ts`

## 5. TASARIM DİLİ — "FOR-LABS PROFESSIONAL"

- **Arka plan:** Beyaz (`#ffffff`) — section ayırımları için `slate-50` / `slate-100`.
- **Kenarlıklar:** `border-slate-200`
- **Marka rengi:** CTA, buton ve vurgu için belirlenen marka rengi — yalnızca bu noktalarda kullanılır.
- **Tipografi:** Inter veya sistem fontu; başlıklar `font-bold` / `font-semibold`.
- **Karanlık mod KESİNLİKLE DEVRE DIŞI:**
  - `dark:` Tailwind varyantları yazılmaz.
  - `src/index.css` içindeki `color-scheme: light dark` kaldırılır, yalnızca `light` kalır.
  - `@media (prefers-color-scheme: dark)` bloğu `index.css`'ten silinir.
- **Spacing:** Cömert padding — section'lar için `py-16` / `py-24`.
- **Responsive:** Mobile-first. Her bileşen `sm:`, `md:`, `lg:` breakpoint'leriyle responsive olur.

## 6. DOSYA & KLASÖR YAPISI

```
apps/web-forlabs/src/
  components/
    layout/       # Header, Footer, Nav bileşenleri
    ui/           # Genel UI atom'ları (Button, Card, Badge vb.)
    sections/     # Anasayfa bölüm bileşenleri (Hero, Features, CTA vb.)
  pages/          # Route-level sayfa bileşenleri (lazy load)
  lib/
    api.ts        # Tüm API çağrıları (merkezi)
    queryClient.ts# TanStack QueryClient konfigürasyonu
  hooks/          # Özel React hook'ları (useProducts, useArticles vb.)
  router.tsx      # React Router tanımları (tüm route'lar burada)
  main.tsx        # Uygulama entry point
```

## 7. ROUTER & SEO

- React Router v7 kullan; tüm route'lar `src/router.tsx`'de merkezi tanımlanır.
- Sayfa bileşenleri `React.lazy()` ile lazy load edilir.
- Her sayfa kendi `<title>` ve `<meta name="description">`'ını set eder.
- Slug tabanlı sayfalarda (`/urunler/:slug`, `/blog/:slug` vb.) API'den gelen `meta_title`, `meta_description`, `canonical_url` alanları kullanılır.

## 8. MEVCUT API ENDPOINT'LERİ (REFERANS)

Tüm endpoint'ler `?site_id={VITE_SITE_ID}` ile tenant-scoped çalışır:

| Endpoint | İçerik |
|---|---|
| `GET /api/products` | Ürün listesi |
| `GET /api/products/:id` | Ürün detayı |
| `GET /api/articles` | Blog / Makale listesi |
| `GET /api/articles/:id` | Makale detayı |
| `GET /api/services` | Hizmet listesi |
| `GET /api/services/:id` | Hizmet detayı |
| `GET /api/categories` | Kategori ağacı |
| `GET /api/projects` | Referans projeler |
| `GET /api/projects/:id` | Proje detayı |
| `GET /api/pages` | Statik sayfalar |
| `GET /api/navigations` | Header / Footer menüler |
| `POST /api/inquiries` | İletişim / Teklif formu gönderimi |
| `POST /api/checkout/initiate` | Ödeme başlatma (Iyzico) |
| `GET /api/media` | Medya varlıkları |

## 9. BİLEŞEN KURALLARI

- Her bileşen tek sorumluluk taşır — büyük bileşenleri böl.
- Prop tipleri için `@forlabs/shared` kullan; kopyalama veya yeniden tanımlama yasak.
- Bileşen içine `site_id`, domain adı veya hardcode ID yazma — `.env`'den gelir.
- İletişim / teklif formları → `POST /api/inquiries` + `site_id`
- E-ticaret sepet / ödeme akışı → `POST /api/checkout/initiate`

## 10. GELİŞTİRME KOMUTLARI

```bash
# Sadece web-forlabs başlat
npm run dev -w apps/web-forlabs

# API + web birlikte (turbo)
npm run dev  # repo root'undan

# Build
npm run build -w apps/web-forlabs

# Type check
npm run typecheck -w apps/web-forlabs
```

## 11. CLOUDFLARE PAGES DEPLOY

- Build output: `dist/` (değiştirme)
- Build komutu: `npm run build -w apps/web-forlabs`
- Cloudflare Pages ortam değişkenleri: `VITE_SITE_ID=1`, `VITE_API_URL=https://api.for-labs.com`
