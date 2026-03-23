-- Wizard Steps & Options - Updated based on new screenshot - UTF-8 encoded

-- Clear existing wizard data for for-labs.com (site_id=1)
DELETE FROM wizard_options WHERE step_id IN (
  SELECT id FROM wizard_steps WHERE site_id = 1
);
DELETE FROM wizard_steps WHERE site_id = 1;

-- Insert updated wizard steps for for-labs.com (site_id=1)
INSERT OR IGNORE INTO wizard_steps (id, site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en) VALUES
(1, 1, 1, 'sectors', 'Hangi sektör için analiz yapacaksınız?', 'Which sector will you analyze?', 'Biz', 'We', 'sektöründe analiz yapıyoruz.', 'are analyzing in the sector.'),
(2, 1, 2, 'analysis_types', 'Ne tür analiz yapacaksınız?', 'What type of analysis will you perform?', '', '', 'analizi yapmamız gerekiyor.', 'analysis is needed.'),
(3, 1, 3, 'sample_types', 'Hangi numune tipleriyle çalışacaksınız?', 'What sample types will you work with?', '', '', 'numunelerle çalışacağız.', 'will work with samples.'),
(4, 1, 4, 'compliance', 'Hangi standartlara uymalı?', 'Which standards should comply with?', '', '', 'standartlarına uygun olmalı.', 'standards should be complied.');

-- Insert wizard options based on new screenshot (5 options per step)
INSERT OR IGNORE INTO wizard_options (id, step_id, label, label_en, value, description, description_en, match_tags, sort_order) VALUES
-- Step 1 Options (Sectors) - 5 options from screenshot
(1, 1, 'Gıda Endüstrisi', 'Food Industry', 'gida', 'Gıda üretimi ve kontrol', 'Food production and control', '["gıda", "food", "endüstri"]', 1),
(2, 1, 'İlaç Sektörü', 'Pharmaceutical', 'ilaç', 'İlaç üretimi ve QA/QC', 'Pharma production and QA/QC', '["ilaç", "pharma", "ilac"]', 2),
(3, 1, 'Çevre Analizi', 'Environmental Analysis', 'cevre', 'Su ve çevre analizleri', 'Water and environmental analysis', '["cevre", "environmental", "su"]', 3),
(4, 1, 'Kozmetik', 'Cosmetics', 'kozmetik', 'Kozmetik ürün testleri', 'Cosmetics product testing', '["kozmetik", "cosmetics", "test"]', 4),
(5, 1, 'Akademik Araştırma', 'Academic Research', 'akademik', 'Üniversite ve araştırma kuruluşları', 'University and research institutions', '["akademik", "üniversite", "araştırma"]', 5),

-- Step 2 Options (Analysis Types) - 5 options from screenshot  
(6, 2, 'pH Ölçümü', 'pH Measurement', 'ph', 'pH ve asitlik/bazlık ölçümü', 'pH and acidity/alkalinity measurement', '["ph", "asit", "baz", "ölçüm"]', 1),
(7, 2, 'Brix Ölçümü', 'Brix Measurement', 'brix', 'Şeker konsantrasyonu ölçümü', 'Sugar concentration measurement', '["brix", "şeker", "konsantrasyon", "refraktometre"]', 2),
(8, 2, 'Titrasyon', 'Titration', 'titrasyon', 'Asit-baz titrasyonu ve konsantrasyon belirleme', 'Acid-base titration and concentration determination', '["titrasyon", "asit", "baz", "konsantrasyon"]', 3),
(9, 2, 'Mikrobiyolojik Analiz', 'Microbiological Analysis', 'mikrobiyoloji', 'Bakteri, maya ve küf analizi', 'Bacteria, yeast and mold analysis', '["mikrobiyoloji", "bakteri", "maya", "küf", "petri"]', 4),
(10, 2, 'HPLC Analizi', 'HPLC Analysis', 'hplc', 'Yüksek performanslı sıvı kromatografi', 'High performance liquid chromatography', '["hplc", "kromatografi", "sıvı", "analiz"]', 5),

-- Step 3 Options (Sample Types) - 5 options from screenshot
(11, 3, 'Sıvı Numuneler', 'Liquid Samples', 'sivi', 'Sıvı gıda ve içecek numuneleri', 'Liquid food and beverage samples', '["sivi", "sıvı", "içecek", "gıda"]', 1),
(12, 3, 'Katı Numuneler', 'Solid Samples', 'kati', 'Katı gıda ve ham madde numuneleri', 'Solid food and raw material samples', '["kati", "katı", "gıda", "ham madde"]', 2),
(13, 3, 'Yarı Katı Numuneler', 'Semi-Solid Samples', 'yarikati', 'Püre, macun ve jöle kıvamındaki numuneler', 'Puree, paste and jelly consistency samples', '["yarikati", "yarı katı", "püre", "macun", "jöle"]', 3),
(14, 3, 'Su Numuneleri', 'Water Samples', 'su', 'İçme suyu, arıtma suyu ve atık su numuneleri', 'Drinking water, purified water and wastewater samples', '["su", "içme suyu", "arıtma", "atık su"]', 4),
(15, 3, 'Biyo-numuneler', 'Bio Samples', 'biyo', 'Kan, idrar ve doku numuneleri', 'Blood, urine and tissue samples', '["biyo", "kan", "idrar", "doku", "medikal"]', 5),

-- Step 4 Options (Compliance) - 5 options from screenshot
(16, 4, 'ISO 17025', 'ISO 17025', 'iso17025', 'Laboratuvar akreditasyon standardı', 'Laboratory accreditation standard', '["iso", "17025", "akreditasyon", "kalibrasyon"]', 1),
(17, 4, 'GLP/GMP', 'GLP/GMP', 'glpgmp', 'Good Laboratory/Manufacturing Practice', 'Good Laboratory/Manufacturing Practice', '["glp", "gmp", "practice", "ilaç"]', 2),
(18, 4, 'CE Markası', 'CE Mark', 'ce', 'Avrupa Birliği uyumu', 'European Union compliance', '["ce", "avrupa", "ab", "uyum"]', 3),
(19, 4, 'FDA Onayı', 'FDA Approval', 'fda', 'ABD Gıda ve İlaç Dairesi', 'US Food and Drug Administration', '["fda", "abd", "usa", "gıda", "ilaç"]', 4),
(20, 4, 'ISO 9001', 'ISO 9001', 'iso9001', 'Kalite yönetim sistemi', 'Quality management system', '["iso", "9001", "kalite", "yönetim"]', 5);
