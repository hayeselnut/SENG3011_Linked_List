import covid19Api from "../apis/covid19Api.js"
import PolynomialRegression from "js-polynomial-regression";

const getDataAndPredictions = async (country) => {
  const lastMonth = getLastMonth();
  const covid19Data = await getCovid19DataGroupedByState(country, "confirmed", lastMonth);
  const recordedActiveCasesByProvince = getActiveCasesOnly(covid19Data);
  const predictionsByProvince = getPredictionsByProvinces(recordedActiveCasesByProvince);
  // console.log(recordedActiveCasesByProvince, predictionsByProvince)
  return [recordedActiveCasesByProvince, predictionsByProvince];
}

const getLastMonth = () => {
  const ONE_DAY = 86400000;
  const ONE_MONTH = ONE_DAY * 31;

  const now = new Date();
  const yesterday = new Date(now - ONE_DAY);
  const lastMonth = new Date(yesterday - ONE_MONTH);
  return asDate(lastMonth)
}

const asDate = (date) => date.toISOString().slice(0, 10)

const getCovid19DataGroupedByState = async (country, status, date) => {
  const rawData = await covid19Api.liveCountryStatusDate(country, status, date);
  const covid19Data = {};

  for (const provinceData of rawData) {
    const {Active, City, CityCode, Confirmed, Country, CountryCode, Date, Deaths, Lat, Lon, Province, Recovered} = provinceData

    if (!(Province in covid19Data)) {
      covid19Data[Province] = {Country, CountryCode, City, CityCode, Province, Lat, Lon, dataByDates: {}}
    }

    covid19Data[Province].dataByDates[Date] = { Confirmed, Deaths, Recovered, Active }
  }

  return covid19Data;
}

const getActiveCasesOnly = (covid19Data) => {
  const activeCasesOnly = {};
  for (const Province in covid19Data) {
    activeCasesOnly[Province] = Object.values(covid19Data[Province].dataByDates).map(p => p.Active)
  }
  return activeCasesOnly;
}

const getPredictionsByProvinces = (recordedCasesByProvince) => {
  const predictionsByProvince = {};

  const polynomialRegressionsByProvince = transformToPolynomialRegressions(recordedCasesByProvince);
  for (const Province in polynomialRegressionsByProvince) {
    const model = polynomialRegressionsByProvince[Province]
    const terms = model.getTerms();
    predictionsByProvince[Province] = [];

    for (let day = 0; day < 31; day++) {
      predictionsByProvince[Province].push(Math.round(model.predictY(terms, day)));
    }
  }
  return predictionsByProvince;
}

const transformToPolynomialRegressions = (recordsByProvince) => {
  const polynomialRegressionsByProvince = {}
  for (const Province in recordsByProvince) {
    const plotPoints = recordsByProvince[Province]
      .map((cases, index) => ({x: index - recordsByProvince[Province].length, y: cases}));
    const degreeOfPolynomialRegression = 3;

    polynomialRegressionsByProvince[Province] = PolynomialRegression.read(plotPoints, degreeOfPolynomialRegression);
  }
  return polynomialRegressionsByProvince;

}

export default getDataAndPredictions