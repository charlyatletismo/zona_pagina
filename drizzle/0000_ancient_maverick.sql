CREATE TABLE `event_circuits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`name` text(128) NOT NULL,
	`description` text(512),
	`distance_km` real NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_runner_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`runner_category_id` text NOT NULL,
	`fee_category_id` text NOT NULL,
	`distance_km` real NOT NULL,
	`fee_amount` real NOT NULL,
	`allowed` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`runner_category_id`) REFERENCES `runner_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fee_category_id`) REFERENCES `fees_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`date` text NOT NULL,
	`title` text(128) NOT NULL,
	`description` text(512),
	`location_hint` text(256),
	`location_text` text(256),
	`location_lat` real,
	`location_long` real,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text(512),
	`date` text NOT NULL,
	`inscription_start` text(64),
	`inscription_end` text(64),
	`location_hint` text(256),
	`location_text` text(256),
	`location_lat` real,
	`location_long` real,
	`circuit_map_url` text(512),
	`event_type` integer NOT NULL,
	`rules` text(2048),
	`disclaimer_of_liability_title` text(64),
	`disclaimer_of_liability_content` text(2048),
	`award_prizes` text(1024),
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_update_by` text NOT NULL,
	`last_update_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`event_type`) REFERENCES `event_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_update_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fees_categories` (
	`id` text(28) PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256)
);
--> statement-breakpoint
CREATE TABLE `inscriptions` (
	`id` text(28) PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`inscription_date` text NOT NULL,
	`paid` integer NOT NULL,
	`payment_date` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `runner_categories` (
	`id` text(28) PRIMARY KEY NOT NULL,
	`name` text(64) NOT NULL,
	`description` text(256),
	`fee_category_id` text NOT NULL,
	`min_age` integer,
	`max_age` integer,
	`condition` text(256),
	FOREIGN KEY (`fee_category_id`) REFERENCES `fees_categories`(`id`) ON UPDATE no action ON DELETE no action
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
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);