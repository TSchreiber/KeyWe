const jose = require("jose");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

/** The number of seconds the private key is valid for, after which the key
 * will be rotated.\
 * Default is 180 days
 **/
const privateKeyTTL = process.env.private_key_TTL | 180 * 24 * 60 * 60;

const alg = "RS256";
const use = "sig";

var privateKey;
var publicKeys = {};

var rotatingKeys;

function rotateKeys() {
    if (rotatingKeys) {
        return rotatingKeys;
    }
    rotatingKeys = new Promise(async (resolve, _) => {
        const kid = uuidv4();
        const keyPair = await jose.generateKeyPair(alg);
        privateKey = Object.assign(
            await jose.exportJWK(keyPair.privateKey),
            {
                alg,
                kid,
                use,
                key_ops: ["sign"],
                cat: Math.floor(Date.now() / 1000)
            }
        );

        let publicKey = Object.assign(
            await jose.exportJWK(keyPair.publicKey),
            {
                alg,
                kid,
                use,
                key_ops: ["verify"],
                cat: Math.floor(Date.now() / 1000)
            }
        );

        publicKeys = {
            ...publicKeys,
            [kid]: publicKey,
        };
        await dumpKeys();

        resolve();
        rotatingKeys = undefined;
    });
    return rotatingKeys;
}

async function dumpKeys() {
    fs.writeFileSync("./keys.json", JSON.stringify(publicKeys));
}

async function loadKeys() {
    try {
        publicKeys = JSON.parse(fs.readFileSync("./keys.json"));
    } catch (e) {
        console.warn("Could not load keys.json, a new file will be created.");
        publicKeys = [];
    }
}

async function getPrivateKey() {
    if (!privateKey || (privateKey.cat + privateKeyTTL) * 1000 <= Date.now()) {
        await rotateKeys();
    }
    return privateKey;
}

async function getPublicKeys() {
    let out = structuredClone(publicKeys);
    for (let kid of Object.keys(out)) {
        delete out[kid].cat;
    }
    return out;
}

loadKeys();

module.exports = { getPrivateKey, getPublicKeys }
