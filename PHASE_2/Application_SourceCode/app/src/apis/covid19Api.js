const getFetch = async (url) => {
    const response = await fetch(url)
    return await response.json()
}

class API {
    constructor(url) {
        this.url = url;
        this.liveCountry = (country) => getFetch(`${this.url}/live/country/${country}`);
        this.liveCountryStatus = (country, status) => getFetch(`${this.url}/live/country/${country}/status/${status}`);
        this.liveCountryStatusDate = (country, status, date) => getFetch(`${this.url}/live/country/${country}/status/${status}/date/${date}`);
    }
}

export default new API("https://api.covid19api.com");
