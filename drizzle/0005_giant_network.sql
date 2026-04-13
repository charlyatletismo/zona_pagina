PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sporting_events` (
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
	`rules` text(16384),
	`disclaimer_of_liability` text(8192),
	`award_prizes` text(1024),
	`mercadopago_enabled` integer DEFAULT 0 NOT NULL,
	`bank_alias` text(64),
	`fee_amount` real,
	`fee_currency` text(3) DEFAULT 'ARS',
	`fee_payment_due_date` text(64),
	`fee_amount_promotional` real,
	`promotional_fee_end` text(64),
	`promotional_fee_payment_due_date` text(64),
	`age_ranges` text(64),
	`external_register_url` text(512),
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
INSERT INTO `__new_sporting_events`("id", "title", "description", "photo_id", "date", "registration_start", "registration_end", "location", "location_address", "location_lat", "location_long", "event_type", "rules", "disclaimer_of_liability", "award_prizes", "mercadopago_enabled", "bank_alias", "fee_amount", "fee_currency", "fee_payment_due_date", "fee_amount_promotional", "promotional_fee_end", "promotional_fee_payment_due_date", "age_ranges", "external_register_url", "results_url", "hidden", "created_by", "created_at", "updated_by", "updated_at") SELECT "id", "title", "description", "photo_id", "date", "registration_start", "registration_end", "location", "location_address", "location_lat", "location_long", "event_type", "rules", "disclaimer_of_liability", "award_prizes", "mercadopago_enabled", "bank_alias", "fee_amount", "fee_currency", "fee_payment_due_date", "fee_amount_promotional", "promotional_fee_end", "promotional_fee_payment_due_date", "age_ranges", "external_register_url", "results_url", "hidden", "created_by", "created_at", "updated_by", "updated_at" FROM `sporting_events`;--> statement-breakpoint
DROP TABLE `sporting_events`;--> statement-breakpoint
ALTER TABLE `__new_sporting_events` RENAME TO `sporting_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;