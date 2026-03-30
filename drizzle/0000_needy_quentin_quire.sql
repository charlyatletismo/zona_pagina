CREATE TABLE `chips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prefix` text(8) NOT NULL,
	`padding_n` integer NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
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
CREATE TABLE `sporting_event_circuits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`name` text(128) NOT NULL,
	`description` text(512),
	`distance_km` real NOT NULL,
	`map_url` text(512),
	`competitive` integer DEFAULT 1 NOT NULL,
	`bib_number_start` integer NOT NULL,
	`bib_number_end` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sporting_event_clothing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`clothing_type` text(64) NOT NULL,
	`size` text(8) NOT NULL,
	`purchased_quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sporting_event_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(28) NOT NULL,
	`training_team_id` integer,
	`event_id` integer,
	`circuit_id` integer,
	`age_at_event_date` integer NOT NULL,
	`discount_percentage` integer DEFAULT 0 NOT NULL,
	`discount_reason` text(256),
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`promotional_fee_applied` integer DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`status` text(16) DEFAULT 'pending' NOT NULL,
	`full_payment_date` text,
	`demanded_clothing_id` integer,
	`reserved_clothing_id` integer,
	`chip_id` text(32),
	`bib_number` integer,
	`kit_delivered` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text(28),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text(28),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`training_team_id`) REFERENCES `training_teams`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`circuit_id`) REFERENCES `sporting_event_circuits`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`demanded_clothing_id`) REFERENCES `sporting_event_clothing`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`reserved_clothing_id`) REFERENCES `sporting_event_clothing`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
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
	`notification_template_id` text(64),
	`notify_at` text(64),
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sporting_event_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer,
	`transaction_type` text(16) NOT NULL,
	`category` text(64) NOT NULL,
	`amount` real NOT NULL,
	`currency` text(3) DEFAULT 'ARS' NOT NULL,
	`description` text(512),
	`transaction_date` text NOT NULL,
	`user_id` text(28),
	`registration_id` integer,
	`vendor_supplier` text(256),
	`receipt_url` text(512),
	`payment_method` text(32),
	`status` text(16) DEFAULT 'completed' NOT NULL,
	`created_by` text(28),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text(28),
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`event_id`) REFERENCES `sporting_events`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`registration_id`) REFERENCES `sporting_event_registrations`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sporting_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`photo_id` text(36),
	`date` text NOT NULL,
	`registration_start` text(64),
	`registration_end` text(64),
	`location` text(256),
	`location_address` text(256),
	`location_lat` real,
	`location_long` real,
	`event_type` text(32) NOT NULL,
	`rules` text(2048),
	`disclaimer_of_liability` text(4096),
	`award_prizes` text(1024),
	`fee_amount` real,
	`fee_currency` text(3) DEFAULT 'ARS',
	`fee_payment_due_date` text(64),
	`fee_amount_promotional` real,
	`promotional_fee_end` text(64),
	`promotional_fee_payment_due_date` text(64),
	`age_ranges` text(64),
	`results_url` text(512),
	`hidden` integer DEFAULT 0 NOT NULL,
	`created_by` text(28) NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text(28) NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
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
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`coach_user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(28) NOT NULL,
	`field_name` text(64) NOT NULL,
	`old_value` text,
	`new_value` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text(28),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
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
	`clothing_shirt_size` text(8),
	`location` text(256),
	`location_temp` text(256),
	`location_address` text(256),
	`special_needs` text(512),
	`discount_percentage` integer DEFAULT 0 NOT NULL,
	`manager_id` text(28),
	`training_team_id` integer,
	`training_team_temp` text(128),
	`profile_photo_id` text(512),
	`banned` integer DEFAULT 0 NOT NULL,
	`ban_reason` text(512),
	`language` text(2) DEFAULT 'es' NOT NULL,
	`temp_code` text(6),
	`role` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`location`) REFERENCES `locations`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`training_team_id`) REFERENCES `training_teams`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);