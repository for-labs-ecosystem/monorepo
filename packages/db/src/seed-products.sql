-- Re-seed products with the expanded schema fields
-- Run: cd apps/api && npx wrangler d1 execute forlabs-cms-db --local --file=../../packages/db/src/seed-products.sql

-- Clear existing products and overrides (safe for dev)
DELETE FROM site_product_overrides;
DELETE FROM products;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name = 'products';

-- ─── PRODUCT 1: Dijital Refraktometre ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'dijital-refraktometre-rx-5000i',
    'Dijital Refraktometre RX-5000i',
    'Yüksek hassasiyetli dijital refraktometre. Gıda, içecek ve kimya endüstrisi için idealdır.',
    '<h2>Ürün Detayı</h2><p>ATAGO RX-5000i, endüstriyel ve laboratuvar uygulamaları için tasarlanmış yüksek hassasiyetli bir dijital refraktometredir. Dahili Peltier termostatik kontrol sayesinde sabit sıcaklıkta ölçüm yapabilir.</p><h2>Öne Çıkan Özellikler</h2><ul><li>Otomatik sıcaklık kompanzasyonu</li><li>USB ve RS-232 veri çıkışı</li><li>GLP/GMP uyumlu veri kaydı</li><li>Kolay temizlenebilir prizma yüzeyi</li></ul>',
    '{"olcum_araligi": "1.3200 - 1.5800 nD", "hassasiyet": "±0.00004 nD", "sicaklik": "5-60°C"}',
    45000.00, 52000.00, 'TRY', 'Adet',
    'ATAGO', 'RX-5000i', 'FL-REF-001', '2 Yıl', 'Çok Satan',
    '[{"key":"Ölçüm Aralığı","value":"1.3200 - 1.5800 nD"},{"key":"Hassasiyet","value":"±0.00004 nD"},{"key":"Sıcaklık Aralığı","value":"5-60°C"},{"key":"Ekran","value":"Renkli Dokunmatik LCD"},{"key":"Bağlantı","value":"USB, RS-232"},{"key":"Boyut","value":"370 × 175 × 200 mm"},{"key":"Ağırlık","value":"6.9 kg"}]',
    '["Gıda Endüstrisi","İlaç Sektörü","Kimya Laboratuvarı","İçecek Üretimi","Petrokimya"]',
    '["refraktometre","brix","kırılma indeksi","atago","optik ölçüm"]',
    '["Brix Ölçüm","Kırılma İndeksi Ölçüm","Konsantrasyon Analizi"]',
    '["Brix Measurement","Refractive Index","Concentration Analysis"]',
    'full-auto',
    '["GLP/GMP","CE","FDA 21 CFR Part 11"]',
    1, 1, 1, 1
);

-- ─── PRODUCT 2: Portatif pH Metre ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'portable-ph-metre-ph-33',
    'Portatif pH Metre PH-33',
    'Sahada ve laboratuvarda kullanılabilen taşınabilir pH ölçüm cihazı. IP67 su geçirmez koruma.',
    '<h2>Ürün Detayı</h2><p>PH-33 taşınabilir pH metre, saha ve laboratuvar koşullarında güvenilir pH ölçümü sağlar. IP67 koruma sınıfı ile su ve toz geçirmez yapıya sahiptir.</p><h2>Avantajları</h2><ul><li>Tek elle kullanım ergonomisi</li><li>Otomatik kalibrasyon (1-3 nokta)</li><li>2000 saat pil ömrü</li><li>200 ölçüm hafızası</li></ul>',
    '{"olcum_araligi": "0.00 - 14.00 pH", "hassasiyet": "±0.01 pH", "batarya": "2000 saat"}',
    12500.00, NULL, 'TRY', 'Adet',
    'ATAGO', 'PH-33', 'FL-PH-001', '1 Yıl', 'Yeni',
    '[{"key":"Ölçüm Aralığı","value":"0.00 - 14.00 pH"},{"key":"Hassasiyet","value":"±0.01 pH"},{"key":"Pil Ömrü","value":"2000 saat"},{"key":"Koruma Sınıfı","value":"IP67"},{"key":"Hafıza","value":"200 ölçüm"},{"key":"Ağırlık","value":"110 g"}]',
    '["Gıda Endüstrisi","Su Arıtma","Tarım","Çevre Analizi"]',
    '["ph metre","ph ölçüm","taşınabilir","saha ölçüm","su kalitesi"]',
    '["pH Ölçüm","Asitlik Analizi","Su Kalitesi Ölçüm"]',
    '["pH Measurement","Acidity Analysis","Water Quality"]',
    'manual',
    '["CE","IP67"]',
    1, 1, 1, 2
);

