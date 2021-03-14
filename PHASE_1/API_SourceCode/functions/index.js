const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();

app.get("/", async (req, res) => {
    let request;
    try {
        functions.logger.info(req.query);
        request = parseQuery(req.query);
    } catch (e) {
        functions.logger.error(`400 BAD REQUEST could not parse request: ${e.message}`);
        res.status(400).send(errorResponse(400, e.message));
        return;
    }
    functions.logger.info(`/articles received request object: ${JSON.stringify(request)}`);
    const articles = await getArticles(request);

    functions.logger.info("200 OK processed request and returning matching articles");
    res.status(200).send(successResponse(articles, "articles"));
});

const parseQuery = (queryParams) => {
    const queryFields = ["start_date", "end_date", "key_terms", "location"];
    for (const field of queryFields) {
        if (!(field in queryParams)) throw new Error(`'${field}' must not be null`);
    }

    const startDate = parseDate("start_date", queryParams.start_date);
    const endDate = parseDate("end_date", queryParams.end_date);

    if (startDate.getTime() > endDate.getTime()) {
        throw new Error(`'end_date' ${endDate} must not be before 'start_date' ${startDate}`);
    }

    return {
        startDate: startDate,
        endDate: endDate,
        keyTerms: queryParams.key_terms.split(","),
        location: queryParams.location,
    };
};

const parseDate = (field, dateString) => {
    const timestamp = Date.parse(dateString);

    if (isNaN(timestamp)) throw new Error(`'${field}' is an invalid date format`);

    return new Date(timestamp);
};

const getArticles = async (request) => {
    functions.logger.info("retrieving articles");
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

const errorResponse = (statusCode, errorMessage) => ({
    errorMessage: `${statusCode} ${errorMessage}`,
});

const successResponse = (response, responseField) => {
    const successResponse = {
        "log": {
            "team": "SENG3011_LINKED_LIST",
            "time_accessed": new Date(Date.now()).toISOString(),
        },
    };
    successResponse[responseField] = response;
    return successResponse;
};

exports.articles = functions.https.onRequest(app);

