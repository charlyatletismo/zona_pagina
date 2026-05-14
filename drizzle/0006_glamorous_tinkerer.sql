PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(28) NOT NULL,
	`field_name` text(64) NOT NULL,
	`old_value` text,
	`new_value` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text(28),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_user_updates`("id", "user_id", "field_name", "old_value", "new_value", "updated_at", "updated_by") SELECT "id", "user_id", "field_name", "old_value", "new_value", "updated_at", "updated_by" FROM `user_updates`;--> statement-breakpoint
DROP TABLE `user_updates`;--> statement-breakpoint
ALTER TABLE `__new_user_updates` RENAME TO `user_updates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;