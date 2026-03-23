ALTER TABLE `orders` ADD `customer_type` text DEFAULT 'individual';--> statement-breakpoint
ALTER TABLE `orders` ADD `company_name` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `tax_office` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `tax_number` text;