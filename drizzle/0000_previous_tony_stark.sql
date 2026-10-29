CREATE TABLE `events` (
	`id` varchar(36) NOT NULL,
	`session` varchar(36) NOT NULL,
	`kind` varchar(16) NOT NULL,
	`path` varchar(32) NOT NULL,
	`video` varchar(100),
	`referrer` varchar(255),
	`device` varchar(16),
	`country` varchar(8),
	`created_at` bigint NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`service` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`created_at` bigint NOT NULL,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `events_created_at_idx` ON `events` (`created_at`);--> statement-breakpoint
CREATE INDEX `events_session_idx` ON `events` (`session`);