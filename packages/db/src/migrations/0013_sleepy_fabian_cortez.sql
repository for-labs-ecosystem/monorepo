CREATE TABLE `article_related_products` (
	`article_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	PRIMARY KEY(`article_id`, `product_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `sites` ADD `ecommerce_config` text;