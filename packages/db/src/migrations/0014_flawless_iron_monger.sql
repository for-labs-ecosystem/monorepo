CREATE TABLE `project_related_products` (
	`project_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	PRIMARY KEY(`project_id`, `product_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
