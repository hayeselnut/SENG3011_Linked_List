const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const app = express();

const articlesProcessor = require("./articles/articles");
const response = require("./responses");
const parser = require("./articles/parsers");

const logReader = require("./logHelpers/logReader");
const logWriter = require("./logHelpers/logWriter");

app.get("/articles", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);

    functions.logger.info(req);
    let request;
    try {
        functions.logger.info(req.query);
        request = parser.parseQuery(req.query);
    } catch (e) {
        functions.logger.error(`400 BAD REQUEST could not parse request: ${e.message}`);
        const errorResponse = response.error(400, e.message);
        res.status(400).send(errorResponse);
        await logWriter.writeLog(db, req, errorResponse);
        return;
    }
    functions.logger.info(`/articles received request object: ${JSON.stringify(request)}`);

    let articles;
    try {
        articles = await articlesProcessor.getArticles(db, request);
    } catch (e) {
        functions.logger.error(`500 ${e.message}`);
        const errorResponse = response.error(500, e.message);
        res.status(500).send(errorResponse);
        await logWriter.writeLog(db, req, errorResponse);
        return;
    }

    functions.logger.info("200 OK processed request and returning matching articles");
    res.status(200).send(response.success(articles, "articles"));
    await logWriter.writeLog(db, req, {"status": 200});
});

app.get("/article/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);

    functions.logger.info(`/article received request to get article with id ${req.params.id}`);

    const snapshot = await db.collection("articles").doc(req.params.id).get();
    const articleId = snapshot.id;
    const articleData = snapshot.data();

    if (!articleData) {
        functions.logger.error(`404 NOT FOUND could not find article with id ${req.params.id}`);
        const errorResponse = response.error(404, `article with id ${req.params.id} not found`);
        res.status(400).send(errorResponse);
        await logWriter.writeLog(db, req, errorResponse);
        return;
    }

    articleData.date_of_publication = articleData.date_of_publication.toDate();
    const article = {id: articleId, ...articleData};
    functions.logger.info(`200 OK processed request and returning article with id ${req.params.id}`);
    res.status(200).send(response.success(article, "article"));
    await logWriter.writeLog(db, req, {"status": 200});
});

app.get("/logs", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);

    functions.logger.info("/log received request to get logs");
    const logs = await logReader.getLogs(db);
    functions.logger.info("200 OK processed request and returning matching articles");
    res.status(200).send(response.success(logs, "logs"));
    await logWriter.writeLog(db, req, {"status": 200});
});

exports.api = functions.https.onRequest(app);
