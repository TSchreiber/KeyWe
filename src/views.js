const pwPattern = require("../src/passwordPatternBuilder.js");

function requireRedirectURL(req, res, next) {
    if (!req.query.redirect_url) {
        res.status(400);
        res.send("Missing redirect URL");
    } else {
        next();
    }
}

/**
 *
 */
function renderLogin(_, res) {
    res.render("login");
}

/**
 *
 */
function renderRegister(_, res) {
    let {pattern, title} = pwPattern.from({
        MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH || 8,
        CONTAINS_SPECIAL: process.env.PASSWORD_CONTAINS_SPECIAL || false,
        CONTAINS_UPPER: process.env.PASSWORD_CONTAINS_UPPER || true,
        CONTAINS_LOWER: process.env.PASSWORD_CONTAINS_LOWER || true,
        CONTAINS_DIGIT: process.env.PASSWORD_CONTAINS_DIGIT || true,
    });
    res.render("register", {
        PASSWORD_PATTERN: pattern,
        PASSWORD_TITLE: title
    });
}

module.exports = { requireRedirectURL, renderLogin, renderRegister };
