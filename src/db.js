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

module.exports = { connection, connectDB, getUser };
