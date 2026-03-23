-- Extended Seed Data for forlabs-cms-db
-- Run via: wrangler d1 execute forlabs-cms-db --remote --file=../../packages/db/src/seed-extended.sql

-- ─── EXTENDED CATEGORIES ───
INSERT OR IGNORE INTO categories (id, slug, name, name_en, description, description_en, type, sort_order) VALUES
-- Laboratuvar Ekipmanları (type: product)
(10, 'analiz-cihazlari', 'Analiz Cihazları', 'Analytical Instruments', 'Hassas analiz ve ölçüm cihazları', 'Precision analytical and measurement instruments', 'product', 10),
(11, 'ph-metreler', 'pH Metreler', 'pH Meters', 'pH ölçüm cihazları ve aksesuarları', 'pH measurement devices and accessories', 'product', 11),
(12, 'refraktometreler', 'Refraktometreler', 'Refractometers', 'Kırılma indeksi ölçüm cihazları', 'Refractive index measurement devices', 'product', 12),
(13, 'termostatli-banyolar', 'Termostatlı Banyolar', 'Thermostatic Baths', 'Sıcaklık kontrolü ve inkübasyon', 'Temperature control and incubation', 'product', 13),
(14, 'santrifujlar', 'Santrifüjler', 'Centrifuges', 'Numune ayırma ve sedimentasyon', 'Sample separation and sedimentation', 'product', 14),

-- Kimyasal Ürünler (type: product)
(20, 'reaktifler', 'Reaktifler', 'Reagents', 'Analitik ve laboratuvar reaktifleri', 'Analytical and laboratory reagents', 'product', 20),
(21, 'cozeltuler', 'Çözeltiler', 'Solutions', 'Hazır ve konsantre çözeltiler', 'Ready and concentrated solutions', 'product', 21),
(22, 'tamponlar', 'Tampon Çözeltiler', 'Buffer Solutions', 'pH stabilizasyon tamponları', 'pH stabilization buffers', 'product', 22),
(23, 'asit-baz', 'Asit ve Bazlar', 'Acids & Bases', 'Laboratuvar asitleri ve bazları', 'Laboratory acids and bases', 'product', 23),

-- Sarf Malzemeleri (type: product)
(30, 'pipetler', 'Pipetler', 'Pipettes', 'Hassas sıvı transfer pipetleri', 'Precision liquid transfer pipettes', 'product', 30),
(31, 'kulturbotu', 'Kültür Botları', 'Culture Bottles', 'Mikrobiyoloji kültür kapları', 'Microbiology culture containers', 'product', 31),
(32, 'filtreler', 'Filtreler', 'Filters', 'Filtrasyon ve filtre kağıtları', 'Filtration and filter papers', 'product', 32),

-- Hizmet Kategorileri (type: service)
(50, 'analiz-hizmetleri', 'Analiz Hizmetleri', 'Analysis Services', 'Profesyonel laboratuvar analizleri', 'Professional laboratory analysis', 'service', 50),
(51, 'kalibrasyon', 'Kalibrasyon Hizmetleri', 'Calibration Services', 'Cihaz kalibrasyon ve doğrulama', 'Instrument calibration and verification', 'service', 51),
(52, 'egitim', 'Eğitim Hizmetleri', 'Training Services', 'Laboratuvar eğitimleri ve seminerler', 'Laboratory training and seminars', 'service', 52),
(53, 'danismanlik', 'Danışmanlık', 'Consulting Services', 'Laboratuvar kurulum danışmanlığı', 'Laboratory setup consulting', 'service', 53),

-- Proje Kategorileri (type: project)
(60, 'gida-laboratuvarlari', 'Gıda Laboratuvarları', 'Food Laboratories', 'Gıda analiz laboratuvarı projeleri', 'Food analysis laboratory projects', 'project', 60),
(61, 'ilac-laboratuvarlari', 'İlaç Laboratuvarları', 'Pharma Laboratories', 'İlaç QA/QC laboratuvarı projeleri', 'Pharma QA/QC laboratory projects', 'project', 61),
(62, 'su-analiz-laboratuvarlari', 'Su Analiz Laboratuvarları', 'Water Analysis Labs', 'Su kalitesi ve çevre laboratuvarları', 'Water quality and environmental labs', 'project', 62);

