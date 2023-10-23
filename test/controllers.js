require('dotenv').config({path: "../env/test.env" });
const assert = require('assert');
const { verifyToken, publicKey } = require('../src/auth');
const { registerUser, login, getPublicKey } = require('../src/controllers');
const { connectDB, connection, getUser } = require('../src/db');
connectDB();

describe('Controllers', () => {

    before((done) => {
        registerUser({ body: { email: 'login_test_user@example.com', password: 'password' } }, {send: () => {}})
        .then(done);
    });

    describe('registerUser', () => {
        it('should return a JWT token upon successful registration', () => {
            return new Promise((resolve, reject) => {
                const req = { body: { email: 'test@example.com', password: 'password' } };
                const res = { 
                    send: async (token) => {
                        let tokenData = await verifyToken(token);
                        assert(typeof token === 'string');
                        resolve();
                    },
                    sendStatus: async (statusCode) => {
                        console.error(`registerUser: statusCode="${statusCode}"`);
                        assert(false);
                        resolve();
                    }
                };
                registerUser(req, res);
            });
        });
    });

    describe('login', () => {
        it('should return a valid JWT token upon successful login', () => {
            return new Promise((resolve, reject) => {
                const req = { body: { email: 'login_test_user@example.com', password: 'password' } };
                const res = { 
                    send: async (token) => {
                        try {
                            await verifyToken(token);
                        } catch (e) {
                            assert(false);
                        }
                        resolve();
                    },

                    sendStatus: (code) => {
                        reject(new Error("Login returned status code " + code));
                    }
                };
                login(req, res);
            });
        });
    });

    describe('public_key', () => {
        it('should return the public key used to sign tokens', () => {
            return new Promise((resolve, reject) => {
                getPublicKey({},{
                    send: (key) => {
                        assert(key == publicKey);
                    },
                    sendStatus: (statusCode) => {
                        reject(new Error("Responded with status code " + statusCode));
                    }
                });
            });
        });
    });

    after(async () => {
        try {
            await connection.promise().query("delete from users where email=?", "test@example.com");
            await connection.promise().query("delete from users where email=?", "login_test_user@example.com");
        } catch (e) {
            console.error(e);
        }
        connection.destroy();
    });
});