-- ─── PRODUCT 3: Sodyum Hidroksit ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'sodyum-hidroksit-5l',
    'Sodyum Hidroksit (NaOH) 5L',
    'Analitik saflıkta sodyum hidroksit çözeltisi, 1N konsantrasyon. ISO 17025 sertifikalı.',
    '<h2>Ürün Bilgileri</h2><p>Yüksek saflıkta sodyum hidroksit çözeltisi. Titrasyon, pH ayarı ve kimyasal sentez uygulamalarında güvenle kullanılabilir.</p><h2>Güvenlik</h2><p>Korozif madde sınıfında yer alır. Kullanım sırasında koruyucu gözlük ve eldiven gereklidir. MSDS belgesi ürünle birlikte teslim edilir.</p>',
    '{"konsantrasyon": "1N", "saflik": "ACS Grade", "hacim": "5000 mL"}',
    850.00, 1100.00, 'TRY', 'Şişe',
    'Merck', '1.09137', 'FL-KIM-001', NULL, 'İndirimli',
    '[{"key":"Konsantrasyon","value":"1N (1 mol/L)"},{"key":"Saflık","value":"ACS Reagent Grade"},{"key":"Hacim","value":"5000 mL"},{"key":"Yoğunluk","value":"1.04 g/cm³"},{"key":"CAS No","value":"1310-73-2"},{"key":"Raf Ömrü","value":"24 ay"}]',
    '["Kimya Laboratuvarı","Gıda Analizi","Su Arıtma","Eğitim"]',
    '["sodyum hidroksit","naoh","kostik","kimyasal","reaktif","titrasyon"]',
    '["Titrasyon","pH Ayarı","Kimyasal Sentez"]',
    '["Titration","pH Adjustment","Chemical Synthesis"]',
    NULL,
    '["ACS Grade","ISO 17025","MSDS"]',
    2, 1, 0, 3
);

-- ─── PRODUCT 4: Petri Kabı ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'petri-kabi-90mm-steril',
    'Petri Kabı 90mm Steril (20''li)',
    'Gamma ışınıyla sterilize edilmiş tek kullanımlık petri kabı. Mikrobiyoloji laboratuvarları için.',
    '<h2>Ürün Açıklaması</h2><p>Yüksek kaliteli polistiren hammaddeden üretilmiş disposable petri kapları. Gamma radyasyon ile sterilize edilmiştir.</p><h2>Kalite</h2><p>ISO 9001 üretim standartlarına uygun. Her parti sertifikalıdır.</p>',
    '{"cap": "90mm", "malzeme": "Polistiren", "sterilizasyon": "Gamma"}',
    320.00, NULL, 'TRY', 'Paket (20 Adet)',
    'Isolab', '120.13.090', 'FL-SARF-001', NULL, NULL,
    '[{"key":"Çap","value":"90 mm"},{"key":"Malzeme","value":"Polistiren (PS)"},{"key":"Sterilizasyon","value":"Gamma Işını"},{"key":"Tip","value":"Havalandırmalı"},{"key":"Paket İçeriği","value":"20 adet"}]',
    '["Mikrobiyoloji","Gıda Kontrolü","İlaç Sektörü","Eğitim Laboratuvarı"]',
    '["petri kabı","steril","mikrobiyoloji","sarf malzeme","tek kullanımlık"]',
    '["Mikrobiyolojik Analiz","Koloni Sayım","Kültür Hazırlama"]',
    '["Microbiological Analysis","Colony Counting","Culture Preparation"]',
    NULL,
    '["ISO 9001","CE","Steril"]',
    3, 1, 0, 4
);

