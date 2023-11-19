![](https://github.com/TSchreiber/KeyWe/blob/main/public/logo-text-128px.png?raw=true) 
# KeyWe - Single Sign-On (SSO) Service

KeyWe is a Single Sign-On (SSO) service that simplifies user authentication by 
offering user registration, login, and token management. KeyWe leverages JSON 
Web Tokens (JWT) signed with the RS256 (RSA Signature with SHA-256) algorithm 
for secure user authentication.

Single Sign-On (SSO) is achieved by having KeyWe manage user authentication. 
When a user accesses a service, they use KeyWe's `POST /login` endpoint to 
authenticate the user, and upon successful authentication, KeyWe generates a
JWT containing user information and signs it with the RS256 algorithm. This 
signed JWT is then sent to the service. The service can verify the JWT's 
authenticity using KeyWe's public key obtained from KeyWe's `GET /public_key` 
endpoint, allowing seamless access without the need for the user to log in again.

## Table of Contents

- [Project Structure](#project-structure)
- [Authentication (auth.js)](#authentication-authjs)
- [Controllers (controllers.js)](#controllers-controllersjs)
- [Database (db.js)](#database-dbjs)
- [Server (index.js)](#server-indexjs)
- [API Routes (routes.js)](#api-routes-routesjs)
- [Testing (test/controllers.js)](#testing-controllersjs)
- [Getting Started](#getting-started)
- [Running the Project with docker-compose](#Running-the-Project-with-docker-compose)
- [Dependencies](#dependencies)

## Project Structure

### Authentication (auth.js)

- The `auth` module handles JWT token generation and verification.
- It reads private and public keys from files provided as environment variables and exports functions for token generation and verification and also exports the public key used for signing tokens.

### Controllers (controllers.js)

- The controllers are responsible for handling user registration, login, and providing the public key used for token verification.
- `registerUser`: Registers a new user and returns a JWT token upon success.
- `login`: Logs in a user and returns a JWT token upon successful authentication.
- `getPublicKey`: Retrieves the public key used for token verification.

### Database (db.js)

- The `db` module establishes a connection to the database and provides a function to get user information.

### Server (index.js)

- The main entry point for the Express.js server.
- Initializes the server, connects to the database, and defines routes.

### API Routes (routes.js)

- Defines API routes and associates them with controllers.
- Routes include user registration, login, and public key retrieval.

## Getting Started

1. Clone the repository:

   ```bash
   git clone git@github.com:TSchreiber/KeyWe.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following environment variables:

   ```env
   db_host=<your-database-host>
   db_user=<your-database-username>
   db_pass=<your-database-password>
   db_name=<your-database-name>
   private_key_path=<path-to-private-key-file>
   public_key_path=<path-to-public-key-file>
   PORT=<port-number>
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Access the API routes at `http://localhost:<PORT>/` 

## Running the Project with docker-compose

1. Clone the repository:

   ```bash
   git clone git@github.com:TSchreiber/KeyWe.git
   ```

2. Create an RSA keypair with `openssl` or any other program capable of generating RSA keypairs:

   ```bash
   openssl genrsa -out private_key.pem 2048
   openssl rsa -in private_key.pem -pubout -out public_key.pem
   ```

3. Run your entire application stack using Docker Compose:

   ```bash
   docker-compose up
   ```

   The MySQL service may need a few minutes to start up. You will know that the service is ready when it logs:
   
   ```text
   /usr/sbin/mysqld: ready for connections. Version: '8.2.0'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server - GPL.
   ```

   Note: it will say it is ready for connections earlier, but the port will be `port: 0` so it is not actually ready for use at that time.

## Dependencies

KeyWe uses several Node.js libraries and packages. Here are the main dependencies:

- `bcrypt`: For password hashing and validation.
- `cors`: For handling Cross-Origin Resource Sharing.
- `dotenv`: For loading environment variables from a `.env` file.
- `express`: The web framework for building the API server.
- `jsonwebtoken`: For JWT token generation and verification.
- `mysql2`: A MySQL client for database operations.
- `mocha`: A testing framework for running test cases.

All required dependencies can be installed using `npm install` as mentioned in the "Getting Started" section.
