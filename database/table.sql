Create Database web_streaming;
-- Drop Database web_streaming;
use web_streaming;

SET SQL_SAFE_UPDATES = 0;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(20) NOT NULL,
  `fullname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `bio` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `role_user` varchar(20) NOT NULL DEFAULT 'VIEWER',
  `token` int DEFAULT '0',
  `photo` varchar(255) DEFAULT NULL,
  `last_changed_password_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `last_logout_at` datetime DEFAULT NULL,
  `is_active` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `room_block_chat` (
  `room_id` int DEFAULT NULL,
  `blocked_user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


Create Table followers(
	id int AUTO_INCREMENT,
	host_id int,
    follower_id int,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
	Primary Key(id)
);

Create Table rooms(
	id int AUTO_INCREMENT,
    streamer_id int,
	title nvarchar(50),
	description nvarchar(100),
    tags nvarchar(4000),
	likes int DEFAULT 0,
	viewers int DEFAULT 0,
    thumbnail varchar(255),
	status int DEFAULT 1,
	created_at datetime DEFAULT CURRENT_TIMESTAMP,
    Primary Key(id)
);

CREATE TABLE `videos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `streamer_id` int DEFAULT NULL,
  `title` NVARCHAR(100) DEFAULT NULL,
  `video_path` varchar(50) DEFAULT NULL,
  `status` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `thumbnail_path` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


Create Table tags(
	id int AUTO_INCREMENT,
    name varchar(30),
	created_at datetime DEFAULT CURRENT_TIMESTAMP,
    Primary Key(id)
);

Create Table options_purchase(
	id int AUTO_INCREMENT,
    quantity int,
    promotion float DEFAULT 1,
    is_active int DEFAULT 1,
	created_at date DEFAULT (CURRENT_DATE),
    Primary Key(id)
);
 
Create Table exchange_currency(
	id int AUTO_INCREMENT,
    currency varchar(10),
    exchange_rate float,
    quantity int,
    is_active int DEFAULT 1,
	created_at date DEFAULT (CURRENT_DATE),
    Primary Key(id)
);

Create Table history_purchase(
	id int AUTO_INCREMENT,
    user_id int,
    token_id int,
    token int,
    amount float,
	created_at datetime DEFAULT CURRENT_TIMESTAMP,
    Primary Key(id)
);

Create Table history_donate(
	id int AUTO_INCREMENT,
    sender_id int,
    receiver_id int,
    token int,
	created_at datetime DEFAULT CURRENT_TIMESTAMP,
    Primary Key(id)
);

Create Table logs(
	id int AUTO_INCREMENT,
    user_id int,
    type_name varchar(50),
    trace varchar(255),
	created_at datetime DEFAULT CURRENT_TIMESTAMP,
    Primary Key (id)
);



