const path = require("path");
const fs = require("file-system");

let templates = {};
let folderPath = "./serve-templates";

try {
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);

        if (fs.lstatSync(filePath).isFile()) {
            templates[file.split(".")[0]] = fs.readFileSync(filePath, "utf8");
        }
    });
} catch (error) {
    console.error("Error reading folder:", error);
}

const package = function (req, res, next) {
    res.serve = function (fileName) {
        let file = fs.readFileSync(path.join(__dirname, "src", fileName), "utf8").toString();

        Object.keys(templates).forEach(template => {
            file = file.replace(`{{${template}}}`, templates[template])
        })

        return res.type("text/html").send(file);
    }

    next();
}

module.exports = package;