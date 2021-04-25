import covid19Api from "../../apis/covid19Api.js"
import brain from "brain.js/src";
import SupportedCountries from "../../assets/SupportedCountries.json";
import trainedBrainJsonConfig from "../../assets/brain.json";

const getDataAndPredictions = async (country) => {
  const lastMonth = getLastMonth();
  const covid19ApiData = await getCovid19ApiData(country, "confirmed", lastMonth);
  const covid19Data = getCovid19DataGroupedByState(country, covid19ApiData);
  const recordedActiveCasesByProvince = getActiveCasesOnly(covid19Data);

  const trainingData = convertToTrainingData(recordedActiveCasesByProvince);
  const predictionsByDays = getPredictionsByDays(trainingData);
  const predictionsByProvince = convertToPredictionsByProvinces(recordedActiveCasesByProvince, predictionsByDays);
  return [recordedActiveCasesByProvince, predictionsByProvince];
}

const getLastMonth = () => {
  const ONE_DAY = 86400000;
  const ONE_MONTH = ONE_DAY * 31 * 12;

  const now = new Date();
  const yesterday = new Date(now - ONE_DAY);
  const lastMonth = new Date(yesterday - ONE_MONTH);
  return asDate(lastMonth)
}

const asDate = (date) => date.toISOString().slice(0, 10)

const getCovid19ApiData = async (country, status, date) => {
  return await covid19Api.liveCountryStatusDate(country, status, date);
}

const getCovid19DataGroupedByState = (country, rawData) => {
  const covid19Data = {};

  for (const provinceData of rawData) {
    const {Active, City, CityCode, Confirmed, Country, CountryCode, Date, Deaths, Lat, Lon, Province, Recovered} = provinceData

    if (!SupportedCountries[country].Provinces.includes(Province)) continue;

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

const convertToTrainingData = (recordedCasesByProvince) => {
  // Object of arrays { Ohio: [...], Florida: [...] }
  const listOfKeys = Object.keys(recordedCasesByProvince);
  const numberOfDays = recordedCasesByProvince[listOfKeys[0]].length;

  // Training data is an array of arrays
  const trainingData = [];
  for (let i = 0 ; i < numberOfDays; i++) {
    const day = []
    for (const key of listOfKeys) {
      const cases = recordedCasesByProvince[key][i]

      if (cases !== undefined) {
        day.push(recordedCasesByProvince[key][i])
      }
    }
    trainingData.push(day);
  }
  return trainingData;
}

const getPredictionsByDays = (trainingData) => {
  const net = trainBrain(trainingData)
  const lastDay = trainingData.length - 1
  const daysToPredict = 30
  return net.forecast([trainingData[lastDay]], daysToPredict).map(denormaliseCases);
}

const trainBrain = (trainingData) => {
  const net = new brain.recurrent.LSTMTimeStep({
    inputSize: trainingData[0].length,
    hiddenLayers: [10],
    outputSize: trainingData[0].length,
  });

  // FOR TRAINING ONLY:
  // const iterations = 100_000;
  // net.train(trainingData.map(normaliseCases), { log: true, iterations: iterations });

  net.fromJSON(trainedBrainJsonConfig);

  return net;
}

const convertToPredictionsByProvinces = (recordedCasesByProvince, predictionsByDays) => {
  // Object of arrays { 0: [...], 1: [...] }
  const listOfProvinces = Object.keys(recordedCasesByProvince);
  const numberOfDays = Object.keys(predictionsByDays).length;

  const predictionsCasesByProvince = {};
  for (const Province in recordedCasesByProvince) {
    predictionsCasesByProvince[Province] = [];
  }

  for (const Province in recordedCasesByProvince) {
    for (let i = 0; i < numberOfDays; i++) {

      const indexOfProvince = listOfProvinces.indexOf(Province);

      predictionsCasesByProvince[Province].push(predictionsByDays[i][indexOfProvince]);
    }
  }
  return predictionsCasesByProvince;
}

const normaliseCases = (provinceCases) => provinceCases.map(cases => Math.log(cases));
const denormaliseCases = (provinceCases) => provinceCases.map(cases => Math.exp(cases));

export default getDataAndPredictions