CREATE TABLE `favorite_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`repoFullName` varchar(255) NOT NULL,
	`repoName` varchar(255) NOT NULL,
	`repoUrl` varchar(512) NOT NULL,
	`repoDescription` text,
	`language` varchar(80),
	`matchScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorite_projects_user_repo_idx` UNIQUE(`userId`,`repoFullName`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skills` text NOT NULL,
	`interests` text NOT NULL,
	`experience` enum('مبتدئ','متوسط','متقدم') NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_idx` UNIQUE(`userId`)
);
