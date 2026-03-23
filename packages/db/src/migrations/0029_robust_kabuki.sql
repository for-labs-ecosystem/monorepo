CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` integer NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`google_id` text,
	`phone` text,
	`company_name` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`addresses` text,
	`cart_data` text,
	`favorite_products` text,
	`favorite_articles` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_email_unique` ON `members` (`email`);