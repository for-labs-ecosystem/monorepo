CREATE TABLE `wizard_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`step_id` integer NOT NULL,
	`label` text NOT NULL,
	`label_en` text,
	`value` text NOT NULL,
	`description` text,
	`description_en` text,
	`match_tags` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`step_id`) REFERENCES `wizard_steps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wizard_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` integer NOT NULL,
	`step_number` integer NOT NULL,
	`field_key` text NOT NULL,
	`title` text,
	`title_en` text,
	`prefix` text,
	`prefix_en` text,
	`suffix` text,
	`suffix_en` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wizard_steps_site_step_unique` ON `wizard_steps` (`site_id`,`step_number`);