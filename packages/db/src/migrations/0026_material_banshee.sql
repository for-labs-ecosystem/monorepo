CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_info` text DEFAULT '{}',
	`iyzico_config` text DEFAULT '{}',
	`smtp_config` text DEFAULT '{}',
	`ecommerce_config` text DEFAULT '{}',
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