-- ─── EXTENDED PRODUCTS (Global Catalog) ───
INSERT OR IGNORE INTO products (id, slug, title, title_en, description, description_en, specs, specs_en, price, currency, unit, brand, model_number, sku, warranty_period, campaign_label, features, features_en, application_areas, application_areas_en, tags, tags_en, analysis_types, analysis_types_en, automation_level, compliance_tags, category_id, image_url, gallery, is_active, is_featured, sort_order) VALUES
-- Analiz Cihazları
(100, 'hplc-sistemi-agilent-1260', 'HPLC Sistemi Agilent 1260', 'HPLC System Agilent 1260', 'Yüksek performanslı sıvı kromatografi sistemi. İlaç ve gıda analizinde kullanılır.', 'High performance liquid chromatography system. Used in pharmaceutical and food analysis.', '{"pump_type": "Quaternary", "detector": "DAD + RI", "flow_range": "0.001-10 mL/min", "pressure_limit": "600 bar"}', '{"pump_type": "Quaternary", "detector": "DAD + RI", "flow_range": "0.001-10 mL/min", "pressure_limit": "600 bar"}', 285000.00, 'TRY', 'Adet', 'Agilent', '1260 Infinity II', 'HPLC-AGI-1260', '2 Yıl', 'Çok Satan', '[{"key": "Pompalar", "value": "Kuaterner pompa"}, {"key": "Dedektör", "value": "DAD + RI"}, {"key": "Ototör", "value": "Otomatik enjektör"}]', '[{"key": "Pumps", "value": "Quaternary pump"}, {"key": "Detector", "value": "DAD + RI"}, {"key": "Autosampler", "value": "Automatic injector"}]', '["İlaç Sektörü", "Gıda Endüstrisi", "Kozmetik"]', '["Pharma", "Food Industry", "Cosmetics"]', '["hplc", "kromatografi", "ilaç", "gıda"]', '["hplc", "chromatography", "pharma", "food"]', '["HPLC Analizi", "Pürikasyon", "Kalite Kontrol"]', '["HPLC Analysis", "Purification", "Quality Control"]', 'semi-auto', '["ISO 17025", "GLP/GMP", "CE"]', 10, '/api/media/serve/forlabs/products/2026/03/hplc-agilent-1260-abc123.jpg', '["/api/media/serve/forlabs/products/2026/03/hplc-detay-1-def456.jpg", "/api/media/serve/forlabs/products/2026/03/hplc-detay-2-ghi789.jpg"]', 1, 1, 1),

(101, 'gc-ms-shimadzu-qp2020', 'GC-MS Shimadzu QP2020', 'GC-MS Shimadzu QP2020', 'Gaz kromatografi-kütle spektrometresi. Organik bileşik analizinde kullanılır.', 'Gas chromatography-mass spectrometer. Used in organic compound analysis.', '{"detector": "Quadrupole MS", "ionization": "EI", "mass_range": "1-1050 amu", "column_oven": "Ambient to 450°C"}', '{"detector": "Quadrupole MS", "ionization": "EI", "mass_range": "1-1050 amu", "column_oven": "Ambient to 450°C"}', 425000.00, 'TRY', 'Adet', 'Shimadzu', 'QP2020 NX', 'GCMS-SHI-QP2020', '2 Yıl', 'Özel İndirim', '[{"key": "Dedektör", "value": "Kuadrupol MS"}, {"key": "İyonizasyon", "value": "Electron Impact"}, {"key": "Kolon Fırını", "value": "450°C"}]', '[{"key": "Detector", "value": "Quadrupole MS"}, {"key": "Ionization", "value": "Electron Impact"}, {"key": "Column Oven", "value": "450°C"}]', '["Çevre Analizi", "Toksinoloji", "Kozmetik"]', '["Environmental Analysis", "Toxicology", "Cosmetics"]', '["gc", "ms", "organik", "toplam"]', '["gc", "ms", "organic", "total"]', '["GC-MS Analizi", "Koku Analizi", "Pestisit"]', '["GC-MS Analysis", "Odor Analysis", "Pesticide"]', 'full-auto', '["ISO 17025", "GLP/GMP", "CE", "FDA"]', 10, '/api/media/serve/forlabs/products/2026/03/gc-ms-shimadzu-xyz789.jpg', '["/api/media/serve/forlabs/products/2026/03/gc-ms-detay-1-uvw456.jpg"]', 1, 1, 2),

(102, 'uv-vis-spektrofotometre-cary-60', 'UV-Vis Spektrofotometre Cary 60', 'UV-Vis Spectrophotometer Cary 60', 'UV-Vis spektrofotometre. 190-1100 nm aralığında ölçüm yapar.', 'UV-Vis spectrophotometer. Measures in 190-1100 nm range.', '{"wavelength_range": "190-1100 nm", "bandwidth": "1.8 nm", "detector": "Photodiode array", "sample_compartment": "Dual beam"}', '{"wavelength_range": "190-1100 nm", "bandwidth": "1.8 nm", "detector": "Photodiode array", "sample_compartment": "Dual beam"}', 85000.00, 'TRY', 'Adet', 'Agilent', 'Cary 60', 'UVVIS-AGI-CARY60', '2 Yıl', NULL, '[{"key": "Dalga Boyu", "value": "190-1100 nm"}, {"key": "Bant Genişliği", "value": "1.8 nm"}, {"key": "Dedektör", "value": "Fotodiyot Dizisi"}]', '[{"key": "Wavelength", "value": "190-1100 nm"}, {"key": "Bandwidth", "value": "1.8 nm"}, {"key": "Detector", "value": "Photodiode array"}]', '["Kimya", "Biyokimya", "Eczacılık"]', '["Chemistry", "Biochemistry", "Pharmacy"]', '["uv-vis", "spektrofotometre", "absorbans"]', '["uv-vis", "spectrophotometer", "absorbance"]', '["UV-Vis Analizi", "Konsantrasyon", "Kinetics"]', '["UV-Vis Analysis", "Concentration", "Kinetics"]', 'manual', '["ISO 17025", "CE"]', 10, '/api/media/serve/forlabs/products/2026/03/uv-vis-cary60-rst123.jpg', '["/api/media/serve/forlabs/products/2026/03/uv-vis-detay-1-opq456.jpg"]', 1, 0, 3),

