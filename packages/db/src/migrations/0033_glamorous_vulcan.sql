ALTER TABLE `products` ADD `stock_quantity` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `site_product_overrides` ADD `stock_quantity` integer;