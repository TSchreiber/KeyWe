/**
 * @module db
 * @description Database connection and operations.
 */

const mysql = require('mysql2');

/**
 * Represents a connection to the MySQL database.
 *
 * @type {Object}
 */
const connection = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
});

/**
 * Establishes a connection to the database.
 */
function connectDB() {
  connection.connect();
}

/**
 * Retrieves user information by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the user information.
 * @throws {Error} Throws an error if the database query fails.
 */
async function getUser(email) {
    try {
        let [result] = await connection.promise().query('select * from users where email=?', email);
        return result[0];
    } catch (err) {
        throw err;
    }
}

async function createToken(token) {
    await connection.promise().query(
        "insert into tokens set ?",
        { token_id: token.token_id, exp: token.exp } );
}

async function getToken(token_id) {
    let [result] = await connection.promise().query(
        "select * from tokens where token_id=?", token_id);
    return result[0];
}

async function isTokenRevoked(token_id) {
    let [result] = await connection.promise().query(
        "select * from tokens where token_id=?", token_id);
    return !!result[0].revoked;
}

async function revokeToken(token_id) {
    await connection.promise().query(
        "update tokens set revoked=true where token_id=?", token_id);
}

module.exports = {
    connection,
    connectDB,
    getUser,
    createToken,
    getToken,
    isTokenRevoked,
    revokeToken,
};
