-- Seed data for forlabs-cms-db
-- Run via: wrangler d1 execute forlabs-cms-db --local --file=../../packages/db/src/seed.sql

-- ─── SITES ───
INSERT INTO sites (slug, domain, name, description, has_ecommerce) VALUES
  ('forlabs', 'for-labs.com', 'For-Labs', 'Merkez laboratuvar ekipmanları ve kimyasal çözümler', 1),
  ('atagotr', 'atagotr.com', 'Atago TR', 'Gelişmiş e-ticaret ve laboratuvar katalog sitesi', 1),
  ('gidakimya', 'gidakimya.com', 'Gıda Kimya', 'Sektörel kimyasal ürün vitrini', 0),
  ('labkurulum', 'labkurulum.com', 'Lab Kurulum', 'Hizmet ve proje odaklı laboratuvar kurulumu', 0),
  ('gidatest', 'gidatest.com', 'Gıda Test', 'Gıda analiz ve raporlama hizmetleri', 0),
  ('alerjen', 'alerjen.net', 'Alerjen', 'Alerjen bilgi bankası ve makale portalı', 0),
  ('hijyenkontrol', 'hijyenkontrol.com', 'Hijyen Kontrol', 'Denetim hizmetleri ve ekipman listeleme', 0);

-- ─── CATEGORIES ───
INSERT INTO categories (slug, name, description, sort_order) VALUES
  ('lab-ekipmanlari', 'Laboratuvar Ekipmanları', 'Analiz ve ölçüm cihazları', 1),
  ('kimyasal-urunler', 'Kimyasal Ürünler', 'Reaktifler, çözeltiler ve kimyasal malzemeler', 2),
  ('sarf-malzemeleri', 'Sarf Malzemeleri', 'Tek kullanımlık laboratuvar malzemeleri', 3),
  ('hijyen-urunleri', 'Hijyen Ürünleri', 'Temizlik ve dezenfeksiyon ürünleri', 4),
  ('test-kitleri', 'Test Kitleri', 'Hızlı test ve analiz kitleri', 5);

-- ─── PRODUCTS (Global Catalog) ───
INSERT INTO products (slug, title, description, specs, price, currency, category_id, is_active) VALUES
  ('dijital-refraktometre-rx-5000i',
   'Dijital Refraktometre RX-5000i',
   'Yüksek hassasiyetli dijital refraktometre. Gıda, içecek ve kimya endüstrisi için idealdır.',
   '{"olcum_araligi": "1.3200 - 1.5800 nD", "hassasiyet": "±0.00004 nD", "sicaklik": "5-60°C"}',
   45000.00, 'TRY', 1, 1),

  ('portable-ph-metre-ph-33',
   'Portatif pH Metre PH-33',
   'Sahada ve laboratuvarda kullanılabilen taşınabilir pH ölçüm cihazı.',
   '{"olcum_araligi": "0.00 - 14.00 pH", "hassasiyet": "±0.01 pH", "batarya": "2000 saat"}',
   12500.00, 'TRY', 1, 1),

  ('sodyum-hidroksit-5l',
   'Sodyum Hidroksit (NaOH) 5L',
   'Analitik saflıkta sodyum hidroksit çözeltisi, 1N konsantrasyon.',
   '{"konsantrasyon": "1N", "saflık": "ACS Grade", "hacim": "5000 mL"}',
   850.00, 'TRY', 2, 1),

  ('petri-kabi-90mm-steril',
   'Petri Kabı 90mm Steril (20li)',
   'Gamma ışınıyla sterilize edilmiş tek kullanımlık petri kabı.',
   '{"cap": "90mm", "malzeme": "Polistiren", "sterilizasyon": "Gamma"}',
   320.00, 'TRY', 3, 1),

  ('alerjen-test-kiti-gluten',
   'Alerjen Test Kiti - Gluten',
   'Gıda numunelerinde hızlı gluten tespiti için lateral akış test kiti.',
   '{"hassasiyet": "10 ppm", "sonuc_suresi": "10 dakika", "test_sayisi": "25 test/kutu"}',
   2750.00, 'TRY', 5, 1),

  ('yuzey-dezenfektani-5l',
   'Yüzey Dezenfektanı 5L',
   'Gıda temas yüzeyleri için uygun, geniş spektrumlu dezenfektan.',
   '{"aktif_madde": "Kuaterner Amonyum", "kullanim": "Hazır kullanım", "hacim": "5000 mL"}',
   450.00, 'TRY', 4, 1);