-- pH Metreler
(110, 'laboratuvar-ph-metre-mettler-toledo', 'Laboratuvar pH Metre Mettler Toledo', 'Laboratory pH Meter Mettler Toledo', 'Yüksek hassasiyetli laboratuvar pH ölçüm cihazı.', 'High precision laboratory pH measurement device.', '{"measurement_range": "-2.000 to 20.000 pH", "accuracy": "±0.002 pH", "resolution": "0.001 pH", "temperature_compensation": "Automatic"}', '{"measurement_range": "-2.000 to 20.000 pH", "accuracy": "±0.002 pH", "resolution": "0.001 pH", "temperature_compensation": "Automatic"}', 18500.00, 'TRY', 'Adet', 'Mettler Toledo', 'SevenCompact', 'PH-METTLER-7', '3 Yıl', NULL, '[{"key": "Ölçüm Aralığı", "value": "-2.000 to 20.000 pH"}, {"key": "Doğruluk", "value": "±0.002 pH"}, {"key": "Çözünürlük", "value": "0.001 pH"}]', '[{"key": "Measurement Range", "value": "-2.000 to 20.000 pH"}, {"key": "Accuracy", "value": "±0.002 pH"}, {"key": "Resolution", "value": "0.001 pH"}]', '["Su Analizi", "Gıda", "Kimya"]', '["Water Analysis", "Food", "Chemistry"]', '["ph", "mettler", "laboratuvar"]', '["ph", "mettler", "laboratory"]', '["pH Ölçüm", "Asitlik", "Bazlık"]', '["pH Measurement", "Acidity", "Alkalinity"]', 'manual', '["ISO 17025", "CE"]', 11, '/api/media/serve/forlabs/products/2026/03/ph-mettler-lmn456.jpg', '["/api/media/serve/forlabs/products/2026/03/ph-mettler-detay-1-pqr789.jpg"]', 1, 0, 10),

(111, 'portatif-ph-metre-hanna-hi98107', 'Portatif pH Metre Hanna HI98107', 'Portable pH Meter Hanna HI98107', 'Su kalitesi ölçümleri için portatif pH metre.', 'Portable pH meter for water quality measurements.', '{"measurement_range": "0.00 to 14.00 pH", "accuracy": "±0.01 pH", "battery_life": "2000 hours", "water_resistance": "IP67"}', '{"measurement_range": "0.00 to 14.00 pH", "accuracy": "±0.01 pH", "battery_life": "2000 hours", "water_resistance": "IP67"}', 3200.00, 'TRY', 'Adet', 'Hanna', 'HI98107', 'PH-HANNA-HI98107', '2 Yıl', 'Popüler', '[{"key": "Ölçüm Aralığı", "value": "0.00 to 14.00 pH"}, {"key": "Doğruluk", "value": "±0.01 pH"}, {"key": "Su Geçirmezlik", "value": "IP67"}]', '[{"key": "Measurement Range", "value": "0.00 to 14.00 pH"}, {"key": "Accuracy", "value": "±0.01 pH"}, {"key": "Water Resistance", "value": "IP67"}]', '["Çevre", "Su", "Saha"]', '["Environmental", "Water", "Field"]', '["portatif", "hanna", "saha"]', '["portable", "hanna", "field"]', '["pH Ölçüm", "Su Kalitesi", "Saha"]', '["pH Measurement", "Water Quality", "Field"]', 'manual', '["CE", "IP67"]', 11, '/api/media/serve/forlabs/products/2026/03/ph-hanna-hi98107-stu234.jpg', '["/api/media/serve/forlabs/products/2026/03/ph-hanna-detay-1-vwx567.jpg"]', 1, 1, 11),

-- Reaktifler
(200, 'sulfurik-asit-h2so4-1n', 'Sülfürik Asit (H2SO4) 1N', 'Sulfuric Acid (H2SO4) 1N', 'Analitik saflıkta sülfürik asit çözeltisi.', 'Analytical grade sulfuric acid solution.', '{"concentration": "1N", "purity": "ACS Grade", "volume": "1000 mL", "packaging": "HDPE bottle"}', '{"concentration": "1N", "purity": "ACS Grade", "volume": "1000 mL", "packaging": "HDPE bottle"}', 450.00, 'TRY', 'Adet', 'Merck', '1.00731', 'H2SO4-1N-MERCK', '2 Yıl', NULL, '[{"key": "Konsantrasyon", "value": "1N"}, {"key": "Saflık", "value": "ACS Grade"}, {"key": "Hacim", "value": "1000 mL"}]', '[{"key": "Concentration", "value": "1N"}, {"key": "Purity", "value": "ACS Grade"}, {"key": "Volume", "value": "1000 mL"}]', '["Laboratuvar", "Endüstriyel", "Eğitim"]', '["Laboratory", "Industrial", "Education"]', '["asit", "sülfürik", "reaktif"]', '["acid", "sulfuric", "reagent"]', '["Asit-Baz Titrasyonu", "pH Ayarı"]', '["Acid-Base Titration", "pH Adjustment"]', NULL, '["ISO", "ACS"]', 20, '/api/media/serve/forlabs/products/2026/03/h2so4-1n-yza789.jpg', '[]', 1, 0, 20),

