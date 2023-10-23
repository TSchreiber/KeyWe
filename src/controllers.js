/**
 * @module controllers
 * @description Controllers for handling user registration, login, and public key retrieval.
 */

const bcrypt = require('bcrypt');
const { connection, getUser } = require('./db');
const { generateToken } = require('./auth');

const saltRounds = 10;

/**
 * Registers a new user and returns a JWT token upon success.
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends a JWT token as a response or an error status.
 */
async function registerUser(req, res) {
    try {
        let salt = bcrypt.genSaltSync(saltRounds);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        connection.query('INSERT INTO users SET ?', {
            email: req.body.email,
            hashedPassword
        }, (err, result) => {
            if (err) {
                throw err;
            } else {
                delete req.body.password;
                let token = generateToken(req.body);
                res.send(token);
            }
        });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
}

/**
 * Logs in a user and returns a JWT token upon successful authentication.
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends a JWT token as a response or an error status.
 */
async function login(req, res) {
    try {
        let userData = await getUser(req.body.email);
        let passwordsMatch = bcrypt.compareSync(
            req.body.password, userData.hashedPassword);
        if (passwordsMatch) {
            delete userData.hashedPassword;
            let token = generateToken(userData);
            res.send(token);
        } else {
            res.sendStatus(403);
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } 
}

/**
 * Retrieves the public key used for token verification.
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends the public key as a response or an error status.
 */
function getPublicKey(req, res) {
    res.send(publicKey);
}

module.exports = { registerUser, login, getPublicKey };
