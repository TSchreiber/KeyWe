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
    return new Promise((res,rej) => {
        connection.query('select * from users where email=?', email,
        (err, result, fields) => {
            if (err) rej(err);
            else res(result[0]);
        });
    });
}

module.exports = { connection, connectDB, getUser };