-- ─── PRODUCT 5: Alerjen Test Kiti ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'alerjen-test-kiti-gluten',
    'Alerjen Test Kiti - Gluten',
    'Gıda numunelerinde hızlı gluten tespiti için lateral akış test kiti. 10 ppm hassasiyet.',
    '<h2>Hızlı Gluten Testi</h2><p>Bu lateral akış test kiti, gıda numunelerinde gluten (gliadin) varlığını hızlı ve güvenilir bir şekilde tespit eder.</p><h2>Uygulama</h2><p>Numune hazırlama kiti dahildir. Sonuç 10 dakikada alınır.</p>',
    '{"hassasiyet": "10 ppm", "sonuc_suresi": "10 dakika", "test_sayisi": "25 test/kutu"}',
    2750.00, 3200.00, 'TRY', 'Kutu (25 Test)',
    'R-Biopharm', 'R7001', 'FL-TEST-001', '6 Ay', 'Sınırlı Stok',
    '[{"key":"Hassasiyet","value":"10 ppm (mg/kg)"},{"key":"Sonuç Süresi","value":"10 dakika"},{"key":"Test Sayısı","value":"25 test/kutu"},{"key":"Hedef Analiz","value":"Gliadin (Gluten)"},{"key":"Metot","value":"Lateral Akış İmmünokromatografi"},{"key":"Saklama","value":"2-8°C"}]',
    '["Gıda Üretimi","Kalite Kontrol","Denetim","Restoran & Otel"]',
    '["alerjen","gluten","test kiti","gıda güvenliği","hızlı test","gliadin"]',
    '["Alerjen Testi","Gluten Tespiti","İmmünokromatografi","Hızlı Test"]',
    '["Allergen Testing","Gluten Detection","Immunochromatography","Rapid Test"]',
    'manual',
    '["CE","AOAC","ISO 21415"]',
    5, 1, 1, 5
);

-- ─── PRODUCT 6: Yüzey Dezenfektanı ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'yuzey-dezenfektani-5l',
    'Yüzey Dezenfektanı 5L',
    'Gıda temas yüzeyleri için uygun, geniş spektrumlu dezenfektan. Bakanlık onaylı.',
    '<h2>Ürün Detayı</h2><p>Kuaterner amonyum bazlı geniş spektrumlu yüzey dezenfektanı. Gıda üretim tesisleri, hastaneler ve laboratuvarlar için uygundur.</p>',
    '{"aktif_madde": "Kuaterner Amonyum", "kullanim": "Hazır Kullanım", "hacim": "5000 mL"}',
    450.00, NULL, 'TRY', 'Bidon (5L)',
    'For-Labs', 'FLHYG-005', 'FL-HIJ-001', NULL, NULL,
    '[{"key":"Aktif Madde","value":"Kuaterner Amonyum Bileşikleri"},{"key":"Konsantrasyon","value":"Hazır Kullanım"},{"key":"Hacim","value":"5000 mL"},{"key":"pH","value":"7.0 ± 0.5"},{"key":"Durulama","value":"Gerekmez"},{"key":"Onay","value":"T.C. Sağlık Bakanlığı"}]',
    '["Gıda Üretimi","Hastane","Laboratuvar","Otel & Restoran","Eğitim Kurumları"]',
    '["dezenfektan","hijyen","yüzey temizlik","gıda güvenliği","antibakteriyel"]',
    '["Hijyen Kontrol","Yüzey Dezenfeksiyon","Mikrobiyolojik Kontrol"]',
    '["Hygiene Control","Surface Disinfection","Microbiological Control"]',
    NULL,
    '["T.C. Sağlık Bakanlığı","EN 13697","EN 1276"]',
    4, 1, 0, 6
);

