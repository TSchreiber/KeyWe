const pwPattern = require("../src/passwordPatternBuilder.js");

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
        MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH,
        CONTAINS_SPECIAL: process.env.PASSWORD_CONTAINS_SPECIAL,
        CONTAINS_UPPER: process.env.PASSWORD_CONTAINS_UPPER,
        CONTAINS_LOWER: process.env.PASSWORD_CONTAINS_LOWER,
        CONTAINS_DIGIT: process.env.PASSWORD_CONTAINS_DIGIT,
    });
    res.render("register", {
        PASSWORD_PATTERN: pattern,
        PASSWORD_TITLE: title
    });
}

module.exports = { renderLogin, renderRegister };
