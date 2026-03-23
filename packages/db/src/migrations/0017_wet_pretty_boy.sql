ALTER TABLE `media` RENAME COLUMN "path" TO "key";--> statement-breakpoint
DROP INDEX `media_path_unique`;--> statement-breakpoint
ALTER TABLE `media` ADD `url` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `media_key_unique` ON `media` (`key`);