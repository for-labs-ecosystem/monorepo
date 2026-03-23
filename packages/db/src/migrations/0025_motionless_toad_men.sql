-- Migration 0025: Rebuild users table for Google OAuth (no passwords)
-- Drops password_hash, updated_at; adds avatar_url, last_login; makes name nullable

PRAGMA foreign_keys=OFF;

CREATE TABLE `users_new` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `email` text NOT NULL,
    `name` text,
    `avatar_url` text,
    `role` text DEFAULT 'editor' NOT NULL,
    `is_active` integer DEFAULT true NOT NULL,
    `last_login` text,
    `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- Migrate existing data (carry over what we can)
INSERT INTO `users_new` (`id`, `email`, `name`, `role`, `is_active`, `created_at`)
SELECT `id`, `email`, `name`, `role`, `is_active`, `created_at` FROM `users`;

DROP TABLE `users`;
ALTER TABLE `users_new` RENAME TO `users`;

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- Seed the immutable root super_admin account
INSERT OR IGNORE INTO `users` (`email`, `name`, `role`, `is_active`)
VALUES ('info@for-labs.com', 'For-Labs Root', 'super_admin', 1);

PRAGMA foreign_keys=ON;
