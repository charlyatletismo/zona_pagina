ALTER TABLE `inscriptions` RENAME TO `sporting_event_registrations`;--> statement-breakpoint
ALTER TABLE `sporting_event_registrations` RENAME COLUMN "inscription_date" TO "registration_date";--> statement-breakpoint
ALTER TABLE `sporting_events` RENAME COLUMN "inscription_start" TO "registration_start";--> statement-breakpoint
ALTER TABLE `sporting_events` RENAME COLUMN "inscription_end" TO "registration_end";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sporting_event_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`payment_date` text,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sporting_event_registrations`("id", "event_id", "user_id", "registration_date", "paid", "payment_date") SELECT "id", "event_id", "user_id", "registration_date", "paid", "payment_date" FROM `sporting_event_registrations`;--> statement-breakpoint
DROP TABLE `sporting_event_registrations`;--> statement-breakpoint
ALTER TABLE `__new_sporting_event_registrations` RENAME TO `sporting_event_registrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;