-- ─── PRODUCT 7: Otomatik Titratör ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'otomatik-titrator-at-710',
    'Otomatik Titratör AT-710',
    'Tam otomatik potansiyometrik titratör. Asit-baz, oksidasyon-redüksiyon ve çöktürme titrasyonları.',
    '<h2>Profesyonel Titrasyon Çözümü</h2><p>AT-710, modüler tasarımı ile farklı titrasyon türlerini destekleyen üst düzey bir laboratuvar cihazıdır.</p>',
    '{"buret_hacmi": "20 mL", "cozunurluk": "0.001 mL", "tekrarlanabilirlik": "±0.01 mL"}',
    78000.00, 89000.00, 'TRY', 'Adet',
    'Kyoto Electronics', 'AT-710', 'FL-TIT-001', '3 Yıl', 'Özel Fiyat',
    '[{"key":"Büret Hacmi","value":"20 mL"},{"key":"Çözünürlük","value":"0.001 mL"},{"key":"Tekrarlanabilirlik","value":"±0.01 mL"},{"key":"Titrasyon Türleri","value":"Asit-Baz, Redoks, Karl Fischer"},{"key":"Numune Değiştirici","value":"Opsiyonel (50 numune)"},{"key":"Ekran","value":"7 inç Renkli Dokunmatik"},{"key":"Ağırlık","value":"8.5 kg"}]',
    '["İlaç Sektörü","Kimya Laboratuvarı","Gıda Analizi","Petrokimya","Çevre Laboratuvarı"]',
    '["titratör","titrasyon","asit baz","karl fischer","potansiyometrik"]',
    '["Titrasyon","Asit-Baz Analizi","Karl Fischer","Redoks Titrasyonu","Potansiyometrik Ölçüm"]',
    '["Titration","Acid-Base Analysis","Karl Fischer","Redox Titration","Potentiometric"]',
    'full-auto',
    '["GLP/GMP","ISO 17025","CE","FDA 21 CFR Part 11"]',
    1, 1, 1, 7
);

-- ─── PRODUCT 8: Dijital Brix Refraktometre (El Tipi) ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'dijital-brix-refraktometre-pal-1',
    'Dijital Brix Refraktometre PAL-1',
    'Cebe sığan dijital Brix refraktometre. Meyve suyu, reçel ve şekerli gıdalar için mükemmel.',
    '<h2>Kompakt Brix Ölçümü</h2><p>PAL-1, dünyanın en popüler cep tipi dijital refraktometresidir. Sadece 2-3 damla numune ile saniyeler içinde Brix değerini ölçer.</p>',
    '{"olcum_araligi": "0.0 - 53.0% Brix", "hassasiyet": "±0.2% Brix"}',
    8500.00, 9800.00, 'TRY', 'Adet',
    'ATAGO', 'PAL-1', 'FL-REF-002', '2 Yıl', NULL,
    '[{"key":"Ölçüm Aralığı","value":"0.0 - 53.0% Brix"},{"key":"Hassasiyet","value":"±0.2% Brix"},{"key":"Numune Miktarı","value":"2-3 damla"},{"key":"Ölçüm Süresi","value":"3 saniye"},{"key":"Koruma","value":"IP65"},{"key":"Pil","value":"AAA × 2 (11.000 ölçüm)"},{"key":"Ağırlık","value":"100 g"}]',
    '["Gıda Üretimi","Meyve Suyu","Şarapçılık","Tarım","Balcılık"]',
    '["brix","refraktometre","el tipi","şeker ölçüm","meyve suyu","atago"]',
    '["Brix Ölçüm","Şeker Konsantrasyonu"]',
    '["Brix Measurement","Sugar Concentration"]',
    'manual',
    '["CE","IP65"]',
    1, 1, 0, 8
);

-- ─── PRODUCT 9: Mikrobiyolojik Besiyeri Seti ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'mikrobiyolojik-besiyeri-seti',
    'Mikrobiyolojik Besiyeri Seti (Temel Paket)',
    'Gıda mikrobiyolojisi için temel besiyeri koleksiyonu. PCA, VRB, YGC ve Baird Parker dahil.',
    '<h2>Temel Besiyeri Paketi</h2><p>Gıda mikrobiyolojisi laboratuvarları için tasarlanmış bu başlangıç paketi, en sık kullanılan 4 besiyerini içerir.</p>',
    '{"icerik": "4 adet 500g besiyeri", "saklama": "15-25°C, karanlık", "raf_omru": "3 yıl"}',
    4200.00, 4800.00, 'TRY', 'Set',
    'Merck', 'BesiSet-01', 'FL-SARF-002', NULL, 'İndirimli',
    '[{"key":"İçerik","value":"4 × 500g Besiyeri"},{"key":"Besiyerleri","value":"PCA, VRB, YGC, Baird Parker"},{"key":"Saklama","value":"15-25°C, Karanlık Ortam"},{"key":"Raf Ömrü","value":"3 yıl"},{"key":"Form","value":"Toz (Dehidre)"},{"key":"Kalite","value":"ISO 11133 uyumlu"}]',
    '["Gıda Kontrolü","Mikrobiyoloji","Kalite Laboratuvarı","Eğitim"]',
    '["besiyeri","mikrobiyoloji","pca","gıda analizi","agar","kültür ortamı"]',
    '["Mikrobiyolojik Analiz","Koloni Sayım","Toplam Canlı Sayım","Maya-Küf Analizi"]',
    '["Microbiological Analysis","Colony Counting","Total Viable Count","Yeast-Mold Analysis"]',
    NULL,
    '["ISO 11133","ISO 7218"]',
    3, 1, 0, 9
);

