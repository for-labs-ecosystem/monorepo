-- Add missing SEO columns to site_product_overrides
ALTER TABLE `site_product_overrides` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `site_product_overrides` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `site_product_overrides` ADD `canonical_url` text;
