-- Wizard and relationships only - UTF-8 encoded

-- Wizard Steps (For-Labs.com - site_id=1)
INSERT OR IGNORE INTO wizard_steps (id, site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en) VALUES
(1, 1, 1, 'application_areas', 'Hangi sektor icin analiz yapacaksiniz?', 'Which sector will you analyze?', 'Biz', 'We', 'sektorunde analiz yapiyoruz.', 'are analyzing in the sector.'),
(2, 1, 2, 'analysis_types', 'Ne tur analiz yapacaksiniz?', 'What type of analysis will you perform?', '', '', 'analizi yapmamiz gerekiyor.', 'analysis is needed.'),
(3, 1, 3, 'automation_level', 'Otomasyon seviyesi ne olmali?', 'What should be the automation level?', '', '', 'otomasyon seviyesi istiyoruz.', 'automation level is desired.'),
(4, 1, 4, 'compliance_tags', 'Hangi standartlara uymali?', 'Which standards should comply with?', '', '', 'standartlarina uygun olmali.', 'standards should be complied.');

-- Wizard Options
INSERT OR IGNORE INTO wizard_options (id, step_id, label, label_en, value, description, description_en, match_tags, sort_order) VALUES
-- Step 1 Options (Application Areas)
(1, 1, 'Gida Endustrisi', 'Food Industry', 'gida', 'Gida uretimi ve kontrol', 'Food production and control', '["gida", "food", "endustri"]', 1),
(2, 1, 'Ilac Sektoru', 'Pharmaceutical', 'ilaç', 'Ilac uretimi ve QA/QC', 'Pharma production and QA/QC', '["ilaç", "pharma", "ilac"]', 2),
(3, 1, 'Cevre Analizi', 'Environmental Analysis', 'cevre', 'Su ve cevre analizleri', 'Water and environmental analysis', '["cevre", "environmental", "su"]', 3),
(4, 1, 'Kozmetik', 'Cosmetics', 'kozmetik', 'Kozmetik urun testleri', 'Cosmetics product testing', '["kozmetik", "cosmetics", "test"]', 4),

-- Step 2 Options (Analysis Types)
(5, 2, 'HPLC Analizi', 'HPLC Analysis', 'hplc', 'Sivi kromatografi analizleri', 'Liquid chromatography analysis', '["hplc", "chromatography", "sivi"]', 1),
(6, 2, 'GC-MS Analizi', 'GC-MS Analysis', 'gcms', 'Gaz kromatografi kutle spektrometresi', 'Gas chromatography mass spectrometry', '["gc", "ms", "gaz"]', 2),
(7, 2, 'pH Olcum', 'pH Measurement', 'ph', 'pH ve asitlik/bazlik olcumu', 'pH and acidity/alkalinity measurement', '["ph", "asit", "baz"]', 3),
(8, 2, 'UV-Vis Spektrofotometri', 'UV-Vis Spectrophotometry', 'uvvis', 'UV-Vis absorbans olcumleri', 'UV-Vis absorbance measurements', '["uv", "vis", "spektro"]', 4),

-- Step 3 Options (Automation Level)
(9, 3, 'Manuel', 'Manual', 'manual', 'Manuel operasyon', 'Manual operation', '["manuel", "manual", "el"]', 1),
(10, 3, 'Yari Otomatik', 'Semi-Automatic', 'semi-auto', 'Yari otomatik sistemler', 'Semi-automatic systems', '["yari", "semi", "otomatik"]', 2),
(11, 3, 'Tam Otomatik', 'Full Automatic', 'full-auto', 'Tam otomatik sistemler', 'Full automatic systems', '["tam", "full", "otomatik"]', 3),

-- Step 4 Options (Compliance)
(12, 4, 'ISO 17025', 'ISO 17025', 'iso17025', 'Laboratuvar akreditasyon standardi', 'Laboratory accreditation standard', '["iso", "17025", "akreditasyon"]', 1),
(13, 4, 'GLP/GMP', 'GLP/GMP', 'glpgmp', 'Good Laboratory/Manufacturing Practice', 'Good Laboratory/Manufacturing Practice', '["glp", "gmp", "practice"]', 2),
(14, 4, 'CE Markasi', 'CE Mark', 'ce', 'Avrupa Birligi uyumu', 'European Union compliance', '["ce", "avrupa", "ab"]', 3),
(15, 4, 'FDA Onayi', 'FDA Approval', 'fda', 'ABD Gida ve Ilaç Dairesi', 'US Food and Drug Administration', '["fda", "abd", "usa"]', 4);

-- Project-Product Relationships
INSERT OR IGNORE INTO project_related_products (project_id, product_id) VALUES
-- Marmara Universitesi projesi urunleri
(100, 100), -- HPLC Sistemi
(100, 101), -- GC-MS
(100, 110), -- Laboratuvar pH Metre
(100, 200), -- Sulfurik Asit
(100, 300), -- Mikropipet

-- Acibadem Hastanesi projesi urunleri
(101, 100), -- HPLC Sistemi
(101, 101), -- GC-MS
(101, 102), -- UV-Vis
(101, 110), -- Laboratuvar pH Metre
(101, 111), -- Portatif pH Metre

-- ISKI projesi urunleri
(102, 102), -- UV-Vis
(102, 110), -- Laboratuvar pH Metre
(102, 111), -- Portatif pH Metre
(102, 201), -- Hidroklorik Asit
(102, 300); -- Mikropipet
