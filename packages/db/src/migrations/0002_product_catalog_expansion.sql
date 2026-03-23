-- New columns for products table (additive — all nullable)
ALTER TABLE `products` ADD COLUMN `content` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `compare_price` real;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `unit` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `brand` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `model_number` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `sku` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `warranty_period` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `campaign_label` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `features` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `application_areas` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `tags` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `is_featured` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `sort_order` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- New columns for site_product_overrides table  
ALTER TABLE `site_product_overrides` ADD COLUMN `content` text;
--> statement-breakpoint
ALTER TABLE `site_product_overrides` ADD COLUMN `compare_price` real;
--> statement-breakpoint
ALTER TABLE `site_product_overrides` ADD COLUMN `campaign_label` text;
