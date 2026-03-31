---
description: Mandatory checklist and rules for adding a new website project (apps/web-*) to the forlabs-ecosystem monorepo
trigger: always_on
---

# YENİ WEBSİTE PROJESİ EKLEME KURALLARI

Bu dosya, `forlabs-ecosystem` monoreposuna yeni bir `apps/web-*` projesi eklerken **mutlaka** uyulması gereken kuralları, mimari akışı ve kontrol listesini tanımlar.
**Bu kurallar ihlal edilemez. Her yeni website projesinde bu dosya baştan sona okunmalıdır.**

---

## 1. ÖN KOŞULLAR — Yeni Sitenin Ekosisteme Kaydı

Yeni bir website projesi oluşturmadan **önce** aşağıdaki backend/altyapı adımları tamamlanmış olmalıdır:

### 1.1 Veritabanı (D1)
- Sitenin `sites` tablosuna kaydı yapılmış olmalı (admin panelden veya seed ile).
- **Site ID** not edilmeli (örn: forlabs=1, atagotr=2, gidakimya=3 …).
- Sitenin hangi modülleri (`products`, `articles`, `services`, `pages` vb.) kullanacağı `site_settings` veya `sites` tablosundaki `enabled_modules` alanında belirlenmiş olmalı.

### 1.2 DOMAIN_MAP Güncellemesi
`packages/shared/src/constants/index.ts` dosyasındaki `DOMAIN_MAP`'e yeni domain eklenmeli:
```ts
// packages/shared/src/constants/index.ts
export const DOMAIN_MAP: Record<string, string> = {
    // ... mevcut domain'ler ...
    "yenidomain.com": "yenislug",
    "www.yenidomain.com": "yenislug",
};
```

### 1.3 CORS Whitelist
`apps/api/src/index.ts` dosyasındaki CORS origin listesine eklenmeli:
```ts
cors({
    origin: [
        // ... mevcut origin'ler ...
        "http://localhost:51XX",        // Dev port
        "https://yenidomain.com",       // Production domain
        "https://www.yenidomain.com",   // www variant
        "https://forlabs-SLUG.pages.dev", // Cloudflare Pages preview
    ],
})
```

---

## 2. PROJE OLUŞTURMA KURALLARI

### 2.1 Klasör Adlandırma
```
apps/web-{slug}/    (örn: apps/web-gidakimya, apps/web-labkurulum)
```

### 2.2 Package.json
```json
{
  "name": "@forlabs/web-{slug}",
  "private": true,
  "scripts": {
    "dev": "vite --port {UNIQUE_PORT}",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  }
}
```
**Port tahsisi** (çakışma olmamalı):
| Proje | Port |
|---|---|
| admin | 5173 |
| web-forlabs | 5174 |
| web-atagotr | 5175 |
| Yeni proje | 5176+ (sırayla arttır) |

### 2.3 Zorunlu .env Dosyası
```
VITE_SITE_ID={SITE_ID_FROM_DB}
VITE_API_URL=http://localhost:8787
```

### 2.4 Zorunlu Bağımlılıklar
```bash
npm install react react-dom react-router-dom @tanstack/react-query lucide-react -w apps/web-{slug}
npm install @forlabs/core @forlabs/shared -w apps/web-{slug}
npm install -D typescript vite @vitejs/plugin-react @tailwindcss/vite tailwindcss @tailwindcss/typography -w apps/web-{slug}
```

---

## 3. TAİLWİND CSS v4 — KRİTİK KURAL (@source)

> **BU KURAL İHLAL EDİLİRSE, `packages/core` İÇİNDEKİ TÜM TAİLWİND CLASSLARI (TiptapRenderer, ortak bileşenler) ÇALIŞMAZ!**

Tailwind CSS v4, varsayılan olarak yalnızca projenin kendi `src/` dizinini tarar. `packages/core/src/` içinde kullanılan Tailwind class'ları (ör: `space-y-10`, `marker:text-slate-400`, `rounded-2xl` vb.) otomatik olarak algılanmaz.

**Çözüm:** `src/index.css` dosyasına `@source` direktifi eklenmeli:

```css
@import "tailwindcss";
@source "../../../packages/core/src";
@plugin "@tailwindcss/typography";
```

Bu satır olmadan:
- TiptapRenderer'daki tüm spacing, list marker, rounded vs. class'lar kaybolur
- Blok editörden eklenen içerikler sıkışık ve stilsiz render olur
- Build hatasız tamamlanır ama CSS eksik olur (sessiz hata!)

