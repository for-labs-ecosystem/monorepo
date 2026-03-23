-- Seed 10 test products
INSERT INTO products (
    slug, title, description, content, specs, price, compare_price, currency, unit,
    brand, model_number, sku, warranty_period, campaign_label,
    features, application_areas, tags,
    analysis_types, automation_level, compliance_tags,
    category_id, is_active, is_featured, sort_order
) VALUES 
('test-urun-11', 'Test Ürünü 1', 'Bu bir test ürünüdür 1', '<p>Test içeriği 1</p>', '{}', 100, 150, 'TRY', 'Adet', 'TestBrand', 'TB-01', 'TST-01', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 11),
('test-urun-12', 'Test Ürünü 2', 'Bu bir test ürünüdür 2', '<p>Test içeriği 2</p>', '{}', 200, 250, 'TRY', 'Adet', 'TestBrand', 'TB-02', 'TST-02', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 12),
('test-urun-13', 'Test Ürünü 3', 'Bu bir test ürünüdür 3', '<p>Test içeriği 3</p>', '{}', 300, 350, 'TRY', 'Adet', 'TestBrand', 'TB-03', 'TST-03', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 13),
('test-urun-14', 'Test Ürünü 4', 'Bu bir test ürünüdür 4', '<p>Test içeriği 4</p>', '{}', 400, 450, 'TRY', 'Adet', 'TestBrand', 'TB-04', 'TST-04', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 14),
('test-urun-15', 'Test Ürünü 5', 'Bu bir test ürünüdür 5', '<p>Test içeriği 5</p>', '{}', 500, 550, 'TRY', 'Adet', 'TestBrand', 'TB-05', 'TST-05', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 15),
('test-urun-16', 'Test Ürünü 6', 'Bu bir test ürünüdür 6', '<p>Test içeriği 6</p>', '{}', 600, 650, 'TRY', 'Adet', 'TestBrand', 'TB-06', 'TST-06', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 16),
('test-urun-17', 'Test Ürünü 7', 'Bu bir test ürünüdür 7', '<p>Test içeriği 7</p>', '{}', 700, 750, 'TRY', 'Adet', 'TestBrand', 'TB-07', 'TST-07', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 17),
('test-urun-18', 'Test Ürünü 8', 'Bu bir test ürünüdür 8', '<p>Test içeriği 8</p>', '{}', 800, 850, 'TRY', 'Adet', 'TestBrand', 'TB-08', 'TST-08', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 18),
('test-urun-19', 'Test Ürünü 9', 'Bu bir test ürünüdür 9', '<p>Test içeriği 9</p>', '{}', 900, 950, 'TRY', 'Adet', 'TestBrand', 'TB-09', 'TST-09', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 19),
('test-urun-20', 'Test Ürünü 10', 'Bu bir test ürünüdür 10', '<p>Test içeriği 10</p>', '{}', 1000, 1050, 'TRY', 'Adet', 'TestBrand', 'TB-10', 'TST-10', '1 Yıl', 'Test', '[]', '[]', '["test"]', '[]', 'manual', '[]', NULL, 1, 0, 20);

-- Make them visible for for-labs.com (site_id=1)
INSERT INTO site_product_overrides (site_id, product_id, is_featured, is_visible, sort_order) 
SELECT 1, id, 0, 1, sort_order FROM products WHERE slug LIKE 'test-urun-%';
