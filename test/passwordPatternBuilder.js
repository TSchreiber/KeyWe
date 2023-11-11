const assert = require('assert');
const pwPattern = require("../src/passwordPatternBuilder.js");

describe ("password pattern builder", () => {
    it ("minimum length", () => {
        let res;
        res = pwPattern.from({
            MIN_LENGTH: 8
        });
        assert.match(res.pattern, /[!-~]\{8,\}/);

        res = pwPattern.from({
            MIN_LENGTH: 12
        });
        assert.match(res.pattern, /[!-~]\{12,\}/);
    });

    it ("contains special character", () => {
        let res;
        res = pwPattern.from({
            CONTAINS_SPECIAL: true
        });
        assert.match(res.pattern, /(?=.*[\^\$\*\.\[\]\{\}\(\)\?\"\!\@\#\%\&\/\\\,\>\<\'\:\;\|\_\~\`\=\+\-])/);
        assert.match(res.title, /\^ \$ \* \. \[ \] \{ \} \( \) \? \" \! \@ \# \% \& \/ \\ \, \> \< \' \: \; \| \_ \~ \` \= \+ \-/);
    });
});