(201, 'hidroklorik-asit-hcl-37', 'Hidroklorik Asit (HCl) 37%', 'Hydrochloric Acid (HCl) 37%', 'Konsantre hidroklorik asit.', 'Concentrated hydrochloric acid.', '{"concentration": "37%", "purity": "ACS Grade", "volume": "1000 mL", "density": "1.18 g/mL"}', '{"concentration": "37%", "purity": "ACS Grade", "volume": "1000 mL", "density": "1.18 g/mL"}', 380.00, 'TRY', 'Adet', 'Sigma-Aldrich', 'H1758', 'HCL-37-SIGMA', '2 Yıl', NULL, '[{"key": "Konsantrasyon", "value": "37%"}, {"key": "Saflık", "value": "ACS Grade"}, {"key": "Yoğunluk", "value": "1.18 g/mL"}]', '[{"key": "Concentration", "value": "37%"}, {"key": "Purity", "value": "ACS Grade"}, {"key": "Density", "value": "1.18 g/mL"}]', '["Laboratuvar", "Endüstriyel"]', '["Laboratory", "Industrial"]', '["asit", "hidroklorik", "reaktif"]', '["acid", "hydrochloric", "reagent"]', '["Asit-Baz Titrasyonu", "Çözelti Hazırlama"]', '["Acid-Base Titration", "Solution Preparation"]', NULL, '["ISO", "ACS"]', 20, '/api/media/serve/forlabs/products/2026/03/hcl-37-bcd456.jpg', '[]', 1, 0, 21),

-- Sarf Malzemeleri
(300, 'mikropipet-1000ul-eppendorf', 'Mikropipet 1000µL Eppendorf', 'Micropipette 1000µL Eppendorf', 'Hassas sıvı transferi için mikropipet.', 'Micropipette for precise liquid transfer.', '{"volume_range": "100-1000 µL", "accuracy": "±0.8%", "repeatability": "±0.2%", "tip_ejector": "Manual"}', '{"volume_range": "100-1000 µL", "accuracy": "±0.8%", "repeatability": "±0.2%", "tip_ejector": "Manual"}', 2800.00, 'TRY', 'Adet', 'Eppendorf', 'Research plus', 'PIPET-EPP-1000', '2 Yıl', 'Yeni', '[{"key": "Hacim Aralığı", "value": "100-1000 µL"}, {"key": "Doğruluk", "value": "±0.8%"}, {"key": "Tekrarlanabilirlik", "value": "±0.2%"}]', '[{"key": "Volume Range", "value": "100-1000 µL"}, {"key": "Accuracy", "value": "±0.8%"}, {"key": "Repeatability", "value": "±0.2%"}]', '["Moleküler Biyoloji", "Klinik", "Araştırma"]', '["Molecular Biology", "Clinical", "Research"]', '["pipet", "eppendorf", "mikropipet"]', '["pipette", "eppendorf", "micropipette"]', '["Sıvı Transfer", "PCR", "Kültür"]', '["Liquid Transfer", "PCR", "Culture"]', 'manual', '["ISO", "CE"]', 30, '/api/media/serve/forlabs/products/2026/03/mikropipet-eppendorf-efg567.jpg', '["/api/media/serve/forlabs/products/2026/03/pipet-detay-1-hij890.jpg"]', 1, 1, 30),

(301, 'petri-kabi-90mm-steril-500lu', 'Petri Kabı 90mm Steril (500lü)', 'Petri Dish 90mm Sterile (500pcs)', 'Gamma ışınıyla sterilize edilmiş petri kabı.', 'Gamma sterilized petri dishes.', '{"diameter": "90mm", "material": "Polystyrene", "sterilization": "Gamma", "quantity": "500"}', '{"diameter": "90mm", "material": "Polystyrene", "sterilization": "Gamma", "quantity": "500"}', 6500.00, 'TRY', 'Paket', 'VWR', '391-0903', 'PETRI-VWR-90-500', '1 Yıl', 'İndirimli', '[{"key": "Çap", "value": "90mm"}, {"key": "Malzeme", "value": "Polistiren"}, {"key": "Sterilizasyon", "value": "Gamma"}]', '[{"key": "Diameter", "value": "90mm"}, {"key": "Material", "value": "Polystyrene"}, {"key": "Sterilization", "value": "Gamma"}]', '["Mikrobiyoloji", "Gıda", "Su"]', '["Microbiology", "Food", "Water"]', '["petri", "steril", "mikrobiyoloji"]', '["petri", "sterile", "microbiology"]', '["Kültür", "Mikrobiyoloji", "Plate Count"]', '["Culture", "Microbiology", "Plate Count"]', NULL, '["ISO"]', 30, '/api/media/serve/forlabs/products/2026/03/petri-90mm-500-klm345.jpg', '[]', 1, 0, 31);

