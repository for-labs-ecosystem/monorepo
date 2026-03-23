CREATE TABLE `article_related_products` (
	`article_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	PRIMARY KEY(`article_id`, `product_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `articles` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `keywords` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `meta_title_en` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `meta_description_en` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `published_at` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `keywords` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `meta_title_en` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `meta_description_en` text;--> statement-breakpoint
ALTER TABLE `site_article_overrides` ADD `published_at` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `type` text DEFAULT 'product';--> statement-breakpoint
ALTER TABLE `projects` ADD `header_image_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `metrics` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `testimonial` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `testimonial_author` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `testimonial_author_title` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `status` text DEFAULT 'completed';--> statement-breakpoint
ALTER TABLE `projects` ADD `start_date` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `is_featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `ecommerce_config` text;