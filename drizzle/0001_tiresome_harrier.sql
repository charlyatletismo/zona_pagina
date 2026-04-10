ALTER TABLE `sporting_event_registrations` ADD `event_team_leader_id` text(28) REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `sporting_events` ADD `mercadopago_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sporting_events` ADD `bank_alias` text(64);