-- ─── EXTENDED SERVICES ───
INSERT OR IGNORE INTO services (id, slug, title, title_en, description, description_en, content, content_en, specs, price, currency, tags, service_type, category_id, image_url, gallery, is_active) VALUES
(50, 'gida-analiz-hizmeti', 'Gıda Analiz Hizmeti', 'Food Analysis Service', 'Komple gıda analiz ve raporlama hizmeti.', 'Complete food analysis and reporting service.', '<h2>Hizmet Kapsamı</h2><ul><li>Mikrobiyolojik analiz</li><li>Kimyasal analiz</li><li>Fiziksel analiz</li><li>Raporlama</li></ul>', '<h2>Service Scope</h2><ul><li>Microbiological analysis</li><li>Chemical analysis</li><li>Physical analysis</li><li>Reporting</li></ul>', '{"turnaround_time": "5-7 iş günü", "sample_types": ["Gıda", "Su", "Çevre"], "methods": ["ISO 17025"]}', 2500.00, 'TRY', '["gıda", "analiz", "rapor"]', 'analysis', 50, '/api/media/serve/forlabs/services/2026/03/gida-analiz-nop678.jpg', '["/api/media/serve/forlabs/services/2026/03/analiz-lab-1-qrs234.jpg", "/api/media/serve/forlabs/services/2026/03/analiz-lab-2-tuv567.jpg"]', 1),

(51, 'ph-metre-kalibrasyonu', 'pH Metre Kalibrasyonu', 'pH Meter Calibration', 'Profesyonel pH metre kalibrasyon ve doğrulama.', 'Professional pH meter calibration and verification.', '<h2>Kalibrasyon Süreci</h2><ul><li>3 nokta kalibrasyon</li><li>Sertifika</li><li>Doğruluk testi</li></ul>', '<h2>Calibration Process</h2><ul><li>3-point calibration</li><li>Certificate</li><li>Accuracy test</li></ul>', '{"calibration_points": ["pH 4.01", "pH 7.00", "pH 10.01"], "certificate": "ISO 17025", "validity": "1 yıl"}', 850.00, 'TRY', '["kalibrasyon", "ph", "sertifika"]', 'calibration', 51, '/api/media/serve/forlabs/services/2026/03/ph-kalibrasyon-wxy890.jpg', '["/api/media/serve/forlabs/services/2026/03/kalibrasyon-1-zab123.jpg"]', 1),

(52, 'laboratuvar-egitimi', 'Laboratuvar Eğitimi', 'Laboratory Training', 'Temel laboratuvar teknikleri eğitimi.', 'Basic laboratory techniques training.', '<h2>Eğitim İçeriği</h2><ul><li>Güvenlik</li><li>Pipetleme</li><li>Analiz teknikleri</li></ul>', '<h2>Training Content</h2><ul><li>Safety</li><li>Pipetting</li><li>Analysis techniques</li></ul>', '{"duration": "2 gün", "participants": "Max 10 kişi", "certificate": "Katılım Sertifikası"}', 3500.00, 'TRY', '["eğitim", "laboratuvar", "teknik"]', 'training', 52, '/api/media/serve/forlabs/services/2026/03/lab-egitim-cde456.jpg', '["/api/media/serve/forlabs/services/2026/03/egitim-1-fgh789.jpg"]', 1),

(53, 'laboratuvar-kurulum-danismanligi', 'Laboratuvar Kurulum Danışmanlığı', 'Laboratory Setup Consulting', 'Laboratuvar kurulum ve tasarım danışmanlığı.', 'Laboratory setup and design consulting.', '<h2>Danışmanlık Hizmetleri</h2><ul><li>Tasarım</li><li>Ekipman seçimi</li><li>Kurulum</li><li>Validasyon</li></ul>', '<h2>Consulting Services</h2><ul><li>Design</li><li>Equipment selection</li><li>Installation</li><li>Validation</li></ul>', '{"scope": "Turnkey", "timeline": "3-6 ay", "deliverables": ["Proje", "Ekipman", "Eğitim"]}', 15000.00, 'TRY', '["danışmanlık", "kurulum", "tasarım"]', 'consulting', 53, '/api/media/serve/forlabs/services/2026/03/danismanlik-rstu345.jpg', '["/api/media/serve/forlabs/services/2026/03/danismanlik-1-vwx678.jpg"]', 1);

