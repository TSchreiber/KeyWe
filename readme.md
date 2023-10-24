# ![](https://github.com/TSchreiber/KeyWe/blob/main/public/logo-64px.png?raw=true) KeyWe - Single Sign-On (SSO) Service

KeyWe is a Single Sign-On (SSO) service that provides user registration, login, and token management for authentication. This README provides an overview of the project structure, key components, and instructions for setting up and running the service.

## Table of Contents

- [Project Structure](#project-structure)
- [Authentication (auth.js)](#authentication-authjs)
- [Controllers (controllers.js)](#controllers-controllersjs)
- [Database (db.js)](#database-dbjs)
- [Server (index.js)](#server-indexjs)
- [API Routes (routes.js)](#api-routes-routesjs)
- [Testing (test/controllers.js)](#testing-controllersjs)
- [Getting Started](#getting-started)
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
