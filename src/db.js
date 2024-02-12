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
const connection = mysql.createPool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name,
    waitForConnections: true,
    connectionLimit: 1,
    maxIdle: 1,
    idleTimeout: 60000
});

/**
 * Retrieves user information by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the user information.
 * @throws {Error} Throws an error if the database query fails.
 */
async function getUser(email) {
    try {
        let userDataQuery = connection.promise().query('select * from users where email=?', email);
        let userRolesQuery = connection.promise().query('select * from users_roles where email=?', email);
        let [userDataResult] = await userDataQuery;
        let [userRolesResult] = await userRolesQuery;
        let userData = userDataResult[0];
        let userRoles = userRolesResult.map(x=>x.role);
        userData.roles = userRoles;
        return userData;
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
    getUser,
    createToken,
    getToken,
    isTokenRevoked,
    revokeToken,
};
