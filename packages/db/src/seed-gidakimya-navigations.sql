-- Seed static navigation entries for Gıda Kimya (site_id = 3)
-- These represent the hardcoded static menu items in web-gidakimya's Header.tsx
-- so the admin panel can show them as parent options in the "Üst Menü Kırılımı" dropdown.
-- page_id is NULL because these are not CMS pages — they're static routes.

-- First, check if they already exist to avoid duplicates
INSERT INTO navigations (site_id, page_id, name, url, parent_id, location, sort_order)
SELECT 3, NULL, 'Ürünler', '/urunler', NULL, 'header', 0
WHERE NOT EXISTS (SELECT 1 FROM navigations WHERE site_id = 3 AND url = '/urunler' AND location = 'header' AND page_id IS NULL);

INSERT INTO navigations (site_id, page_id, name, url, parent_id, location, sort_order)
SELECT 3, NULL, 'Bilgi Bankası', '/bilgi-bankasi', NULL, 'header', 1
WHERE NOT EXISTS (SELECT 1 FROM navigations WHERE site_id = 3 AND url = '/bilgi-bankasi' AND location = 'header' AND page_id IS NULL);

INSERT INTO navigations (site_id, page_id, name, url, parent_id, location, sort_order)
SELECT 3, NULL, 'Hizmetler', '/hizmetler', NULL, 'header', 2
WHERE NOT EXISTS (SELECT 1 FROM navigations WHERE site_id = 3 AND url = '/hizmetler' AND location = 'header' AND page_id IS NULL);

INSERT INTO navigations (site_id, page_id, name, url, parent_id, location, sort_order)
SELECT 3, NULL, 'Hakkımızda', '/hakkimizda', NULL, 'header', 3
WHERE NOT EXISTS (SELECT 1 FROM navigations WHERE site_id = 3 AND url = '/hakkimizda' AND location = 'header' AND page_id IS NULL);
