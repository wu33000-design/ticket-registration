CREATE TABLE `tableLeaders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(120) NOT NULL DEFAULT '桌長',
	`people` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tableLeaders_id` PRIMARY KEY(`id`),
	CONSTRAINT `tableLeaders_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `registrations` ADD `leaderId` int;
--> statement-breakpoint
DELETE FROM `registrations`;
DELETE FROM `tableLeaders`;
DELETE FROM `events`;
--> statement-breakpoint
INSERT INTO `events` (`slug`,`label`,`dateLabel`,`capacity`,`booked`) VALUES
('9-21','9/21','9 月 21 日｜第一場',10,1),
('9-22A','9/22 A','9 月 22 日｜A 場',10,1),
('9-22B','9/22 B','9 月 22 日｜B 場',10,1);
--> statement-breakpoint
INSERT INTO `tableLeaders` (`code`,`eventId`,`name`,`people`) VALUES
('921',(SELECT `id` FROM `events` WHERE `slug`='9-21'),'桌長',1),
('922a',(SELECT `id` FROM `events` WHERE `slug`='9-22A'),'桌長',1),
('922b',(SELECT `id` FROM `events` WHERE `slug`='9-22B'),'桌長',1);