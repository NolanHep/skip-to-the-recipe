const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const validUrl = require("valid-url");

const app = express();
app.use(require("./serve.js"));

app.get("/", (req, res) => {
    return res.serve("index.html");
});

app.get("/http*://*", (req, res) => {
    return res.serve("index.html");
});

app.post("/api/v1/recipe", async (req, res) => {
    const { url } = req.query;
    
    if (!url) return res.status(400).send({ message: "Something went wrong.", error: "Parameter 'url' is missing" });
    if (!validUrl.isUri(url)) return res.status(400).send({ message: "Invalid URL" });

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const content = await page.content();
        const $ = cheerio.load(content);

        await browser.close();

        const allElements = $("*");

        let elements = [];
        allElements.each((_, element) => {
            const ele = $(element);

            if (ele.prop("tagName") === "H1") {
                elements.push({ name: "title", content: ele.text() });
            } else if (ele.prop("tagName") === "IMG" && /jpg|jpeg/.test(ele.prop("src")?.split(".").slice(-1))) {
                elements.push({ name: "image", content: ele.prop("src") });
            } else if (ele.text().trim().toLowerCase().includes("ingredients") && /H1|H2|H3|H4|H5|H6/.test(ele.prop("tagName"))) {
                elements.push({ name: "ingredientsHeading" });
            } else if (/(instructions|directions|method)/.test(ele.text().trim().toLowerCase()) && /H1|H2|H3|H4|H5|H6/.test(ele.prop("tagName"))) {
                elements.push({ name: "directionsHeading" });
            } else if (/OL|UL/.test(ele.prop("tagName"))) {
                elements.push({ name: "list", content: ele.html() })
            }
        });

        let result = {};

        result.image = elements.filter(element => element.name === "image")[0]?.content;
        result.title = elements.filter(element => element.name === "title")[0]?.content;

        const ingredientsHeadingIndex = elements.findIndex(item => item.name === "ingredientsHeading");
        const ingredients = ingredientsHeadingIndex !== -1 
            ? elements.slice(ingredientsHeadingIndex + 1).find(item => item.name === "list") 
            : null;
        const ingredientsHtml = cheerio.load(ingredients?.content);

        result.ingredients = [];

        ingredientsHtml("li").each((_, element) => {
            result.ingredients.push($(element).text().replaceAll("\n",""));
        });

        const directionsHeadingIndex = elements.findIndex(item => item.name === "directionsHeading");
        const directions = directionsHeadingIndex !== -1 
            ? elements.slice(directionsHeadingIndex + 1).find(item => item.name === "list") 
            : null;
        const directionsHtml = cheerio.load(directions?.content);

        result.directions = [];
    
        directionsHtml("li").each((_, element) => {
            result.directions.push($(element).text().replaceAll("\n","").replace(/<[a-z]+[\s\S]*/i, ""));
        });


        if (!result.title && !result.ingredients && !result.directions) {
            return res.status(400).json({ message: "Sorry, we couldn't get that recipe's details." })
        } else {
            return res.json(result);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Oops, something went wrong while gathering that recipe's details.", error });
    }
});

app.get("/documentation*", (req, res) => {
    return res.serve("documentation.html");
});

app.get("/privacy-policy", (req, res) => {
    return res.serve("privacy-policy.html");
});

app.get("/resources/*", (req, res) => {
    return res.sendFile(path.join(__dirname, "src", req.url));
});

app.get("*", (req, res) => {
    return res.serve("404.html");
});

app.listen(8080, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log("Server is running on http://localhost:8080");
    }
})