-- Sync all missing columns between Drizzle schema and actual D1 tables
-- products: add SEO columns
ALTER TABLE `products` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `products` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `canonical_url` text;--> statement-breakpoint
-- articles: add SEO columns
ALTER TABLE `articles` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `canonical_url` text;--> statement-breakpoint
-- site_article_overrides: add SEO columns
ALTER TABLE `site_article_overrides` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `canonical_url` text;--> statement-breakpoint
-- sites: add enabled_modules
ALTER TABLE `sites` ADD `enabled_modules` text;
