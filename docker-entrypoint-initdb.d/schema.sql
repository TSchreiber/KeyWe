CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `hashedPassword` varchar(100) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
