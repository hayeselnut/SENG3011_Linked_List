const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const app = express();

const articlesProcessor = require("./articles/articles");
const response = require("./responses");
const parser = require("./articles/parsers");

app.get("/articles", async (req, res) => {
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
    const articles = await articlesProcessor.getArticles(db, request);

    functions.logger.info("200 OK processed request and returning matching articles");
    res.status(200).send(response.success(articles, "articles"));
});

app.get("/article/:id", async (req, res) => {
    functions.logger.info(`/article received request to get article with id ${req.params.id}`);

    const snapshot = await db.collection("articles").doc(req.params.id).get();
    const articleId = snapshot.id;
    const articleData = snapshot.data();

    if (!articleData) {
        functions.logger.error(`404 NOT FOUND could not find article with id ${req.params.id}`);
        res.status(400).send(response.error(404, `article with id ${req.params.id} not found`));
    } else {
        const article = {id: articleId, ...articleData};
        functions.logger.info(`200 OK processed request and returning article with id ${req.params.id}`);
        res.status(200).send(response.success(article, "article"));
    }
});

exports.api = functions.https.onRequest(app);
