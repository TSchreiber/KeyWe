/**
 * @module auth
 * @description Authentication functions for handling JWT tokens.
 */

const jose = require("jose");
const { getPrivateKey, getPublicKeys } = require("./keyManagement");

var publicKeys = {};
/**
 * Verifies a JWT token using a public key.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<Object>} A promise that resolves with the decoded payload if the token is valid.
 * @throws {Error} Throws an error if the token is invalid or cannot be verified.
 */
async function verifyToken(token) {
    let header = jose.decodeProtectedHeader(token);
    let key = publicKeys[header.kid];
    if (!key) {
        publicKeys = await getPublicKeys();
    }
    key = publicKeys[header.kid];
    if (!key) {
        throw new Error("Unkown key");
    }
    const { payload } = await jose.jwtVerify(
        token, await jose.importJWK(key));
    return payload;
}

/**
 * Retreives the privte key from the key manager and uses it to sign a token.
 *
 * @param {Object} payload - The payload to include in the token.
 * @returns {string} The generated JWT token.
 */
async function signToken(payload) {
    let key = await getPrivateKey();
    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: key.alg, kid: key.kid })
        .setIssuedAt()
        .sign(await jose.importJWK(key));
}

module.exports = { signToken, verifyToken };
