/**
 * @module routes
 * @description Defines the API routes and their associated controllers.
 */

const express = require('express');
const router = express.Router();
const { registerUser, login, getPublicKey } = require('./controllers');
const { renderLogin, renderRegister } = require("./views");

/**
 * @module routes
 * @name GET /public_key
 * @function
 * @group Public Key - Operations for managing the public key
 * @returns {string} 200 - The public key
 * @returns {Error} 500 - Internal server error
 */
router.get('/public_key', getPublicKey);

/**
 * @module routes
 * @name POST /register
 * @function
 * @group User - Operations for user registration
 * @param {Object} req.body - User registration data.
 * @returns {string} 200 - A JWT token upon successful registration.
 * @returns {Error} 500 - Internal server error
 */
router.post('/register', registerUser);

/**
 * @module routes
 * @name POST /login
 * @function
 * @group User - Operations for user login
 * @param {Object} req.body - User login credentials.
 * @returns {string} 200 - A JWT token upon successful login.
 * @returns {number} 403 - Forbidden if login fails.
 * @returns {Error} 500 - Internal server error
 */
router.post('/login', login);

/**
 *
 */
router.get('/login', renderLogin);

/**
 *
 */
router.get('/register', renderRegister);

module.exports = router;