---

## 4. DİNAMİK MENÜ & SAYFA SİSTEMİ (KRİTİK MİMARİ)

Admin panel > Sayfalar bölümü, CMS sayfaları oluşturur ve bunları sitelere yayınlar.
Her yeni website bu akışa **tam uyumlu** olmalıdır.

### 4.1 Akış Şeması

```
ADMIN PANELİ                              VERİTABANI                         WEBSITE
─────────────                             ──────────                         ───────
1. Sayfa oluştur                    ───►  pages tablosu (global)
2. Sitelere yayınla                 ───►  site_page_overrides (is_visible=1)
3. Menü yerleşimi belirle           ───►  navigations tablosu
   (header/footer/hidden)                 (site_id, page_id, url, parent_id,
   (üst menü öğesi seç - parent_id)        location, sort_order)
4. İçerik düzenle (Blok Editör)    ───►  pages.content (TipTap JSON)
                                          │
                                          ▼
                                    API ENDPOINT'LERİ
                                    ──────────────────
                                    GET /api/navigations?site_id=N&location=header
                                    GET /api/navigations?site_id=N&location=footer
                                    GET /api/pages/:slug?site_id=N
                                          │
                                          ▼
                                    WEBSITE RENDER
                                    ──────────────
                                    Header.tsx  → navigations API → menü oluştur
                                    Footer.tsx  → navigations API → footer linkleri
                                    DynamicPage → pages API → TiptapRenderer ile render
```

### 4.2 navigations Tablosu Yapısı

```
navigations
├── id            (PK)
├── site_id       (FK → sites) — Hangi sitenin menüsünde
├── page_id       (FK → pages, nullable) — Hangi CMS sayfasına bağlı
├── name          (text) — Menüde görünen isim
├── url           (text) — Link (ör: /hakkimizda, /vizyonumuz)
├── parent_id     (self-ref, nullable) — Üst menü öğesi (dropdown için)
├── location      (text) — 'header' | 'footer' | 'hidden'
├── sort_order    (int) — Sıralama
└── created_at, updated_at
```

### 4.3 Header Bileşeninde Navigasyon Akışı

Her website'in Header bileşeni şu mantığa uymalıdır:

```tsx
// 1. Navigasyon verilerini API'den çek
const { data: navRes } = useQuery({
    queryKey: ['navigations', 'header', SITE_ID],
    queryFn: () => getNavigations({ site_id: SITE_ID, location: 'header' }),
    staleTime: 5 * 60 * 1000,
})

// 2. Statik route'ların URL setini tanımla
const STATIC_URLS = new Set(['/urunler', '/hizmetler', '/bilgi-bankasi', ...])

// 3. Navigasyon verilerini işle
const items = (navRes?.data ?? []) as NavItem[]
const headerItems = items.filter(n => n.location === 'header')

// Dinamik root linkler (statik URL'lerle çakışmayanlar)
const dynamicRoots = headerItems
    .filter(n => !n.parent_id && !STATIC_URLS.has(n.url))
    .sort((a, b) => a.sort_order - b.sort_order)

// Alt menü (children) map'i — parent_id bazlı gruplama
const childrenMap = new Map<number, NavItem[]>()
for (const item of headerItems) {
    if (item.parent_id) {
        const list = childrenMap.get(item.parent_id) || []
        list.push(item)
        childrenMap.set(item.parent_id, list)
    }
}

// Statik linklerin DB karşılığını bul (dropdown çocukları için)
const urlToDbItem = new Map<string, NavItem>()
for (const item of headerItems) {
    if (!item.parent_id) urlToDbItem.set(item.url, item)
}

// 4. Render: Statik linkler + DB'den gelen dropdown children
//    + Dinamik root linkler (CMS'den eklenen sayfalar)
```

**Önemli Kurallar:**
- Statik menü öğeleri (Ürünler, Hizmetler vb.) kodda tanımlıdır — DB'den gelmez.
- CMS'den eklenen sayfa menü yerleşimleri `navigations` tablosundan gelir.
- Bir statik menü öğesinin altına CMS sayfası eklenebilir (`parent_id` ile).
- `location: 'hidden'` olan sayfalar menüde görünmez ama URL'le erişilebilir.

### 4.4 Footer Bileşeninde Navigasyon

