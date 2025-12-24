CREATE TABLE `athlete_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256),
	`fee_category_id` integer NOT NULL,
	`min_age` integer,
	`max_age` integer,
	`condition` text(256),
	FOREIGN KEY (`fee_category_id`) REFERENCES `fees_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fees_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256)
);
--> statement-breakpoint
CREATE TABLE `sporting_event_athlete_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`athlete_category_id` integer NOT NULL,
	`fee_category_id` integer NOT NULL,
	`circuit_id` integer NOT NULL,
	`distance_km` real NOT NULL,
	`fee_amount` real NOT NULL,
	`allowed` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_category_id`) REFERENCES `athlete_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fee_category_id`) REFERENCES `fees_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`circuit_id`) REFERENCES `sporting_event_circuits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_circuits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`name` text(128) NOT NULL,
	`description` text(512),
	`distance_km` real NOT NULL,
	`map_url` text(512),
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`category_id` integer NOT NULL,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`payment_date` text,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `sporting_event_athlete_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`date` text NOT NULL,
	`title` text(128) NOT NULL,
	`description` text(512),
	`location_hint` text(256),
	`location_text` text(256),
	`location_lat` real,
	`location_long` real,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`transaction_type` text(16) NOT NULL,
	`category` text(64) NOT NULL,
	`amount` real NOT NULL,
	`currency` text(3) DEFAULT 'EUR' NOT NULL,
	`description` text(512),
	`transaction_date` text NOT NULL,
	`user_id` text,
	`registration_id` integer,
	`vendor_supplier` text(256),
	`receipt_url` text(512),
	`payment_method` text(32),
	`status` text(16) DEFAULT 'completed' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`notes` text(1024),
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registration_id`) REFERENCES `sporting_event_registrations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256)
);
--> statement-breakpoint
CREATE TABLE `sporting_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text(512),
	`image_preview_url` text(512),
	`date` text NOT NULL,
	`registration_start` text(64),
	`registration_end` text(64),
	`location_hint` text(256),
	`location_text` text(256),
	`location_lat` real,
	`location_long` real,
	`event_type` integer NOT NULL,
	`rules` text(2048),
	`disclaimer_of_liability_title` text(64),
	`disclaimer_of_liability_content` text(2048),
	`award_prizes` text(1024),
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_update_by` text NOT NULL,
	`last_update_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`event_type`) REFERENCES `sporting_event_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_update_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(28) PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`name` text,
	`surname` text,
	`sex` text(1),
	`date_of_birth` text,
	`country` text(64),
	`city` text(64),
	`full_location` text(256),
	`manager_id` text(28),
	`training_team` text(64),
	`email` text,
	`temp_code` text(6),
	`roles` text,
	`hard_category` integer,
	`profile_image_url` text(512),
	`profile_image_preview_url` text(512),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`hard_category`) REFERENCES `athlete_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);