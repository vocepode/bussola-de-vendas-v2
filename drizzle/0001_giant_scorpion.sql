CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`color` varchar(50),
	`criteria` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`instructions` text,
	`exerciseType` enum('text','multiple_choice','file_upload','checklist') NOT NULL,
	`config` json,
	`points` int NOT NULL DEFAULT 10,
	`isRequired` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`timeSpentMinutes` int DEFAULT 0,
	CONSTRAINT `lessonProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`contentType` enum('text','video','exercise','checklist','template') NOT NULL,
	`content` text,
	`videoUrl` varchar(500),
	`orderIndex` int NOT NULL,
	`durationMinutes` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moduleProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`moduleId` int NOT NULL,
	`status` enum('locked','in_progress','completed') NOT NULL DEFAULT 'locked',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `moduleProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`color` varchar(50),
	`orderIndex` int NOT NULL,
	`prerequisiteModuleId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`resourceType` enum('template','link','document','tool') NOT NULL,
	`url` varchar(500),
	`fileUrl` varchar(500),
	`orderIndex` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`answer` text,
	`fileUrl` varchar(500),
	`status` enum('draft','submitted','reviewed','approved') NOT NULL DEFAULT 'submitted',
	`score` int,
	`feedback` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
