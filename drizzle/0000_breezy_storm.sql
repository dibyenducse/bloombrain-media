CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`kind` text NOT NULL,
	`path` text NOT NULL,
	`video` text,
	`referrer` text,
	`device` text,
	`country` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
