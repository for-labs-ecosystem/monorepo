-- Wizard Steps & Options - Updated based on provided screenshots - UTF-8 encoded

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

-- Insert wizard options based on screenshots
INSERT OR IGNORE INTO wizard_options (id, step_id, label, label_en, value, description, description_en, match_tags, sort_order) VALUES
-- Step 1 Options (Sectors) - From screenshot 1
(1, 1, 'Gıda Endüstrisi', 'Food Industry', 'gida', 'Gıda üretimi ve kontrol', 'Food production and control', '["gıda", "food", "endüstri"]', 1),
(2, 1, 'İlaç Sektörü', 'Pharmaceutical', 'ilaç', 'İlaç üretimi ve QA/QC', 'Pharma production and QA/QC', '["ilaç", "pharma", "ilac"]', 2),
(3, 1, 'Çevre Analizi', 'Environmental Analysis', 'cevre', 'Su ve çevre analizleri', 'Water and environmental analysis', '["cevre", "environmental", "su"]', 3),
(4, 1, 'Kozmetik', 'Cosmetics', 'kozmetik', 'Kozmetik ürün testleri', 'Cosmetics product testing', '["kozmetik", "cosmetics", "test"]', 4),

-- Step 2 Options (Analysis Types) - From screenshot 2  
(5, 2, 'pH Ölçümü', 'pH Measurement', 'ph', 'pH ve asitlik/bazlık ölçümü', 'pH and acidity/alkalinity measurement', '["ph", "asit", "baz", "ölçüm"]', 1),
(6, 2, 'Brix Ölçümü', 'Brix Measurement', 'brix', 'Şeker konsantrasyonu ölçümü', 'Sugar concentration measurement', '["brix", "şeker", "konsantrasyon", "refraktometre"]', 2),
(7, 2, 'Titrasyon', 'Titration', 'titrasyon', 'Asit-baz titrasyonu ve konsantrasyon belirleme', 'Acid-base titration and concentration determination', '["titrasyon", "asit", "baz", "konsantrasyon"]', 3),
(8, 2, 'Mikrobiyolojik Analiz', 'Microbiological Analysis', 'mikrobiyoloji', 'Bakteri, maya ve küf analizi', 'Bacteria, yeast and mold analysis', '["mikrobiyoloji", "bakteri", "maya", "küf", "petri"]', 4),

-- Step 3 Options (Sample Types) - From screenshot 3
(9, 3, 'Sıvı Numuneler', 'Liquid Samples', 'sivi', 'Sıvı gıda ve içecek numuneleri', 'Liquid food and beverage samples', '["sivi", "sıvı", "içecek", "gıda"]', 1),
(10, 3, 'Katı Numuneler', 'Solid Samples', 'kati', 'Katı gıda ve ham madde numuneleri', 'Solid food and raw material samples', '["kati", "katı", "gıda", "ham madde"]', 2),
(11, 3, 'Yarı Katı Numuneler', 'Semi-Solid Samples', 'yarikati', 'Püre, macun ve jöle kıvamındaki numuneler', 'Puree, paste and jelly consistency samples', '["yarikati", "yarı katı", "püre", "macun", "jöle"]', 3),
(12, 3, 'Su Numuneleri', 'Water Samples', 'su', 'İçme suyu, arıtma suyu ve atık su numuneleri', 'Drinking water, purified water and wastewater samples', '["su", "içme suyu", "arıtma", "atık su"]', 4),

-- Step 4 Options (Compliance) - From screenshot 4
(13, 4, 'ISO 17025', 'ISO 17025', 'iso17025', 'Laboratuvar akreditasyon standardı', 'Laboratory accreditation standard', '["iso", "17025", "akreditasyon", "kalibrasyon"]', 1),
(14, 4, 'GLP/GMP', 'GLP/GMP', 'glpgmp', 'Good Laboratory/Manufacturing Practice', 'Good Laboratory/Manufacturing Practice', '["glp", "gmp", "practice", "ilaç"]', 2),
(15, 4, 'CE Markası', 'CE Mark', 'ce', 'Avrupa Birliği uyumu', 'European Union compliance', '["ce", "avrupa", "ab", "uyum"]', 3),
(16, 4, 'FDA Onayı', 'FDA Approval', 'fda', 'ABD Gıda ve İlaç Dairesi', 'US Food and Drug Administration', '["fda", "abd", "usa", "gıda", "ilaç"]', 4);
