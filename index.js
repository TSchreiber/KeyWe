require('dotenv').config();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

const connection = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
});
connection.connect();

const privateKey = fs.readFileSync(process.env.private_key_path, 'utf8');
const publicKey = fs.readFileSync(process.env.public_key_path, 'utf8');

function generateToken(payload) {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

async function verifyToken(token) {
    return new Promise((res,rej) => {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) rej(err);
            else res(decoded);
        });
    });
}

async function registerUser(userData) {
    return new Promise((res,rej) => {
        let salt = bcrypt.genSaltSync(saltRounds);
        console.log(userData, salt);
        let hashedPassword = bcrypt.hashSync(userData.password, salt);
        connection.query('INSERT INTO users SET ?', {
            email: userData.email,
            hashedPassword
        }, 
        (err, result) => {
            if (err) rej(err);
            else res(result);
        });
    });
}

async function getUser(email) {
    return new Promise((res,rej) => {
        console.log("Email:",email);
        connection.query('select * from users where email=?', email,
        (err, result, fields) => {
            if (err) rej(err);
            else res(result[0]);
        });
    });}

async function login(userData) {
    return new Promise(async (res,rej) => {
        let user = await getUser(userData.email);
        if (bcrypt.compareSync(userData.password, user.hashedPassword)) {
            delete user.hashedPassword;
            let token = generateToken(user);
            res(token);
        } else {
            rej();
        }
    });
}

const express = require('express');
const app = express();

//app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());

app.get("/public_key", (req, res) => {
    res.send(publicKey);
});

app.post("/register", async (req,res) => {
    console.log(req.body);
    try {
        await registerUser(req.body);
        res.send();
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

app.post("/login", async (req, res) => {
    try {
        console.log(req.body);
        let token = await login(req.body);
        res.send(token);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/*  HTTPS version will not work unless I have a CA signed cert
// Start the server
const https = require("https");
const cert_private_key = fs.readFileSync("cert-private_key.pem", "utf8");
const certificate = fs.readFileSync("cert.pem", "utf8");
console.log(cert_private_key, certificate);
const port = process.env.PORT || 8080;
https.createServer({
    key: cert_private_key,
    cert: certificate
}, app).listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// http server that redirects traffic to https
const http = require('http');
const httpApp = express();

httpApp.get('*', (req, res) => {
  res.redirect('https://' + req.headers.host + req.url);
});

const httpServer = http.createServer(httpApp);
httpServer.listen(80);
*/
