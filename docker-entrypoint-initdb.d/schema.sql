CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `hashedPassword` varchar(100) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tokens` (
  `token_id` VARCHAR(255) NOT NULL,
  `exp` BIGINT NOT NULL,
  `revoked` TINYINT NOT NULL default '0',
  PRIMARY KEY (`token_id`),
  INDEX `EXP` (`exp` ASC) VISIBLE);
