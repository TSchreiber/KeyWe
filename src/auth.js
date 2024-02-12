/**
 * @module auth
 * @description Authentication functions for handling JWT tokens.
 */

const jose = require("jose");
const { getPrivateKey, getPublicKeys } = require("./keyManagement");
const HOST = process.env.HOST;

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
 * @param {{email: string}} payload - The payload to include in the token. The
 * email must be included because it will be used as the subject, but everything
 * in the payload object will be included in the token's claims.
 * @returns {string} The generated JWT token.
 */
async function signToken(payload) {
    let key = await getPrivateKey();
    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: key.alg, kid: key.kid })
        .setSubject(payload.email)
        .setIssuedAt()
        .setIssuer(HOST)
        .sign(await jose.importJWK(key));
}

module.exports = { signToken, verifyToken };
