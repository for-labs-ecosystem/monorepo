CREATE TABLE `site_category_overrides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`name` text,
	`name_en` text,
	`description` text,
	`description_en` text,
	`parent_id` integer,
	`sort_order` integer,
	`meta_title` text,
	`meta_description` text,
	`canonical_url` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_site_category` ON `site_category_overrides` (`site_id`,`category_id`);--> statement-breakpoint
ALTER TABLE `categories` ADD `name_en` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `description_en` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `canonical_url` text;