-- ═══════════════════════════════════════════════════════════════
-- Wizard Steps & Options Seed Data (site_id = 1 → for-labs.com)
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Sektör
INSERT INTO wizard_steps (site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en, is_active)
VALUES (1, 1, 'sectors', 'Sektör', 'Sector', 'Merhaba, biz', 'Hello, we are a team', 'sektöründe faaliyet gösteren bir ekibiz.', 'operating in the sector.', 1);

INSERT INTO wizard_options (step_id, label, label_en, value, description, description_en, match_tags, sort_order, is_active) VALUES
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=1), 'Gıda ve İçecek', 'Food & Beverage', 'Gıda Endüstrisi', 'Üretim, işleme ve paketleme tesisleri', 'Production, processing, and packaging facilities', '["Gıda Endüstrisi"]', 1, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=1), 'İlaç ve Ar-Ge', 'Pharma & R&D', 'İlaç Sektörü', 'Farmasötik araştırma ve geliştirme', 'Pharmaceutical research and development', '["İlaç Sektörü"]', 2, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=1), 'Çevre Analizi', 'Environmental Analysis', 'Çevre Analizi', 'Su, atık ve toprak analiz laboratuvarları', 'Water, waste, and soil analysis laboratories', '["Çevre Analizi"]', 3, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=1), 'Endüstriyel Kimya', 'Industrial Chemistry', 'Kimya Laboratuvarı', 'Hammadde ve ürün kalite kontrolü', 'Raw material and product quality control', '["Kimya Laboratuvarı"]', 4, 1);

-- Step 2: Analiz Tipi
INSERT INTO wizard_steps (site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en, is_active)
VALUES (1, 2, 'analysis_types', 'Analiz Tipi', 'Analysis Type', 'Laboratuvar çalışmalarımızın odağında', 'Our laboratory work will focus on', 'süreçleri yer alacak.', 'processes.', 1);

INSERT INTO wizard_options (step_id, label, label_en, value, description, description_en, match_tags, sort_order, is_active) VALUES
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=2), 'Kalite Kontrol', 'Quality Control', 'Kalite Kontrol', 'Rutin ürün standartlarını doğrulama', 'Routine product standards verification', '["Kalite Kontrol"]', 1, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=2), 'Temel Araştırma', 'Fundamental Research', 'Temel Araştırma', 'Yeni metot ve ürün geliştirme', 'New method and product development', '["Temel Araştırma"]', 2, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=2), 'Mikrobiyoloji', 'Microbiology', 'Mikrobiyoloji', 'Bakteri, maya ve küf sayımı', 'Bacteria, yeast, and mold counting', '["Mikrobiyoloji"]', 3, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=2), 'Fiziksel Analiz', 'Physical Analysis', 'Fiziksel Analiz', 'Viskozite, yoğunluk ve refraktometre', 'Viscosity, density, and refractometer', '["Fiziksel Analiz"]', 4, 1);

-- Step 3: Uyumluluk
INSERT INTO wizard_steps (site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en, is_active)
VALUES (1, 3, 'compliance', 'Uyumluluk', 'Compliance', 'Güvenilir sonuçlar için', 'For reliable results, we aim for full compliance with', 'standartlarına tam uyum hedefliyoruz.', 'standards.', 1);

INSERT INTO wizard_options (step_id, label, label_en, value, description, description_en, match_tags, sort_order, is_active) VALUES
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=3), 'ISO 17025', 'ISO 17025', 'ISO 17025', 'Akredite laboratuvar yetkinliği', 'Accredited laboratory competence', '["ISO 17025"]', 1, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=3), 'GMP / GLP', 'GMP / GLP', 'GMP / GLP', 'İyi Üretim ve Laboratuvar Uygulamaları', 'Good Manufacturing and Laboratory Practices', '["GLP/GMP"]', 2, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=3), 'FDA', 'FDA', 'FDA', 'Elektronik kayıt ve imza güvenliği', 'Electronic record and signature security', '["FDA"]', 3, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=3), 'Standart / Belirtilmemiş', 'Standard / Not Specified', 'Standart', 'Genel endüstriyel standartlar', 'General industrial standards', '["CE"]', 4, 1);

-- Step 4: Otomasyon
INSERT INTO wizard_steps (site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en, is_active)
VALUES (1, 4, 'automation_level', 'Otomasyon', 'Automation', 'İş akışımızda', 'In our workflow, we envision a', 'bir sistem kurgusu hayal ediyoruz.', 'system setup.', 1);

INSERT INTO wizard_options (step_id, label, label_en, value, description, description_en, match_tags, sort_order, is_active) VALUES
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=4), 'Manuel', 'Manual', 'manual', 'Operatör kontrollü klasik sistemler', 'Operator-controlled classic systems', '["manual"]', 1, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=4), 'Yarı-Otomatik', 'Semi-Automatic', 'semi-auto', 'Kısmi otomasyon ve veri aktarımı', 'Partial automation and data transfer', '["semi-auto"]', 2, 1),
  ((SELECT id FROM wizard_steps WHERE site_id=1 AND step_number=4), 'Tam Otomatik', 'Fully Automatic', 'full-auto', 'İnsan müdahalesiz robotik sistemler', 'Robotic systems without human intervention', '["full-auto"]', 3, 1);
