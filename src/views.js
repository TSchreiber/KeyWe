/**
 *
 */
function renderLogin(_, res) {
    let pattern = "(?=.*\d)(?=.*[\W_]).{7,}";
    let title = "Minimum of 7 characters. Should have a least one special character and one number.";
    res.render("login", {PASSWORD_PATTERN: pattern, PASSWORD_TITLE: title});
}

/**
 *
 */
function renderRegister(req, res) {
}

module.exports = { renderLogin, renderRegister };
