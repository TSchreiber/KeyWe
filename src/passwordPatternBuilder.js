/*
 * returns {pattern, title} where pattern is a regex pattern string that will match
 * a valid password and title is a string describing the requirements.
 */
function from(requirements) {
    let pattern = [];
    let title = [];
    if (requirements.CONTAINS_SPECIAL) {
        pattern.push(String.raw`(?=.*[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])`);
        title.push(
            "Password must contain at least one of the following, " +
            "\^ \$ \* \. \[ \] \{ \} \( \) \? \" \! \@ \# \% \& \/ \\ \, \> \< \' \: \; \| \_ \~ \` \= \+ \-" +
            ".");
    }
    if (requirements.CONTAINS_UPPER) {
        pattern.push("(?=.*[A-Z])");
        title.push("Password must contain at least one upper case letter.");
    }
    if (requirements.CONTAINS_LOWER) {
        pattern.push("(?=.*[a-z])");
        title.push("Password must contain at least one lower case letter.");
    }
    if (requirements.CONTAINS_DIGIT) {
        pattern.push("(?=.*[0-9])");
        title.push("Password must contain at least one number.");
    }
    pattern.push(`[!-~]{${requirements.MIN_LENGTH},}`);
    title.push(`Password must be at least ${requirements.MIN_LENGTH} characters long.`);

    pattern = pattern.join("");
    title = title.join("\n");

    return {pattern,title};
}

module.exports = { from } ;
