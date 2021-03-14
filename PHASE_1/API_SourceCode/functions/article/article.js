/* eslint-disable guard-for-in */
const functions = require("firebase-functions");
const express = require("express");
// const admin = require("firebase-admin");
const response = require("../responses");

// admin.initializeApp();
// const db = admin.firestore();

const app = express();

app.get("/", async (req, res) => {
    res.status(200).send(response.success({"dummy": "article"}, "article"));
});

exports.app = functions.https.onRequest(app);
