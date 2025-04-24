const bannedPatterns = [
    /</gi, />/gi, /`/g, /\\/g, /"/g, /'/g, /;/g, /\(/g, /\)/g,
    /\{/g, /\}/g, /\[/g, /\]/g, /\|/g, /%/g, /\$/g,
    /script/gi, /onerror/gi, /onload/gi, /eval/gi, /javascript:/gi,
    /document\.cookie/gi, /alert/gi, /--/g, /#/g, /\/\*/g, /\*\//g
];

function sanitizeInput(input) {
    const check = (str) => {
        if (typeof str !== "string") return false;
        for (let pattern of bannedPatterns) {
            if (pattern.test(str)) return false;
        }
        return true;
    };
    if (Array.isArray(input)) {
        return input.every(check);
    }
    return check(input);
}

module.exports = { sanitizeInput };