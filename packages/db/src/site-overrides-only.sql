-- Site overrides only - UTF-8 encoded

-- Site Product Overrides
INSERT OR IGNORE INTO site_product_overrides (site_id, product_id, title, title_en, price, currency, is_visible, is_featured, sort_order) VALUES
-- atagotr.com (site_id=2) overrides
(2, 100, 'ATAGO HPLC Sistemi Agilent 1260', 'ATAGO HPLC System Agilent 1260', 295000.00, 'TRY', 1, 1, 1),
(2, 101, 'ATAGO GC-MS Shimadzu QP2020', 'ATAGO GC-MS Shimadzu QP2020', 445000.00, 'TRY', 1, 1, 2),
(2, 110, 'ATAGO Laboratuvar pH Metre', 'ATAGO Laboratory pH Meter', 19500.00, 'TRY', 1, 0, 10),
(2, 111, 'ATAGO Portatif pH Metre', 'ATAGO Portable pH Meter', 3500.00, 'TRY', 1, 1, 11),

-- gidakimya.com (site_id=3) overrides (only chemicals)
(3, 200, 'Gida Kimya Sulfurik Asit 1N', 'Food Chemistry Sulfuric Acid 1N', 480.00, 'TRY', 1, 1, 20),
(3, 201, 'Gida Kimya Hidroklorik Asit 37%', 'Food Chemistry Hydrochloric Acid 37%', 420.00, 'TRY', 1, 0, 21),

-- labkurulum.com (site_id=4) overrides (only services and projects)
(4, 50, 'Laboratuvar Kurulum Gida Analizi', 'Lab Setup Food Analysis', 3000.00, 'TRY', 1, 1, 50),
(4, 51, 'Laboratuvar Kurulum pH Kalibrasyon', 'Lab Setup pH Calibration', 1000.00, 'TRY', 1, 0, 51),
(4, 52, 'Laboratuvar Kurulum Egitim', 'Lab Setup Training', 4500.00, 'TRY', 1, 1, 52),
(4, 53, 'Laboratuvar Kurulum Danismanlik', 'Lab Setup Consulting', 18000.00, 'TRY', 1, 1, 53),

-- gidatest.com (site_id=5) overrides (only analysis services)
(5, 50, 'Gida Test Analiz Hizmeti', 'Food Test Analysis Service', 2800.00, 'TRY', 1, 1, 50),
(5, 51, 'Gida Test pH Kalibrasyon', 'Food Test pH Calibration', 950.00, 'TRY', 1, 0, 51),

-- alerjen.net (site_id=6) overrides (only allergen testing)
(6, 5, 'Alerjen.net Gluten Test Kiti', 'Alerjen.net Gluten Test Kit', 3000.00, 'TRY', 1, 1, 5),

-- hijyenkontrol.com (site_id=7) overrides (only hygiene products)
(7, 6, 'Hijyen Kontrol Yuzey Dezenfektani', 'Hygiene Control Surface Disinfectant', 500.00, 'TRY', 1, 1, 4);

-- Site Service Overrides
INSERT OR IGNORE INTO site_service_overrides (site_id, service_id, title, title_en, price, currency, is_visible, is_featured, sort_order) VALUES
-- labkurulum.com (site_id=4) - all services visible
(4, 50, 'Gida Laboratuvari Kurulum', 'Food Laboratory Setup', 3500.00, 'TRY', 1, 1, 50),
(4, 51, 'Ekipman Kalibrasyon Hizmeti', 'Equipment Calibration Service', 1200.00, 'TRY', 1, 0, 51),
(4, 52, 'Laboratuvar Personel Egitimi', 'Laboratory Staff Training', 5000.00, 'TRY', 1, 1, 52),
(4, 53, 'Turnkey Laboratuvar Projeleri', 'Turnkey Laboratory Projects', 20000.00, 'TRY', 1, 1, 53),

-- gidatest.com (site_id=5) - only analysis services
(5, 50, 'Profesyonel Gida Analizi', 'Professional Food Analysis', 3200.00, 'TRY', 1, 1, 50),
(5, 51, 'Analiz Cihazi Kalibrasyonu', 'Analysis Instrument Calibration', 1100.00, 'TRY', 1, 0, 51);

-- Site Project Overrides
INSERT OR IGNORE INTO site_project_overrides (site_id, project_id, title, title_en, is_visible, is_featured, sort_order) VALUES
-- labkurulum.com (site_id=4) - all projects visible
(4, 100, 'Referans: Universite Gida Laboratuvari', 'Reference: University Food Laboratory', 1, 1, 1),
(4, 101, 'Referans: Hastane Ilaç Laboratuvari', 'Reference: Hospital Pharmaceutical Laboratory', 1, 1, 2),
(4, 102, 'Referans: Belediye Su Analiz Laboratuvari', 'Reference: Municipality Water Analysis Laboratory', 1, 0, 3),

-- gidatest.com (site_id=5) - only food testing projects
(5, 100, 'Gida Test Referansi: Marmara Universitesi', 'Food Test Reference: Marmara University', 1, 1, 1);
