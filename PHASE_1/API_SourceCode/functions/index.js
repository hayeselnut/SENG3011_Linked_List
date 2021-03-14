const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();

const errorResponse = (statusCode, errorMessage) => ({
    errorMessage: `${statusCode} ${errorMessage}`,
});

app.get("/", async (req, res) => {
    functions.logger.info("/articles has been called with request: " + req);
    let request;
    try {
        functions.logger.info(req.query);
        request = parseQuery(req.query);
    } catch (e) {
        res.status(400).send(errorResponse(400, e.message));
        return;
    }

    functions.logger.info(request, {structuredData: true});
    const articles = await getArticles(request);

    res.status(200).send(articles);
});

const parseQuery = (queryParams) => {
    if (!("start_date" in queryParams)) throw new Error("'start_date' must not be null");
    if (!("end_date" in queryParams)) throw new Error("'end_date' must not be null");
    if (!("key_terms" in queryParams)) throw new Error("'key_terms' must not be null");
    if (!("location" in queryParams)) throw new Error("'location' must not be null");

    const startDate = parseDate(queryParams.start_date);
    const endDate = parseDate(queryParams.end_date);

    if (startDate.getTime() > endDate.getTime()) throw new Error(`'end_date' ${endDate} must not be before 'start_date' ${startDate}`);

    return {
        startDate: startDate,
        endDate: endDate,
        keyTerms: queryParams.key_terms.split(","),
        location: queryParams.location,
    };
};

const parseDate = (dateString) => {
    const timestamp = Date.parse(dateString);

    if (isNaN(timestamp)) throw new Error("invalid date format");

    return new Date(timestamp);
};

const getArticles = async (request) => {
    const snapshot = await db.collection("articles").get();

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

const getReports = async (request) => {
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

exports.articles = functions.https.onRequest(app);
