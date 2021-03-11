import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
// import * as cors from "cors";

admin.initializeApp()

const app = express()

interface ArticlesRequest {
    startDate: string,
    endDate: string,
    keyTerms: string[],
    location: string,
}

// interface Location {
//     country: string,
//     location: string,
// }

// interface Report {
//     diseases: string[],
//     syndromes: string[],
//     eventDate: string,
//     locations: Location[],
// }

// interface Article {
//     id: string,
//     url: string,
//     dateOfPublication: string,
//     headline: string,
//     mainText: string,
//     reports: Report[],
// }

app.get('/request', async (req, res) => {
    const articlesRequest = parseArticlesRequest(req.params)

    console.log(articlesRequest)

    const snapshot = await admin.firestore().collection('articles').get()

    // TODO: FILTER DATA BASED ON SEARCH PARAMETERS

    const articles: any[] = []
    snapshot.forEach((doc) => {
        const id = doc.id
        const data = doc.data()

        articles.push({ id, ...data })
    })

    res.status(200).send(JSON.stringify(articles))
})

const parseArticlesRequest = (params: any): ArticlesRequest => {
    // TODO: check params has fields before accessing

    const startDate = params.startDate
    const endDate = params.endDate
    const keyTerms = params.keyTerms
    const location = params.location

    // TODO: parse variables

    return {
        startDate: parseDate(startDate),
        endDate: parseDate(endDate),
        keyTerms: keyTerms.split(','),
        location: location
    }
}

const parseDate = function (date: string): string {
    // TODO stub
    return date
}

export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info('Hello logs!', { structuredData: true })
    response.send('Hello from Firebase!')
})
