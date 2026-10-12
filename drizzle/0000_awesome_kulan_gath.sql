CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`kind` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`pet_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `pet_id`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`animal_id` text NOT NULL,
	`own_animal_id` text,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`timezone` text NOT NULL,
	`purpose` text NOT NULL,
	`place` text NOT NULL,
	`note` text NOT NULL,
	`state` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meetings_participants` ON `meetings` (`sender_id`,`recipient_id`);--> statement-breakpoint
CREATE TABLE `pets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`breed` text NOT NULL,
	`sex` text NOT NULL,
	`born` text NOT NULL,
	`city` text NOT NULL,
	`description` text NOT NULL,
	`parents` text DEFAULT '[]' NOT NULL,
	`photo_id` text,
	`pedigree_id` text,
	`status` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pets_owner` ON `pets` (`owner_id`);--> statement-breakpoint
CREATE INDEX `pets_species_city` ON `pets` (`species`,`city`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`resource_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reservation_resource` ON `reservations` (`resource_id`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `users_provider` ON `users` (`provider`,`provider_id`);
--> statement-breakpoint
CREATE TRIGGER prevent_reservation_overlap BEFORE INSERT ON reservations
WHEN EXISTS (SELECT 1 FROM reservations WHERE resource_id = NEW.resource_id AND starts_at < NEW.ends_at AND ends_at > NEW.starts_at)
BEGIN SELECT RAISE(ABORT, 'reservation_conflict'); END;

--> statement-breakpoint
CREATE TRIGGER reservation_requires_confirmation BEFORE INSERT ON reservations
WHEN (SELECT state FROM meetings WHERE id = NEW.meeting_id) <> 'confirmed'
BEGIN SELECT RAISE(ABORT, 'meeting_not_confirmed'); END;