-- ─── SITE OVERRIDES (example: atagotr.com overrides for some products) ───
INSERT INTO site_product_overrides (site_id, product_id, title, price, is_featured, sort_order) VALUES
  -- atagotr.com (site_id=2) shows the refractometer as featured, with a different price
  (2, 1, 'ATAGO Dijital Refraktometre RX-5000i', 42000.00, 1, 1),
  -- atagotr.com shows pH meter with custom branding
  (2, 2, 'ATAGO Portatif pH Metre PH-33', NULL, 1, 2);

-- ─── ARTICLES ───
INSERT INTO articles (slug, title, excerpt, content, category_id, author, is_active) VALUES
  ('refraktometre-nedir',
   'Refraktometre Nedir ve Nasıl Kullanılır?',
   'Refraktometre, bir sıvının kırılma indeksini ölçen hassas bir optik cihazdır.',
   '<h2>Refraktometre Nedir?</h2><p>Refraktometre, ışığın bir ortamdan geçerken kırılma açısını ölçen bir cihazdır. Bu ölçüm, sıvının konsantrasyonu hakkında bilgi verir.</p><h2>Kullanım Alanları</h2><p>Gıda endüstrisinde Brix ölçümü, ilaç sanayinde saflık kontrolü ve kimya laboratuvarlarında çözelti konsantrasyonu belirleme gibi geniş bir kullanım alanına sahiptir.</p>',
   1, 'Dr. Mehmet Öz', 1),

  ('gida-alerjenleri-rehberi',
   'Gıda Alerjenleri Rehberi',
   'Türkiye''de etiketlenmesi zorunlu 14 alerjen hakkında kapsamlı bilgi.',
   '<h2>Alerjen Nedir?</h2><p>Alerjenler, bağışıklık sisteminin aşırı tepki verdiği maddelerdir. Gıda alerjenleri, bazı bireylerde ciddi bağışıklık tepkilerine yol açabilir.</p><h2>Zorunlu Etiketleme</h2><p>Türk Gıda Kodeksi gereği 14 alerjen grubunun gıda etiketlerinde belirtilmesi zorunludur.</p>',
   5, 'Uzm. Dyt. Ayşe Yıldız', 1),

  ('laboratuvar-hijyen-protokolleri',
   'Laboratuvar Hijyen Protokolleri',
   'Gıda laboratuvarlarında uygulanması gereken temel hijyen kuralları.',
   '<h2>Hijyen Neden Önemli?</h2><p>Laboratuvar ortamında kontaminasyon riskini minimize etmek, doğru analiz sonuçları için kritik öneme sahiptir.</p><h2>Temel Protokoller</h2><p>El yıkama, yüzey dezenfeksiyonu, ekipman sterilizasyonu ve atık yönetimi temel hijyen protokollerinin başında gelir.</p>',
   4, 'Prof. Dr. Ali Demir', 1);

-- ─── ARTICLE OVERRIDES (example: alerjen.net customizes the allergen article) ───
INSERT INTO site_article_overrides (site_id, article_id, title, is_featured, sort_order) VALUES
  -- alerjen.net (site_id=6) features and renames the allergen article
  (6, 2, 'Alerjen.net - Kapsamlı Gıda Alerjenleri Rehberi', 1, 1);

-- ─── ADMIN USER (password: "admin123" — will be changed in production) ───
-- Hash is SHA-256 of "admin123" — change in production!
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@for-labs.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Sistem Admin', 'super_admin');
