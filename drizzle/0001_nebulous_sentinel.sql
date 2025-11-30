ALTER TABLE `users` ADD `sex` text(1);--> statement-breakpoint
ALTER TABLE `users` ADD `date_of_birth` text;--> statement-breakpoint
ALTER TABLE `users` ADD `country` text(64);--> statement-breakpoint
ALTER TABLE `users` ADD `city` text(64);--> statement-breakpoint
ALTER TABLE `users` ADD `full_location` text(256);--> statement-breakpoint
ALTER TABLE `users` ADD `manager_id` text(28) REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `training_team` text(64);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `age`;