Footer linkleri de aynı API'den gelir:
```tsx
const { data: footerNav } = useQuery({
    queryKey: ['navigations', 'footer', SITE_ID],
    queryFn: () => getNavigations({ site_id: SITE_ID, location: 'footer' }),
})
```

---

## 5. DynamicPage — CMS SAYFA RENDER SİSTEMİ (ZORUNLU)

Her website projesinde bir `DynamicPage.tsx` bileşeni **mutlaka** bulunmalıdır.
Bu bileşen, admin panelden oluşturulan CMS sayfalarını render eder.

### 5.1 DynamicPage Şablonu

```tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPage, TiptapRenderer, resolveMediaUrl } from '@forlabs/core'

interface PageData {
  id: number
  slug: string
  title: string
  content: string | null
  cover_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  is_active: boolean
}

const SITE_ID = import.meta.env.VITE_SITE_ID as string

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', slug, SITE_ID],
    queryFn: () => getPage(slug!),
    enabled: !!slug,
  })

  const page = data?.data as PageData | undefined

  if (isLoading) return <LoadingSpinner />
  if (error || !page) return <NotFoundMessage />

  const title = page.title
  const content = page.content
  const metaTitle = page.meta_title || title

  return (
    <>
      <title>{metaTitle} — Site Adı</title>
      {page.meta_description && <meta name="description" content={page.meta_description} />}
      {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}

      <article className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-24">
        {page.cover_image_url && (
          <div className="mb-12 overflow-hidden rounded-2xl shadow-sm">
            <img
              src={resolveMediaUrl(page.cover_image_url)}
              alt={title}
              className="w-full h-48 sm:h-56 md:h-72 object-cover"
            />
          </div>
        )}

        {content ? (
          <TiptapRenderer content={content} />
        ) : (
          <p className="text-slate-400 italic">Bu sayfanın henüz içeriği bulunmuyor.</p>
        )}
      </article>
    </>
  )
}
```

### 5.2 TiptapRenderer Kuralları

- `TiptapRenderer` ve `resolveMediaUrl` her zaman `@forlabs/core`'dan import edilir.
- **Asla kopyalama, asla yeniden yazma** — tek kaynak `packages/core/src/TiptapRenderer.tsx`.
- Sayfa başlığını (`<h1>`) DynamicPage'de ayrıca render etme — içerik zaten başlık içerir.
- `cover_image_url` ayrı render edilir (banner kartı olarak, `object-cover` + `max-height`).
- `resolveMediaUrl()` tüm medya URL'leri için kullanılmalı (API'den gelen relative path'leri çözer).

### 5.3 Desteklenen Blok Türleri

TiptapRenderer şu blok türlerini destekler:
| Blok Türü | Kaynak |
|---|---|
| Başlıklar (H1-H3) | TipTap standart |
| Paragraf | TipTap standart |
| Madde işaretli liste | TipTap standart |
| Numaralı liste | TipTap standart |
| Alıntı (Blockquote) | TipTap standart |
| Görsel | TipTap standart |
| Yatay çizgi | TipTap standart |
| Kod bloğu | TipTap standart |
| **Hero Section** | Özel blok (admin blok editör "+") |
| **İki Sütunlu Grid** | Özel blok (admin blok editör "+") |
| **Accordion (SSS)** | Özel blok (admin blok editör "+") |

### 5.4 Router'da Catch-All Route (ZORUNLU)

`DynamicPage` route'u, router'daki **en son** route olarak eklenmelidir:
```tsx
// src/router.tsx
const DynamicPage = lazy(() => import('@/pages/DynamicPage'))

const routes: RouteObject[] = [
    {
        element: <Layout />,
        children: [
            // ... tüm statik route'lar önce ...
            { path: 'urunler', element: <ProductsPage /> },
            { path: 'hizmetler', element: <ServicesPage /> },
            // ... diğer statik route'lar ...

            // SON SIRADA: CMS dinamik sayfa catch-all
            { path: ':slug', element: <SuspenseWrapper><DynamicPage /></SuspenseWrapper> },
        ],
    },
]
```
**Sıralama kritiktir!** Statik route'lar üstte, `:slug` catch-all en altta olmalı. Aksi halde CMS sayfaları statik sayfaları ezer.

---

## 6. EcosystemProvider — ZORUNLU BOOTSTRAP

Her yeni website'nin `main.tsx` veya `App.tsx` dosyasında `EcosystemProvider` ile sarmalanmalıdır:

