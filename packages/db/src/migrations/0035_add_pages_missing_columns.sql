-- Add missing canonical_url column to pages and site_page_overrides
ALTER TABLE `pages` ADD `canonical_url` text;--> statement-breakpoint
ALTER TABLE `site_page_overrides` ADD `canonical_url` text;
