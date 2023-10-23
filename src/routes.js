const express = require('express');
const router = express.Router();
const { registerUser, login, getPublicKey } = require('./controllers');

router.get('/public_key', getPublicKey);
router.post('/register', registerUser);
router.post('/login', login);

module.exports = router;
