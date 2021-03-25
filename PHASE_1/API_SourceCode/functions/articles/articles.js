/* eslint-disable guard-for-in */
const functions = require("firebase-functions");

const getArticles = async (db, request) => {
    functions.logger.debug(`retrieving articles between ${request.startDate} and ${request.endDate}`);
    const snapshot = await db.collection("articles")
        .where("date_of_publication", ">=", request.startDate)
        .where("date_of_publication", "<=", request.endDate)
        .get();

    const articles = await extractArticlesFromSnapshot(snapshot);
    const filteredArticles = filterArticles(articles, request);
    return filteredArticles;
};

const extractArticlesFromSnapshot = async (snapshot) => {
    const articles = [];
    snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        const article = {id, ...data};
        article.date_of_publication = article.date_of_publication.toDate();
        for (const report of article.reports) {
            report.event_date = report.event_date.toDate();
            delete report.id;
        }
        articles.push(article);
    });

    return articles;
};

const filterArticles = (articles, request) => (
    articles.filter((article) => isArticleInPeriodOfInterest(article, request))
        .filter((article) => isKeyTermInArticle(article, request))
        .filter((article) => isLocationInArticle(article, request))
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
        throw new Error(`date string ${dateString} is different length to ${wildcardedDate}`);
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
        const excludeKeyTerm = keyTerm.includes("!");

        if (excludeKeyTerm) {
            const unbangedKeyTerm = keyTerm.replace("!", "");
            if (article.headline.toLowerCase().includes(unbangedKeyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in headline of article ${article.id}`);
                return false;
            }
            if (article.main_text.toLowerCase().includes(unbangedKeyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in main_text of article ${article.id}`);
                return false;
            }
            if (isKeyTermInReports(article.reports, unbangedKeyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in reports of article ${article.id}`);
                return false;
            }
            functions.logger.debug(`key term '${keyTerm}' not found in this article of article ${article.id}`);
            continue;
        } else {
            if (article.headline.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in headline of article ${article.id}`);
                continue;
            }
            if (article.main_text.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in main_text of article ${article.id}`);
                continue;
            }
            if (isKeyTermInReports(article.reports, keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in reports of article ${article.id}`);
                continue;
            }
            functions.logger.debug(`key term '${keyTerm}' not found in article ${article.id}`);
            return false;
        }
    }
    functions.logger.debug(`keyTerms matched in article ${article.id}`);
    return true;
};

const isKeyTermInReports = (reports, keyTerm) => {
    // returns TRUE if any report contains key term
    for (const report of reports) {
        for (const disease of report.diseases) {
            if (disease === "") continue;
            if (disease.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in diseases`);
                return true;
            }
        }

        for (const syndrome of report.syndromes) {
            if (syndrome === "") continue;
            if (syndrome.toLowerCase().includes(keyTerm)) {
                functions.logger.debug(`key term '${keyTerm}' found in syndrome`);
                return true;
            }
        }
    }
    return false;
};

const isLocationInArticle = (article, request) => {
    for (const report of article.reports) {
        if (isLocationInReport(report, request)) {
            return true;
        }
    }
    return false;
};

const isLocationInReport = (report, request) => {
    if (request.location === "") return true;

    for (const location of report.locations) {
        if (location.location.toLowerCase().includes(request.location)) {
            return true;
        }
        if (location.country.toLowerCase().includes(request.location)) {
            return true;
        }
    }
    return false;
};

exports.getArticles = getArticles;
