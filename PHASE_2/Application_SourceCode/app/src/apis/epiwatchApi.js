const getFetch = async (url) => {
    const response = await fetch(url)
    return await response.json()
}

class API {
    constructor(url) {
        this.url = url;
        this.article = (articleId) => getFetch(`${this.url}/article/${articleId}`);
        this.articles = (poi, keyTerms, location) => getFetch(`${this.url}/articles?period_of_interest=${poi}&key_termns=${keyTerms}&location=${location}`);
    }
}

export default new API("https://us-central1-still-resource-306306.cloudfunctions.net/api");
