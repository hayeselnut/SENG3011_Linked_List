const functions = require("firebase-functions");
const express = require("express");
// const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();

const app = express();

const errorResponse = (statusCode, errorMessage) => {
    return {
        errorMessage: `${statusCode} ${errorMessage}`,
    };
};

app.get("/", async (req, res) => {
    functions.logger.info(req.query, {structuredData: true});
    let request;
    try {
        functions.logger.info(req.query);
        request = parseQuery(req.query);
    } catch (e) {
        res.status(400).send(errorResponse(400, e.message));
        return;
    }

    functions.logger.info(request, {structuredData: true});
    const snapshot = await admin.firestore().collection("articles").get();

    const articles = [];
    snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();

        articles.push({id, ...data});
    });

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

exports.articles = functions.https.onRequest(app);


// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/*
    app.get("/:id", async (req, res) => {
const snapshot = await admin.firestore().collection(
    'users').doc(req.query.id).get();

        const userId = snapshot.id;
        const userData = snapshot.data();

        res.status(200).send(JSON.stringify({id: userId, ...userData}));
    })

    app.post("/", async (req, res) => {
        const user = req.body;

        await admin.firestore().collection("users").add(user);

        res.status(201).send();
    });

    app.put("/:id", async (req, res) => {
        const body = req.body;

        await admin.firestore().collection('users').d
        oc(req.query.id).update(body);

        res.status(200).send()
    });

    app.delete("/:id", async (req, res) => {
        await admin.firestore().collection("users").doc(req.query.id).delete();

        res.status(200).send();
    })


    // // Create and Deploy Your First Cloud Functions
    // // https://firebase.google.com/docs/functions/write-firebase-functions
    //
    exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
    });

*/
