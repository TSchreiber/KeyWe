/**
 * @module controllers
 * @description Controllers for handling user registration, login, and public key retrieval.
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require("./db");
const { connection, getUser } = require('./db');
const { signToken, publicKey, verifyToken } = require('./auth');
const { getPublicKeys } =  require("./keyManagement.js");
const jose = require("jose");

const saltRounds = 10;
/**
 * The time (in seconds) the id token should remain valid for. \
 * Can be configured by setting the `id_token_TTL` environment variable. \
 * Default: 5 minutes
 **/
const idTokenTTL = process.env.id_token_TTL | 5 * 60;
/**
 * The time (in seconds) the refresh token should remain valid for. \
 * Can be configured by setting the `refresh_token_TTL` environment variable. \
 * Default: 30 days
 **/
const refreshTokenTTL = process.env.refresh_token_TTL | 30 * 24 * 60 * 60;

const pwPattern = require("./passwordPatternBuilder.js");
function passwordMeetsMinimumPasswordRequirements(password) {
    let {pattern} = pwPattern.from({
        MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH | 8,
        CONTAINS_SPECIAL: process.env.PASSWORD_CONTAINS_SPECIAL | true,
        CONTAINS_UPPER: process.env.PASSWORD_CONTAINS_UPPER | true,
        CONTAINS_LOWER: process.env.PASSWORD_CONTAINS_LOWER | true,
        CONTAINS_DIGIT: process.env.PASSWORD_CONTAINS_DIGIT | true,
    });
    if (!password.match(pattern)) {
        return false;
    } else {
        return true;
    }
}

/**
 * Registers a new user and returns a JWT token upon success.
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends a JWT token as a response or an error status.
 */
async function registerUser(req, res) {
    try {
        if (!passwordMeetsMinimumPasswordRequirements(req.body.password)) {
            res.sendStatus(400);
            return;
        }
        let salt = bcrypt.genSaltSync(saltRounds);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        connection.query('INSERT INTO users SET ?', {
            email: req.body.email,
            hashedPassword
        }, (err, result) => {
            if (err) {
                throw err;
            } else {
                login(req,res);
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
        let userData = await db.getUser(req.body.email);
        let passwordsMatch = bcrypt.compareSync(
            req.body.password, userData.hashedPassword);
        if (passwordsMatch) {
            delete userData.hashedPassword;

            let idTokenPayload = structuredClone(userData);
            idTokenPayload.token_type = "id";
            idTokenPayload.exp = Math.floor(new Date().getTime() / 1000) + idTokenTTL;
            let id_token = await signToken(idTokenPayload);

            let refreshTokenPayload = {
                email: userData.email,
                token_type: "refresh",
                exp: Math.floor(new Date().getTime() / 1000) + refreshTokenTTL,
                token_id: uuidv4()
            };
            let refresh_token = await signToken(refreshTokenPayload);
            // add the token to the database
            await db.createToken(refreshTokenPayload);

            res.send({id_token, refresh_token});
        } else {
            res.sendStatus(403);
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
}

/**
 * Verifies the refresh token and then returns a new id token
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends a JWT token as a response or an error status.
 */
async function refreshToken(req, res) {
    try {
        if (!req.body.refresh_token) {
            res.sendStatus(401);
            return;
        }

        let tokenData;
        try {
            tokenData = await verifyToken(req.body.refresh_token);
        } catch (_) {
            res.sendStatus(403);
            return;
        }
        if (await db.isTokenRevoked(tokenData.token_id)) {
            res.sendStatus(403);
            return;
        }
        let userData = await db.getUser(tokenData.email);
        delete userData.hashedPassword;
        let idTokenPayload = userData;
        idTokenPayload.token_type = "id";
        idTokenPayload.exp = Math.floor(new Date().getTime() / 1000) + idTokenTTL;
        let id_token = await signToken(idTokenPayload);
        res.send({id_token});
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
}

async function revokeToken(req, res) {
    try {
        if (!req.body.refresh_token) {
            res.sendStatus(401);
            return;
        }
        let tokenData;
        try {
            tokenData = await verifyToken(req.body.refresh_token);
        } catch (_) {
            res.sendStatus(403);
            return;
        }
        await db.revokeToken(tokenData.token_id);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
}

var publicKeys = {};
/**
 * Retrieves the public key specified in the query, or the full JWKs if a kid
 * is not provided.
 *
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} No direct return value, but sends the public key as a response or an error status.
 */
async function getPublicKey(req, res) {
    let kid = req.query.kid;
    if (!kid) {
        if (Object.keys(publicKeys).length == 0) {
            publicKeys = await getPublicKeys();
        }
        res.send({ keys: Object.values(publicKeys) });
        return;
    }
    if (!publicKeys[kid]) {
        publicKeys = await getPublicKeys();
    }
    if (!publicKeys[kid]) {
        res.sendStatus(404);
    } else {
        let key = publicKeys[kid];
        if (req.query.format == "PEM") {
            res.send(
                await jose.exportSPKI(
                await jose.importJWK(key)));
        } else {
            res.send(key);
        }
    }
}

module.exports = { registerUser, login, refreshToken, revokeToken, getPublicKey };
