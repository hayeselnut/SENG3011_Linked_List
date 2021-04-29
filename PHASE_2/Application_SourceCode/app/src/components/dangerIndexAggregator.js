import epiwatchApi from "../apis/epiwatchApi";

// Given recorded cases, calculate as a percentage of the maximum
const aggregateDangerIndexes = async (activeCasesByProvince, province, articles) => {
    const listOfProvinces = Object.keys(activeCasesByProvince);
    
    const articlesByProvinces = {};
    const resolved = await Promise.all(listOfProvinces.map(Province => {
        return epiwatchApi.articles("2015-01-01 00:00:00 to 3000-01-01 00:00:00", "", Province);
    }))
    listOfProvinces.forEach((Province, index) => {
        articlesByProvinces[Province] = resolved[index].articles.length;
    })
    console.log(articlesByProvinces);

    //MAGIC TODO

    // Get most recent case
    const mostRecentActiveCasesByProvince = {};
    const dangerIndexesByProvinces = {};
    let max = 0;
    for (const Province in activeCasesByProvince) {
        mostRecentActiveCasesByProvince[Province] = activeCasesByProvince[Province][activeCasesByProvince[Province].length - 1];
        if (max < mostRecentActiveCasesByProvince[Province]) {
            max = mostRecentActiveCasesByProvince[Province];
        }
    }

    for (const Province in mostRecentActiveCasesByProvince) {
        dangerIndexesByProvinces[Province] = mostRecentActiveCasesByProvince[Province] * 100.0 / max
    }

    console.log(dangerIndexesByProvinces);
    return dangerIndexesByProvinces;
}

export default aggregateDangerIndexes;
