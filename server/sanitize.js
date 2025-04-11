const bannedChars = [
    "/", "<", ">", "`", "\\", "src", "&lt", "&gt", "\u003c", "\u003e",
    "'", "\"", ";", "(", ")", "{", "}", "[", "]", "|", "&", "%", "$",
    "script", "onerror", "onload", "eval", "javascript:", "document.cookie",
    "alert", "--", "#", "/*", "*/"
];

function sanitizeInput(input) {
    if (typeof input !== "string") return input;
    for (let char of bannedChars) {
        if (new RegExp(char, "gi").test(input)) return;
    }
    return input;
}

module.exports = { sanitizeInput };