/* eslint-disable guard-for-in */
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
    if (!("start_date" in queryParams)) throw new Error("'start_date' must not be null");
    const startDate = parseDate("start_date", queryParams.start_date);

    if (!("end_date" in queryParams)) throw new Error("'end_date' must not be null");
    const endDate = parseDate("end_date", queryParams.end_date);

    if (startDate.getTime() > endDate.getTime()) {
        throw new Error(`'end_date' ${endDate} must not be before 'start_date' ${startDate}`);
    }

    let keyTerms;
    if ("key_terms" in queryParams) {
        keyTerms = parseKeyTerms(queryParams.key_terms);
    } else {
        functions.logger.debug("no key terms specified");
        keyTerms = [];
    }

    let location;
    if ("location" in queryParams) {
        location = parseLocation(queryParams.location);
    } else {
        functions.logger.debug("no location specified");
        location = "";
    }

    return {
        startDate: startDate,
        endDate: endDate,
        keyTerms: keyTerms,
        location: location,
    };
};

const parseDate = (field, dateString) => {
    const timestamp = Date.parse(dateString);

    if (isNaN(timestamp)) throw new Error(`'${field}' is an invalid date format`);

    return new Date(timestamp);
};

const parseKeyTerms = (keyTermsString) => {
    if (!keyTermsString) return [];

    const keyTermsArray = keyTermsString.split(",");
    return keyTermsArray
        .map((word) => word.trim().toLowerCase()).filter((word) => word != "");
};

const parseLocation = (locationString) => (locationString.toLowerCase());

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

const filterArticles = (articles, request) => {
    return articles.filter((article) => {
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
    }).filter((article) => {
        // LOCATION : TODO stub
        return true;
    });
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

