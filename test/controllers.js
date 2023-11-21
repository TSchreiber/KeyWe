require('dotenv').config({path: "../env/test.env" });
const assert = require('assert');
const { verifyToken, publicKey } = require('../src/auth');
const { registerUser, login, getPublicKey, refreshToken } = require('../src/controllers');
const db = require("../src/db");
const { connectDB, connection, getUser } = require('../src/db');
connectDB();

describe('Controllers', () => {

    before(async () => {
        try {
            await connection.promise().query("delete from users where email=?", "test@example.com");
            await connection.promise().query("delete from users where email=?", "login_test_user@example.com");
        } catch (e) {
            console.error(e);
        }
        registerUser({ body: { email: 'login_test_user@example.com', password: 'password' } }, {send: () => {}})
    });

    describe('registerUser', () => {
        it('should return a JWT token upon successful registration', () => {
            return new Promise((resolve, reject) => {
                const req = { body: { email: 'test@example.com', password: 'password' } };
                const res = {
                    send: async (token) => {
                        try {
                            let id_token = await verifyToken(token.id_token);
                            if (!id_token.token_type == "id") {
                                reject("id_token does not have 'id' type");
                            }
                            let refresh_token = await verifyToken(token.refresh_token);
                            if (!refresh_token.token_type == "refresh") {
                                reject("refresh_token does not have 'refresh' type");
                            }
                        } catch (e) {
                            reject(e);
                        }
                        resolve();
                    },
                    sendStatus: async (statusCode) => {
                        reject(new Error("returned status code " + statusCode3));
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
                            let id_token = await verifyToken(token.id_token);
                            if (!id_token.token_type == "id") {
                                reject("id_token does not have 'id' type");
                                return;
                            }
                            let refresh_token = await verifyToken(token.refresh_token);
                            if (!refresh_token.token_type == "refresh") {
                                reject("refresh_token does not have 'refresh' type");
                                return;
                            }
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    },

                    sendStatus: (code) => {
                        reject(new Error("Login returned status code " + code));
                    }
                };
                login(req, res);
            });
        });
    });

    describe('refresh token', () => {
        function loginWithTestUser() {
            return new Promise((resolve, reject) => {
                const req = { body: { email: 'login_test_user@example.com', password: 'password' } };
                const res = { send: (token) => resolve(token) };
                login(req, res);
            });
        };

        it('should return an id token if the provided refresh token is valid', () => {
            return new Promise(async (resolve, reject) => {
                let refresh_token = (await loginWithTestUser()).refresh_token;
                const req = { body: {refresh_token} };
                const res = {
                    send: async (token) => {
                        try {
                            let id_token = await verifyToken(token.id_token);
                            if (!id_token.token_type == "id") {
                                reject("id_token does not have 'id' type");
                                return;
                            }
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    },

                    sendStatus: (code) => {
                        reject(new Error("refreshToken returned status code " + code));
                    }
                };
                refreshToken(req,res);
            });
        });

        it ('should respond with a 403 status code if the token is revoked', () => {
            return new Promise(async (resolve, reject) => {
                let refresh_token = (await loginWithTestUser()).refresh_token;
                let tokenData = await verifyToken(refresh_token);
                db.revokeToken(tokenData.token_id);
                const req = { body: {refresh_token} };
                const res = {
                    send: async (token) => {
                        reject(new Error("refreshToken accepted a revoked token"));
                    },

                    sendStatus: (code) => {
                        if (code == 403) {
                            resolve();
                        } else {
                            reject(new Error("refreshToken returned status code " + code));
                        }
                    }
                };
                refreshToken(req,res);
            });
        });
    });

    describe('public_key', () => {
        it('should return the public key used to sign tokens', () => {
            return new Promise((resolve, reject) => {
                getPublicKey({},{
                    send: (key) => {
                        assert(key == publicKey);
                        resolve();
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
