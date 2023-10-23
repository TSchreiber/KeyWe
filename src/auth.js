const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync(process.env.private_key_path, 'utf8');
const publicKey = fs.readFileSync(process.env.public_key_path, 'utf8');

function generateToken(payload) {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

module.exports = { generateToken, verifyToken };
