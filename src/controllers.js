const bcrypt = require('bcrypt');
const { connection, getUser } = require('./db');
const { generateToken } = require('./auth');

const saltRounds = 10;

async function registerUser(req, res) {
    try {
        let salt = bcrypt.genSaltSync(saltRounds);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        connection.query('INSERT INTO users SET ?', {
            email: req.body.email,
            hashedPassword
        }, (err, result) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                delete result.hashedPassword;
                let token = generateToken(result);
                res.send(token);
            }
        });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
}

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

function getPublicKey(req, res) {
    res.send(publicKey);
}

module.exports = { registerUser, login, getPublicKey };
