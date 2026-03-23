-- Recreate inquiries table with dynamic payload schema
-- SQLite doesn't support ADD NOT NULL without default, so we rebuild the table.

CREATE TABLE `inquiries_new` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `site_id` integer NOT NULL REFERENCES `sites`(`id`),
  `sender_name` text NOT NULL,
  `sender_email` text NOT NULL,
  `payload` text,
  `status` text NOT NULL DEFAULT 'new',
  `created_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);--> statement-breakpoint

INSERT INTO `inquiries_new` (`id`, `site_id`, `sender_name`, `sender_email`, `status`, `created_at`, `updated_at`)
SELECT `id`, `site_id`, `name`, `email`, `status`, `created_at`, `updated_at`
FROM `inquiries`;--> statement-breakpoint

DROP TABLE `inquiries`;--> statement-breakpoint

ALTER TABLE `inquiries_new` RENAME TO `inquiries`;