-- ─── EXTENDED PROJECTS ───
INSERT OR IGNORE INTO projects (id, slug, title, title_en, description, description_en, content, content_en, client_name, location, completion_date, category_id, cover_image_url, header_image_url, gallery, metrics, tags, video_url, testimonial, testimonial_author, testimonial_author_title, status, start_date, is_active, is_featured, sort_order) VALUES
(100, 'marmara-universitesi-gida-lab', 'Marmara Üniversitesi Gıda Laboratuvarı', 'Marmara University Food Laboratory', 'Tam donanımlı gıda analiz laboratuvarı kurulumu.', 'Complete food analysis laboratory setup.', '<h2>Proje Detayları</h2><p>Modern gıda analiz laboratuvarı kurulumu projesi.</p>', '<h2>Project Details</h2><p>Modern food analysis laboratory setup project.</p>', 'Marmara Üniversitesi', 'İstanbul', '2025-06', 60, '/api/media/serve/forlabs/projects/2026/03/marmara-lab-abc789.jpg', '/api/media/serve/forlabs/projects/2026/03/marmara-header-def456.jpg', '["/api/media/serve/forlabs/projects/2026/03/marmara-1-ghi789.jpg", "/api/media/serve/forlabs/projects/2026/03/marmara-2-jkl012.jpg"]', '{"alan": "350m²", "sure": "4 ay", "butce": "₺3.5M"}', '["universite", "gıda", "analiz"]', NULL, 'Modern bir laboratuvar kurulumu için profesyonel hizmet aldık. Ekipman seçiminden kuruluma kadar her aşamada destek oldular.', 'Prof. Dr. Ahmet Yılmaz', 'Gıda Mühendisliği Bölüm Başkanı', 'completed', '2025-02', 1, 1, 1),

(101, 'acibadem-hastanesi-ilac-lab', 'Acıbadem Hastanesi İlaç Laboratuvarı', 'Acıbadem Hospital Pharmaceutical Laboratory', 'İlaç QA/QC laboratuvarı kurulumu.', 'Pharmaceutical QA/QC laboratory setup.', '<h2>Proje Detayları</h2><p>Hastane ilaç laboratuvarı modernizasyonu.</p>', '<h2>Project Details</h2><p>Hospital pharmaceutical laboratory modernization.</p>', 'Acıbadem Hastanesi', 'İstanbul', '2025-08', 61, '/api/media/serve/forlabs/projects/2026/03/acibadem-lab-mno345.jpg', '/api/media/serve/forlabs/projects/2026/03/acibadem-header-pqr678.jpg', '["/api/media/serve/forlabs/projects/2026/03/acibadem-1-stu901.jpg", "/api/media/serve/forlabs/projects/2026/03/acibadem-2-vwx234.jpg"]', '{"alan": "280m²", "sure": "3 ay", "butce": "₺2.8M"}', '["hastane", "ilaç", "qaqc"]', NULL, 'Hızlı ve profesyonel kurulum hizmeti. Validasyon süreçleri başarıyla tamamlandı.', 'Dr. Ayşe Kaya', 'Laboratuvar Müdürü', 'completed', '2025-05', 1, 1, 2),

(102, 'iski-su-analiz-lab', 'İSKİ Su Analiz Laboratuvarı', 'ISKİ Water Analysis Laboratory', 'Su kalitesi analiz laboratuvarı kurulumu.', 'Water quality analysis laboratory setup.', '<h2>Proje Detayları</h2><p>Büyük ölçekli su analiz laboratuvarı.</p>', '<h2>Project Details</h2><p>Large-scale water analysis laboratory.</p>', 'İstanbul Su ve Kanalizasyon İdaresi', 'İstanbul', '2025-09', 62, '/api/media/serve/forlabs/projects/2026/03/iski-lab-yza678.jpg', '/api/media/serve/forlabs/projects/2026/03/iski-header-bcd901.jpg', '["/api/media/serve/forlabs/projects/2026/03/iski-1-def234.jpg", "/api/media/serve/forlabs/projects/2026/03/iski-2-ghi567.jpg"]', '{"alan": "450m²", "sure": "5 ay", "butce": "₺4.2M"}', '["su", "çevre", "iski"]', NULL, 'Çevre standartlarına uygun, yüksek kapasiteli laboratuvar kurulumu.', 'Mehmet Özkan', 'Çevre Mühendisi', 'completed', '2025-04', 1, 0, 3);

-- ─── PROJECT-PRODUCT RELATIONSHIPS ───
INSERT OR IGNORE INTO project_related_products (project_id, product_id) VALUES
-- Marmara Üniversitesi projesi ürünleri
(100, 100), -- HPLC Sistemi
(100, 101), -- GC-MS
(100, 110), -- Laboratuvar pH Metre
(100, 200), -- Sülfürik Asit
(100, 300), -- Mikropipet

-- Acıbadem Hastanesi projesi ürünleri
(101, 100), -- HPLC Sistemi
(101, 101), -- GC-MS
(101, 102), -- UV-Vis
(101, 110), -- Laboratuvar pH Metre
(101, 111), -- Portatif pH Metre

