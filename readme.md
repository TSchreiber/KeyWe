![](https://github.com/TSchreiber/KeyWe/blob/main/public/logo-text-128px.png?raw=true)
# KeyWe - Single Sign-On (SSO) Service

KeyWe is a Single Sign-On (SSO) service that simplifies user authentication by
offering user registration, login, and token management. KeyWe leverages JSON
Web Tokens (JWT) signed with the RS256 (RSA Signature with SHA-256) algorithm
for secure user authentication.

Single Sign-On (SSO) is achieved by having KeyWe manage user authentication.
When a user accesses a service, they use KeyWe's `POST /login` endpoint to
authenticate the user, and upon successful authentication, KeyWe generates a
JWT containing user information and signs it with the RS256 algorithm. This
signed JWT is then sent to the service. The service can verify the JWT's
authenticity using KeyWe's public key obtained from KeyWe's `GET /public_key`
endpoint, allowing seamless access without the need for the user to log in again.

KeyWe manages keys for you so you do not need to worry about managing keypairs.
Keys are rotated automatically after 180 days by default, but you can adjust
how frequently it rotates keys in the configuration. The public keys will be
stored as long as there is a non-expired refresh token that references it, so
users will not be force logged out when the key is rotated.

## Table of Contents

- [Deploying the Project with docker-compose](#deploying-the-project-with-docker-compose)
- [Using KeyWe's API Endpoints](#using-keywes-api-endpoints)
- [Verifying a Token](#verifying-a-token)
- [Using an Id Token](#using-an-id-token)

## Deploying the Project with docker-compose

1. Clone the repository:

   ```bash
   git clone git@github.com:TSchreiber/KeyWe.git
   ```

2. Run the entire application stack using Docker Compose:

   ```bash
   docker-compose up
   ```

   The MySQL service may need a few minutes to start up. You will know that the service is ready when it logs:

   ```text
   /usr/sbin/mysqld: ready for connections. Version: '8.2.0'  socket: '/var/run/mysqld/mysqld.sock'
   port: 3306  MySQL Community Server - GPL.
   ```

   Note: it will say it is ready for connections earlier, but the port will be `port: 0` so it is not actually ready for use at that time.

## Using KeyWe's API Endpoints

Once you have a KeyWe instance running, you can begin making requests.

To register a new user use the `/register` endpoint.

```js
fetch("<URL-to-your-deployed-KeyWe-instance>/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "<user's email>",
        password: "<user's password>"
    })
})
.then(res => res.json())
.then(tokens => {
    /*
    tokens: {
        id_token: string,
        refresh_token: string
    }
    */
});
```

To login use the `/login` endpoint.

```js
fetch("<URL-to-your-deployed-KeyWe-instance>/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "<user's email>",
        password: "<user's password>"
    })
})
.then(res => res.json())
.then(tokens => {
    /*
    tokens: {
        id_token: string,
        refresh_token: string
    }
    */
});
```

To get a new id token use the `/token` endpoint.

```js
fetch("<URL-to-your-deployed-KeyWe-instance>/token", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        refresh_token: "<user's refresh token>"
    })
})
.then(res => res.json())
.then(tokens => {
    /*
    tokens: {
        id_token: string
    }
    */
)};
```

To revoke a refresh token use the `/revoke` endpoint.

```js
fetch("<URL-to-your-deployed-KeyWe-instance>/revoke", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        refresh_token: "<user's refresh token>"
    })
})
```

To get a public key use the `/public_key` endpoint.

Two query string parameters can be provided:
1. `kid` - required. The id of the key you want.
2. `format` - optional. The desired format for the key.
Valid values are `JWK` and `PEM`. The default is `JWK` if no format is specified.

```bash
curl https://<URL-to-your-deployed-KeyWe-instance>/public_key?kid=<kid>&format=<format> > key_cache/<kid>
```

You are encouraged to cache the public keys. There will be a small number of
keys used to sign all tokens. Furthermore, making a request to KeyWe to verify
every token defeats the purpose of asymmetric signing.

## Verifying a Token

Because KeyWe authentication is based on digital signatures, anyone can verify
a token without needing to make an external requets to KeyWe. To verify the
authenticity of the token, simply check the digital signature and also check
that the token is not expired.

The following example is for a node application, but similar libraries for
verifying tokens exist for other languages. Go has a built-in `jwt` package,
Python has `python-jwt`, Java has `java-jwt`. Whatever language you are using,
check the [Auth0 github account](github.com/auth0) and you will probably find
a JWT package for it.

```js
const jwt = require('jsonwebtoken');
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                reject(err);
                return;
            }
            // The jsonwebtoken module does expiration checking for you, but if
            // you are using some other module to verify the token, make sure
            // the expiration is being checked
            /*
            if (Math.floor(new Date().getTime() / 1000) >= decoded.exp) {
                reject(err);
                return;
            }
            */
            resolve(decoded);
        });
    });
}
```

Note: the public key can be obtained from the `GET /public_key` endpoint with
`PEM` as the specified format. If you are using `jose` you should use the `JWK`
format.

## Using an Id Token

The data in the id token is an un-encrypted based64 string. The `verifyToken`
function in the [Verifying a Token](#verifying-a-token) section returns the
decoded string, but you can also simply decode the string with `atob` or
with `Buffer.from` if you are using node.

```js
let [header, payload, signature] = id_token.split(".");
// Broswer compatible JS
let user_id = JSON.parse(atob(payload, "base64"));
// Node compatible JS
let user_id = JSON.parse(Buffer.from(payload, "base64").toString());
```
