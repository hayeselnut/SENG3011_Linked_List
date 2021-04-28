const getFetch = async (url) => {
    const response = await fetch(url)
    return await response.json()
}

const ONE_DAY = 86400000;
const ONE_WEEK = ONE_DAY * 7;

class API {
    constructor(url) {
        this.url = url;
        this.cities = (country) => getFetch(`${this.url}/country/${country}?from=${new Date(Date.now() - ONE_WEEK).toISOString().slice(0, 10)}T00:00:00Z&to=${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
        this.liveCountry = (country) => getFetch(`${this.url}/live/country/${country}`);
        this.liveCountryStatus = (country, status) => getFetch(`${this.url}/live/country/${country}/status/${status}`);
        this.liveCountryStatusDate = (country, status, date) => getFetch(`${this.url}/live/country/${country}/status/${status}/date/${date}`);
    }
}

export default new API("https://api.covid19api.com");