-- İSKİ projesi ürünleri
(102, 102), -- UV-Vis
(102, 110), -- Laboratuvar pH Metre
(102, 111), -- Portatif pH Metre
(102, 201), -- Hidroklorik Asit
(102, 300); -- Mikropipet

-- ─── WIZARD STEPS (For-Labs.com - site_id=1) ───
INSERT OR IGNORE INTO wizard_steps (id, site_id, step_number, field_key, title, title_en, prefix, prefix_en, suffix, suffix_en) VALUES
(1, 1, 1, 'application_areas', 'Hangi sektör için analiz yapacaksınız?', 'Which sector will you analyze?', 'Biz', 'We', 'sektöründe analiz yapıyoruz.', 'are analyzing in the sector.'),
(2, 1, 2, 'analysis_types', 'Ne tür analiz yapacaksınız?', 'What type of analysis will you perform?', '', '', 'analizi yapmamız gerekiyor.', 'analysis is needed.'),
(3, 1, 3, 'automation_level', 'Otomasyon seviyesi ne olmalı?', 'What should be the automation level?', '', '', 'otomasyon seviyesi istiyoruz.', 'automation level is desired.'),
(4, 1, 4, 'compliance_tags', 'Hangi standartlara uymalı?', 'Which standards should comply with?', '', '', 'standartlarına uygun olmalı.', 'standards should be complied.');

-- ─── WIZARD OPTIONS ───
INSERT OR IGNORE INTO wizard_options (id, step_id, label, label_en, value, description, description_en, match_tags, sort_order) VALUES
-- Step 1 Options (Application Areas)
(1, 1, 'Gıda Endüstrisi', 'Food Industry', 'gida', 'Gıda üretimi ve kontrol', 'Food production and control', '["gıda", "food", "endüstri"]', 1),
(2, 1, 'İlaç Sektörü', 'Pharmaceutical', 'ilaç', 'İlaç üretimi ve QA/QC', 'Pharma production and QA/QC', '["ilaç", "pharma", "ilac"]', 2),
(3, 1, 'Çevre Analizi', 'Environmental Analysis', 'cevre', 'Su ve çevre analizleri', 'Water and environmental analysis', '["cevre", "environmental", "su"]', 3),
(4, 1, 'Kozmetik', 'Cosmetics', 'kozmetik', 'Kozmetik ürün testleri', 'Cosmetics product testing', '["kozmetik", "cosmetics", "test"]', 4),

-- Step 2 Options (Analysis Types)
(5, 2, 'HPLC Analizi', 'HPLC Analysis', 'hplc', 'Sıvı kromatografi analizleri', 'Liquid chromatography analysis', '["hplc", "chromatography", "sıvı"]', 1),
(6, 2, 'GC-MS Analizi', 'GC-MS Analysis', 'gcms', 'Gaz kromatografi kütle spektrometresi', 'Gas chromatography mass spectrometry', '["gc", "ms", "gaz"]', 2),
(7, 2, 'pH Ölçüm', 'pH Measurement', 'ph', 'pH ve asitlik/bazlık ölçümü', 'pH and acidity/alkalinity measurement', '["ph", "asit", "baz"]', 3),
(8, 2, 'UV-Vis Spektrofotometri', 'UV-Vis Spectrophotometry', 'uvvis', 'UV-Vis absorbans ölçümleri', 'UV-Vis absorbance measurements', '["uv", "vis", "spektro"]', 4),

-- Step 3 Options (Automation Level)
(9, 3, 'Manuel', 'Manual', 'manual', 'Manuel operasyon', 'Manual operation', '["manuel", "manual", "el"]', 1),
(10, 3, 'Yarı Otomatik', 'Semi-Automatic', 'semi-auto', 'Yarı otomatik sistemler', 'Semi-automatic systems', '["yarı", "semi", "otomatik"]', 2),
(11, 3, 'Tam Otomatik', 'Full Automatic', 'full-auto', 'Tam otomatik sistemler', 'Full automatic systems', '["tam", "full", "otomatik"]', 3),

-- Step 4 Options (Compliance)
(12, 4, 'ISO 17025', 'ISO 17025', 'iso17025', 'Laboratuvar akreditasyon standardı', 'Laboratory accreditation standard', '["iso", "17025", "akreditasyon"]', 1),
(13, 4, 'GLP/GMP', 'GLP/GMP', 'glpgmp', 'Good Laboratory/Manufacturing Practice', 'Good Laboratory/Manufacturing Practice', '["glp", "gmp", "practice"]', 2),
(14, 4, 'CE Markası', 'CE Mark', 'ce', 'Avrupa Birliği uyumu', 'European Union compliance', '["ce", "avrupa", "ab"]', 3),
(15, 4, 'FDA Onayı', 'FDA Approval', 'fda', 'ABD Gıda ve İlaç Dairesi', 'US Food and Drug Administration', '["fda", "abd", "usa"]', 4);

