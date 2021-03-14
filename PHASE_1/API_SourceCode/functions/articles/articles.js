/* eslint-disable guard-for-in */
const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const response = require("../responses");
const parser = require("./parsers");

admin.initializeApp();
const db = admin.firestore();

const app = express();

app.get("/", async (req, res) => {
    let request;
    try {
        functions.logger.info(req.query);
        request = parser.parseQuery(req.query);
    } catch (e) {
        functions.logger.error(`400 BAD REQUEST could not parse request: ${e.message}`);
        res.status(400).send(response.error(400, e.message));
        return;
    }
    functions.logger.info(`/articles received request object: ${JSON.stringify(request)}`);
    const articles = await getArticles(request);

    functions.logger.info("200 OK processed request and returning matching articles");
    res.status(200).send(response.success(articles, "articles"));
});

const getArticles = async (request) => {
    functions.logger.info(`retrieving articles between ${request.startDate} and ${request.endDate}`);
    const snapshot = await db.collection("articles")
        .where("date_of_publication", ">=", request.startDate)
        .where("date_of_publication", "<=", request.endDate)
        .get();

    const articles = await extractArticlesFromSnapshot(snapshot, request);
    const filteredArticles = filterArticles(articles, request);
    return filteredArticles;
};

const extractArticlesFromSnapshot = async (snapshot, request) => {
    const reports = await getReports(request);
    const articles = [];
    snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        const article = {id, ...data};
        article.reports = [...reports];
        article.date_of_publication = article.date_of_publication.toDate();
        articles.push(article);
    });

    return articles;
};

const filterArticles = (articles, request) => (
    articles.filter((article) => isArticleInPeriodOfInterest(article, request))
        .filter((article) => isKeyTermInArticle(article, request))
        .filter((article) => {
            // LOCATION : TODO stub
            return true;
        })
);

const isArticleInPeriodOfInterest = (article, request) => {
    if (!request.wildcardedDate) return true;

    const dateString = article.date_of_publication.toISOString();
    const dateToMatch = dateString.replace("T", " ").substring(0, dateString.length - 5);
    return isDateMatchedWithWildcards(dateToMatch.trim(), request.wildcardedDate.trim());
};

const isDateMatchedWithWildcards = (dateString, wildcardedDate) => {
    functions.logger.info(`comparing ${dateString} and ${wildcardedDate}`);

    if (dateString.length !== wildcardedDate.length) {
        throw new Error(`date string ${dateString} (${dateString.length}) is different length to ${wildcardedDate} (${wildcardedDate.length})`);
    }

    for (let i = 0; i < dateString.length; i++) {
        if (wildcardedDate[i] === "x") continue;
        if (dateString[i] !== wildcardedDate[i]) return false;
    }

    return true;
};

const isKeyTermInArticle = (article, request) => {
    // KEY TERMS (results must satisfy ALL key terms)
    if (request.keyTerms.length === 0) return true;

    for (const keyTerm of request.keyTerms) {
        if (article.url.toLowerCase().includes(keyTerm)) {
            functions.logger.debug(`key term '${keyTerm}' found in url`);
            continue;
        }
        if (article.headline.toLowerCase().includes(keyTerm)) {
            functions.logger.debug(`key term '${keyTerm}' found in headline`);
            continue;
        }
        if (article.main_text.toLowerCase().includes(keyTerm)) {
            functions.logger.debug(`key term '${keyTerm}' found in main_text`);
            continue;
        }
        if (isKeyTermInReports(article.reports, keyTerm)) {
            continue;
        }
        functions.logger.debug(`key term '${keyTerm}' not found in this article`);
        return false;
    }
    return true;
};

const isKeyTermInReports = (reports, keyTerm) => {
    // returns TRUE if any report contains key term
    for (const report of reports) {
        for (const disease of report.diseases) {
            if (disease.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in diseases`);
                return true;
            }
        }

        for (const syndrome of report.syndromes) {
            if (syndrome.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in syndrome`);
                return true;
            }
        }
    }
    return false;
};

const getReports = async (request) => {
    functions.logger.info("retrieving reports");
    const snapshot = await db.collection("reports").get();

    const reports = [];
    snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        const report = {id, ...data};
        report.event_date = report.event_date.toDate();
        reports.push(report);
    });

    return reports;
};

exports.app = functions.https.onRequest(app);
