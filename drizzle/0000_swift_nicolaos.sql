CREATE TABLE `athlete_category_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`base_name` text(64) NOT NULL,
	`male_name` text(64) DEFAULT 'Masculino',
	`female_name` text(64) DEFAULT 'Femenino',
	`unisex_name` text(64),
	`min_age` integer,
	`max_age` integer
);
--> statement-breakpoint
CREATE TABLE `clothing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`clothing_type` text(64) NOT NULL,
	`size` text(8) NOT NULL,
	`available_quantity` integer DEFAULT 0 NOT NULL,
	`demanded_quantity` integer DEFAULT 0 NOT NULL,
	`reserved_quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `disclaimers_of_liability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(64) NOT NULL,
	`content` text(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`locality` text(64) NOT NULL,
	`province` text(64) NOT NULL,
	`country` text(64) NOT NULL,
	`latitude` real,
	`longitude` real
);
--> statement-breakpoint
CREATE TABLE `sporting_event_athlete_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`circuit_id` integer NOT NULL,
	`name` text(64) NOT NULL,
	`sex` text(1),
	`min_age` integer,
	`max_age` integer,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`circuit_id`) REFERENCES `sporting_event_circuits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_circuits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
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
	`training_team_id` integer,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`discount_percentage` integer DEFAULT 0 NOT NULL,
	`discount_reason` text(256),
	`fee_amount_after_discount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`paid_percentage` real DEFAULT 0 NOT NULL,
	`demanded_clothing_id` integer NOT NULL,
	`reserved_clothing_id` integer,
	`special_needs` text(512),
	`status` text(16) DEFAULT 'pending' NOT NULL,
	`full_payment_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `sporting_event_athlete_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`training_team_id`) REFERENCES `training_teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`demanded_clothing_id`) REFERENCES `clothing`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reserved_clothing_id`) REFERENCES `clothing`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`date` text NOT NULL,
	`title` text(128) NOT NULL,
	`description` text(512),
	`location` text(256),
	`location_address` text(128),
	`location_lat` real,
	`location_long` real,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sporting_event_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`transaction_type` text(16) NOT NULL,
	`category` text(64) NOT NULL,
	`amount` real NOT NULL,
	`currency` text(3) DEFAULT 'ARS' NOT NULL,
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
	`name` text(64) NOT NULL
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
	`location` text(256),
	`location_address` text(256),
	`location_lat` real,
	`location_long` real,
	`event_type` integer NOT NULL,
	`rules` text(2048),
	`disclaimer_of_liability_id` integer,
	`award_prizes` text(1024),
	`fee_amount` real,
	`fee_currency` text(3) DEFAULT 'ARS',
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_update_by` text NOT NULL,
	`last_update_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_type`) REFERENCES `sporting_event_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`disclaimer_of_liability_id`) REFERENCES `disclaimers_of_liability`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_update_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `training_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(128) NOT NULL,
	`location` text(256),
	`coach_name` text(128),
	`coach_user_id` text(28),
	`contact_email` text(64),
	`contact_phone` text(32),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coach_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(28) NOT NULL,
	`field_name` text(64) NOT NULL,
	`old_value` text,
	`new_value` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(28) PRIMARY KEY NOT NULL,
	`name` text,
	`surname` text,
	`phone` text,
	`email` text,
	`emergency_contact_name` text,
	`emergency_contact_phone` text,
	`sex` text(1),
	`date_of_birth` text,
	`clothing_tshirt_size` text(8),
	`address` text(256) NOT NULL,
	`location` text(256),
	`location_temp` text(256),
	`special_needs` text(512),
	`discount_percentage` integer DEFAULT 0 NOT NULL,
	`manager_id` text(28),
	`training_team_id` integer,
	`training_team_temp` text(128),
	`profile_image_url` text(512),
	`profile_image_preview_url` text(512),
	`temp_code` text(6),
	`role` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`training_team_id`) REFERENCES `training_teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);