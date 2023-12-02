USE `keywe`;

CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `hashedPassword` varchar(100) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tokens` (
  `token_id` varchar(255) NOT NULL,
  `exp` bigint NOT NULL,
  `revoked` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`token_id`),
  KEY `EXP` (`exp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
