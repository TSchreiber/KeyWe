/**
 * @module auth
 * @description Authentication functions for handling JWT tokens.
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');

/**
 * The private key used for token generation.
 *
 * @type {string}
 */
const privateKey = fs.readFileSync(process.env.private_key_path, 'utf8');

/**
 * The public key used for token verification.
 *
 * @type {string}
 */
const publicKey = fs.readFileSync(process.env.public_key_path, 'utf8');

/**
 * Reads a private key from a file and uses it to generate a JWT token.
 *
 * @param {Object} payload - The payload to include in the token.
 * @returns {string} The generated JWT token.
 */
function generateToken(payload) {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Verifies a JWT token using a public key.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<Object>} A promise that resolves with the decoded payload if the token is valid.
 * @throws {Error} Throws an error if the token is invalid or cannot be verified.
 */
async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }
            if (Math.floor(new Date().getTime() / 1000) >= decoded.exp) {
                reject(err);
                return;
            }
            resolve(decoded);
        });
    });
}

module.exports = { generateToken, verifyToken, publicKey };
