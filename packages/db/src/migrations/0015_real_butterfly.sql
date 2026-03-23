CREATE TABLE `navigations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` integer NOT NULL,
	`page_id` integer,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`parent_id` integer,
	`location` text DEFAULT 'header' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_nav_site_location` ON `navigations` (`site_id`,`location`);--> statement-breakpoint
CREATE INDEX `idx_nav_page` ON `navigations` (`site_id`,`page_id`);