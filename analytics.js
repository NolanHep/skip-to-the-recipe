const path = require("path");
const fs = require("file-system");

const package = function(req, res, next) {
    let url = req.path;
    if (!url.startsWith("/resources")) {
        const analytics = JSON.parse(fs.readFileSync(path.join(__dirname, "analytics.json"), "utf8"));
        
        let page;
        let referral = req.headers.referrer || req.headers.referer || "unknown";

        if (url === "/") {
            page = "/";
            referral = "/";
        } else if (/^\/https?:\/\/.*/.test(url)) {
            page = "scrape";
        } else if (url === "/api/v1/recipe") {
            if (req.headers.origin && req.headers.origin.includes(req.headers.host)) {
                return next();
            }

            page = "/api/v1/recipe";
        } else if (url.startsWith("/documentation")) {
            page = "documentation";
        } else {
            page = "unknown";
        }

        analytics[page] = analytics[page] ?? {};
        analytics[page][referral] = analytics[page][referral] ?? 0;
        
        analytics[page][referral]++;    

        fs.writeFileSync(path.join(__dirname, "analytics.json"), JSON.stringify(analytics, null, 2),  "utf8")
    }
    
    next();
}

module.exports = package;