-- ─── SITE OVERRIDES (More examples for different sites) ───
INSERT OR IGNORE INTO site_product_overrides (site_id, product_id, title, title_en, price, currency, is_visible, is_featured, sort_order) VALUES
-- atagotr.com (site_id=2) overrides
(2, 100, 'ATAGO HPLC Sistemi Agilent 1260', 'ATAGO HPLC System Agilent 1260', 295000.00, 'TRY', 1, 1, 1),
(2, 101, 'ATAGO GC-MS Shimadzu QP2020', 'ATAGO GC-MS Shimadzu QP2020', 445000.00, 'TRY', 1, 1, 2),
(2, 110, 'ATAGO Laboratuvar pH Metre', 'ATAGO Laboratory pH Meter', 19500.00, 'TRY', 1, 0, 10),
(2, 111, 'ATAGO Portatif pH Metre', 'ATAGO Portable pH Meter', 3500.00, 'TRY', 1, 1, 11),

-- gidakimya.com (site_id=3) overrides (only chemicals)
(3, 200, 'Gıda Kimya Sülfürik Asit 1N', 'Food Chemistry Sulfuric Acid 1N', 480.00, 'TRY', 1, 1, 20),
(3, 201, 'Gıda Kimya Hidroklorik Asit 37%', 'Food Chemistry Hydrochloric Acid 37%', 420.00, 'TRY', 1, 0, 21),

-- labkurulum.com (site_id=4) overrides (only services and projects)
(4, 50, 'Laboratuvar Kurulum Gıda Analizi', 'Lab Setup Food Analysis', 3000.00, 'TRY', 1, 1, 50),
(4, 51, 'Laboratuvar Kurulum pH Kalibrasyon', 'Lab Setup pH Calibration', 1000.00, 'TRY', 1, 0, 51),
(4, 52, 'Laboratuvar Kurulum Eğitim', 'Lab Setup Training', 4500.00, 'TRY', 1, 1, 52),
(4, 53, 'Laboratuvar Kurulum Danışmanlık', 'Lab Setup Consulting', 18000.00, 'TRY', 1, 1, 53),

-- gidatest.com (site_id=5) overrides (only analysis services)
(5, 50, 'Gıda Test Analiz Hizmeti', 'Food Test Analysis Service', 2800.00, 'TRY', 1, 1, 50),
(5, 51, 'Gıda Test pH Kalibrasyon', 'Food Test pH Calibration', 950.00, 'TRY', 1, 0, 51),

-- alerjen.net (site_id=6) overrides (only allergen testing)
(6, 5, 'Alerjen.net Gluten Test Kiti', 'Alerjen.net Gluten Test Kit', 3000.00, 'TRY', 1, 1, 5),

-- hijyenkontrol.com (site_id=7) overrides (only hygiene products)
(7, 6, 'Hijyen Kontrol Yüzey Dezenfektanı', 'Hygiene Control Surface Disinfectant', 500.00, 'TRY', 1, 1, 4);

-- ─── SITE SERVICE OVERRIDES ───
INSERT OR IGNORE INTO site_service_overrides (site_id, service_id, title, title_en, price, currency, is_visible, is_featured, sort_order) VALUES
-- labkurulum.com (site_id=4) - all services visible
(4, 50, 'Gıda Laboratuvarı Kurulum', 'Food Laboratory Setup', 3500.00, 'TRY', 1, 1, 50),
(4, 51, 'Ekipman Kalibrasyon Hizmeti', 'Equipment Calibration Service', 1200.00, 'TRY', 1, 0, 51),
(4, 52, 'Laboratuvar Personel Eğitimi', 'Laboratory Staff Training', 5000.00, 'TRY', 1, 1, 52),
(4, 53, 'Turnkey Laboratuvar Projeleri', 'Turnkey Laboratory Projects', 20000.00, 'TRY', 1, 1, 53),

-- gidatest.com (site_id=5) - only analysis services
(5, 50, 'Profesyonel Gıda Analizi', 'Professional Food Analysis', 3200.00, 'TRY', 1, 1, 50),
(5, 51, 'Analiz Cihazı Kalibrasyonu', 'Analysis Instrument Calibration', 1100.00, 'TRY', 1, 0, 51);

-- ─── SITE PROJECT OVERRIDES ───
INSERT OR IGNORE INTO site_project_overrides (site_id, project_id, title, title_en, is_visible, is_featured, sort_order) VALUES
-- labkurulum.com (site_id=4) - all projects visible
(4, 100, 'Referans: Üniversite Gıda Laboratuvarı', 'Reference: University Food Laboratory', 1, 1, 1),
(4, 101, 'Referans: Hastane İlaç Laboratuvarı', 'Reference: Hospital Pharmaceutical Laboratory', 1, 1, 2),
(4, 102, 'Referans: Belediye Su Analiz Laboratuvarı', 'Reference: Municipality Water Analysis Laboratory', 1, 0, 3),

-- gidatest.com (site_id=5) - only food testing projects
(5, 100, 'Gıda Test Referansı: Marmara Üniversitesi', 'Food Test Reference: Marmara University', 1, 1, 1);
