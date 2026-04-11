ALTER TABLE `sporting_event_schedules` RENAME COLUMN "date" TO "date_start";--> statement-breakpoint
ALTER TABLE `sporting_event_schedules` ADD `date_end` text;