-- ─── PRODUCT 10: Laboratuvar Buzdolabı ───
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, analysis_types_en, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES (
    'laboratuvar-buzdolabi-360l',
    'Laboratuvar Buzdolabı 360L',
    'Farma sınıfı laboratuvar buzdolabı. +2°C / +8°C aralığında hassas sıcaklık kontrolü.',
    '<h2>Profesyonel Saklama</h2><p>360 litre kapasiteli bu farma sınıfı buzdolabı, numunelerin, reaktiflerin ve besiyerlerinin güvenli saklanması için tasarlanmıştır.</p>',
    '{"kapasite": "360 L", "sicaklik": "+2°C / +8°C", "boyut": "60×64×184 cm"}',
    32000.00, NULL, 'TRY', 'Adet',
    'Binder', 'KB 400', 'FL-EKP-001', '5 Yıl', NULL,
    '[{"key":"Kapasite","value":"360 Litre"},{"key":"Sıcaklık Aralığı","value":"+2°C / +8°C"},{"key":"Hassasiyet","value":"±0.5°C"},{"key":"Boyutlar (GxDxY)","value":"60 × 64 × 184 cm"},{"key":"Raf Sayısı","value":"5 ayarlanabilir"},{"key":"Enerji Sınıfı","value":"A++"},{"key":"Ağırlık","value":"78 kg"}]',
    '["İlaç Sektörü","Laboratuvar","Hastane","Kan Bankası","Veterinerlik"]',
    '["buzdolabı","laboratuvar","farma","numune saklama","soğutucu"]',
    '["Numune Saklama","Reaktif Saklama","Sıcaklık Kontrolü"]',
    '["Sample Storage","Reagent Storage","Temperature Control"]',
    'full-auto',
    '["GMP","CE","IEC 60068","DIN 12880"]',
    1, 1, 0, 10
);

-- ─── SITE OVERRIDES ───
-- Now product IDs are 1-10 (autoincrement reset)

-- atagotr.com (site_id=2) — ATAGO branded products featured
INSERT INTO site_product_overrides (site_id, product_id, title, price, campaign_label, is_featured, is_visible, sort_order) VALUES
    (2, 1, 'ATAGO Dijital Refraktometre RX-5000i', 42000.00, 'En Çok Tercih Edilen', 1, 1, 1),
    (2, 2, 'ATAGO Portatif pH Metre PH-33', NULL, NULL, 1, 1, 2),
    (2, 8, 'ATAGO PAL-1 Dijital Brix Refraktometre', 7900.00, 'Kampanyalı', 1, 1, 3);

-- forlabs.com (site_id=1) — all visible
INSERT INTO site_product_overrides (site_id, product_id, is_featured, is_visible, sort_order) VALUES
    (1, 1, 1, 1, 1),
    (1, 2, 1, 1, 2),
    (1, 3, 0, 1, 3),
    (1, 4, 0, 1, 4),
    (1, 5, 1, 1, 5),
    (1, 6, 0, 1, 6),
    (1, 7, 1, 1, 7),
    (1, 8, 0, 1, 8),
    (1, 9, 0, 1, 9),
    (1, 10, 0, 1, 10);

-- gidakimya.com (site_id=3) — only relevant products visible
INSERT INTO site_product_overrides (site_id, product_id, is_featured, is_visible, sort_order) VALUES
    (3, 3, 1, 1, 1),
    (3, 6, 1, 1, 2),
    (3, 9, 0, 1, 3);

-- alerjen.net (site_id=6) — only allergen products
INSERT INTO site_product_overrides (site_id, product_id, is_featured, is_visible, sort_order) VALUES
    (6, 5, 1, 1, 1);