```tsx
import { EcosystemProvider } from '@forlabs/core'

const API_URL = import.meta.env.VITE_API_URL as string
const SITE_ID = import.meta.env.VITE_SITE_ID as string

function App() {
    return (
        <EcosystemProvider apiUrl={API_URL} siteId={SITE_ID}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </EcosystemProvider>
    )
}
```

Bu olmadan:
- `getPage()`, `getProducts()` gibi API fonksiyonları çalışmaz (apiUrl/siteId boş kalır)
- `resolveMediaUrl()` medya URL'lerini çözemez
- `TiptapRenderer` içindeki görseller kırık render olur

---

## 7. CLOUDFLARE PAGES DEPLOY

### 7.1 Proje Oluşturma
```bash
# Cloudflare Pages projesi adı: forlabs-{slug}
# Örn: forlabs-gidakimya, forlabs-labkurulum
npx wrangler pages deploy dist --project-name=forlabs-{slug}
```

### 7.2 Ortam Değişkenleri (Cloudflare Dashboard)
```
VITE_SITE_ID = {SITE_ID}
VITE_API_URL = https://api.for-labs.com
```

### 7.3 Deploy Sonrası
- CORS whitelist'e `https://forlabs-{slug}.pages.dev` eklendiğinden emin ol.
- Custom domain bağlandıysa, domain'i de CORS listesine ekle.

---

## 8. KONTROL LİSTESİ — Yeni Website Ekleme

Yeni bir `apps/web-{slug}` projesi eklerken bu listeyi sırayla takip et:

- [ ] Site, `sites` tablosunda mevcut ve `site_id` not edildi
- [ ] `DOMAIN_MAP`'e yeni domain eklendi (`packages/shared/src/constants/index.ts`)
- [ ] CORS whitelist'e dev port + production domain + pages.dev eklendi (`apps/api/src/index.ts`)
- [ ] Proje klasörü oluşturuldu: `apps/web-{slug}/`
- [ ] `package.json` — doğru ad, benzersiz dev port
- [ ] `.env` — `VITE_SITE_ID` ve `VITE_API_URL` set edildi
- [ ] Bağımlılıklar kuruldu (`@forlabs/core`, `@forlabs/shared`, React, TanStack Query, vb.)
- [ ] `src/index.css` — **`@source "../../../packages/core/src"` direktifi eklendi** ⚠️ KRİTİK
- [ ] `EcosystemProvider` ile app sarmalandı (`main.tsx` / `App.tsx`)
- [ ] `DynamicPage.tsx` oluşturuldu (`TiptapRenderer` + `resolveMediaUrl` ile)
- [ ] Router'da `:slug` catch-all route **en sona** eklendi
- [ ] Header bileşeni `GET /api/navigations?site_id=N&location=header` kullanıyor
- [ ] Footer bileşeni `GET /api/navigations?site_id=N&location=footer` kullanıyor
- [ ] Statik URL'ler ile dinamik nav linkleri çakışma kontrolü yapıldı
- [ ] Dark mode kullanılmıyor (`dark:` varyantları yok, `color-scheme: light`)
- [ ] API çağrılarında hardcoded URL/ID yok — `.env`'den geliyor
- [ ] Cloudflare Pages projesi oluşturuldu (`forlabs-{slug}` prefix'i ile)
- [ ] Deploy edildi ve CORS/navigasyon test edildi

---

## 9. YAPILMAMASI GEREKENLER (YASAKLAR)

1. **`packages/core/src/TiptapRenderer.tsx`'i kopyalama veya override etme** — tek kaynak orası.
2. **Navigasyon verilerini hardcode etme** — her zaman `/api/navigations` API'sinden çek.
3. **`DynamicPage`'de sayfa başlığını ayrıca `<h1>` olarak render etme** — içerik zaten başlık içerir.
4. **`@source` direktifini unutma** — Tailwind v4'te `packages/core` class'ları sessizce kaybolur.
5. **Statik route'lardan sonra `:slug` catch-all'ı koymayı unutma** — CMS sayfaları erişilemez olur.
6. **`dark:` Tailwind varyantları kullanma** — tüm siteler light-only.
7. **`useEffect + fetch` kombinasyonu kullanma** — her zaman TanStack Query.
8. **Entity tiplerini yeniden tanımlama** — `@forlabs/shared`'dan import et.
9. **`site_id`'yi hardcode etme** — `.env`'den `VITE_SITE_ID` olarak gelir.
10. **CORS whitelist güncellemeyi unutma** — API istekleri sessizce başarısız olur.
