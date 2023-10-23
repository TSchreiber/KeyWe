const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
});

function connectDB() {
  connection.connect();
}

async function getUser(email) {
    try {
        let [result] = await connection.promise().query('select * from users where email=?', email);
        return result[0];
    } catch (err) {
        throw err;
    }
}

module.exports = { connection, connectDB, getUser };
