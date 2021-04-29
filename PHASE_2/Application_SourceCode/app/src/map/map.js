import React from "react";
import { GoogleMap, useLoadScript, Marker, Polygon, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { Grid, Paper, Typography, Button } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { mapStyles } from './mapStyles';

import { centerCoords } from "./centerCoords.js";

import epiwatchApi from "../apis/epiwatchApi.js"

import { getDataAndPredictions, getCasesByCity} from "../components/casesChart/cases.js"
import EpiWatchToolBar from "../components/toolbar/epiwatchToolbar";
import Search from "../components/search/searchBar";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { overallCalculatorOfRouteCases } from "../components/routes/routeColouring.js";
import ArticlesShowcase from "../components/articlesShowcase/articlesShowcase";
import aggregateDangerIndexes from "../components/dangerIndexAggregator";

import Geocode from "react-geocode";
import Heatmap from "../components/heatmap/heatmap.js";
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

Geocode.setRegion("es");
Geocode.setLanguage("en");
Geocode.setLocationType("ROOFTOP");

const markers = () => {
  let listt = []
  Object.keys(centerCoords).forEach((element, index) => {
    // console.log(element, centerCoords[element])
    listt.push(
      <Marker
        key={index}
        position={centerCoords[element]}
        clickable={true}
        //onClick={() => changeSidebar(element)}
        onClick={() => function() {console.log(element)}}
        id={element}
      />
    )
  })
  return listt
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  paper: {
    marginTop: '2em',
    width: '100%',
  }
}));

const libraries = ["places"];

function useAsyncHook(location) {
  const [articles, setArticles] = React.useState([])
  const [articlesLoading, setArticlesLoading] = React.useState(true);

  React.useEffect(() => {
    const getReports = async (poi, keyTerms, location) => {
      let myData;
      setArticlesLoading(true);
      try {
        myData = await epiwatchApi.articles(poi, keyTerms, location);
        console.log(myData);
        setArticles(myData.articles);
        setArticlesLoading(false);
      } catch {
        setArticlesLoading(true);
      }
    }

    getReports("2010-01-01 11:11:11 to 2021-05-05 11:11:11", "", location)

  }, [location])
  return [articles, articlesLoading];
}

const allCityfinder = (response, routecitySearch, setRoutecitysSearch, setRoutecitys, routecitys, casesByCity) => {
  if (response !== null && response.routes && !routecitySearch ) {
    setRoutecitysSearch(true);

   // console.log(response.routes[0].legs[0].steps[0].end_location.lat);
   const se = [];

    for (let i1 = 0; i1 < response.routes.length ; i1++){
      const se1 = [];
      let qq = 0;//reduce call api number
      for(let i2 = 0; i2 < response.routes[i1].legs.length; i2++){
        for(let i3 = 0; i3 < response.routes[i1].legs[i2].steps.length; i3++){
          qq = qq + 1;
          var q1 = response.routes[i1].legs[i2].steps[i3].end_location.lat;
          var q2 = response.routes[i1].legs[i2].steps[i3].end_location.lng;
          if( qq == 3){

            Geocode.fromLatLng(q1(), q2()).then(
              (response) => {
                const address = response.results[0].formatted_address;
                let city, state, country;
                for (let i = 0; i < response.results[0].address_components.length; i++) {
                  for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                    switch (response.results[0].address_components[i].types[j]) {
                      case "locality":
                        city = response.results[0].address_components[i].long_name;
                        break;
                      case "administrative_area_level_1":
                        state = response.results[0].address_components[i].long_name;
                        break;
                      case "country":
                        country = response.results[0].address_components[i].long_name;
                        break;
                      default:
                        break;
                    }
                  }
                }
                se1.push([city,state,country]);
              },
              (error) => {
                console.error('error');
              }
            );
            qq = 0;
          }
        }
      }
      se.push(se1);
    }
    setRoutecitys(se);
    console.log("se",se);
    console.log("rctiys:",routecitys);
    // const a = await sleep(1000);
    const ans = overallCalculatorOfRouteCases(routecitys, casesByCity);
    console.log('answer', ans);

  } 
  return null;
}

const Map = () => {
  const [province, setProvince] = React.useState("Ohio")
  const [country, setCountry] = React.useState("united-states");
  const [articles, articlesLoading] = useAsyncHook(province);
  const [recordedCases, setRecordedCases] = React.useState({});
  const [predictedCases, setPredictedCases] = React.useState({});
  const [direct, setDirect] = React.useState({});
  const [response, setResponse] = React.useState({});
  const [origin, setOrigin] = React.useState('');
  const [dest, setDest] = React.useState('');
  const [destLatLng, setDestLatLng] = React.useState({});
  const [originLatLng, setOriginLatLng] = React.useState({});
  const [center, setCenter] = React.useState({lat: 37.0902, lng: -95.7129});
  const [gotDirections, setGotDirections] = React.useState(false); 
  const [routecitys, setRoutecitys] = React.useState([]);
  const [routecitySearch, setRoutecitysSearch] = React.useState(true);
  const [casesByCity, setCasesByCity] = React.useState(true);
  const [cases, setcases] = React.useState({});
  const [routeRank, setRouteRank] = React.useState({});

  React.useEffect(() => {
    getDataAndPredictions(country).then(([recorded, predicted]) => {
      setRecordedCases(recorded);
      setPredictedCases(predicted);
    });

    getCasesByCity(country).then(x => setCasesByCity(x));

  }, [country]);

  React.useEffect(() => {

    // calculate covid along this route everytime the cities is updated 
    console.log('routecities', routecitys)
    // if (routecitys.length > 0 && routecitySearch && routecitys) {
      const ans = overallCalculatorOfRouteCases(routecitys, casesByCity);
      console.log('answer', ans);
      setRouteRank(ans); 
    // }
  }, [routecitys, casesByCity, routecitySearch]);


  React.useEffect(() => { 
    allCityfinder(response, routecitySearch, setRoutecitysSearch, setRoutecitys, routecitys, casesByCity); 
  },[gotDirections, response, routecitySearch, setRoutecitysSearch, setRoutecitys, routecitys, casesByCity]);


  // React.useEffect(async () => {
  //   // everytime dest ort origin is updated then we have toi call the api to get the geocode and the latlng 
  //   const destPara = {
  //     address: dest,
  //   };
  //   console.log('dest', dest);
  //   try {

  //     const results = await getGeocode(destPara);
  //     const coords = await getLatLng(results[0]);
  //     console.log('coords', coords);
  //     setDestLatLng(coords);
  //   } catch (error) {
  //     console.log("Error: ", error);
  //   }

  // },[dest])

  // React.useEffect(async () => {
  //   // everytime dest ort origin is updated then we have toi call the api to get the geocode and the latlng 


  // },[origin])

  const getDirectionCoords = async () => {
      console.log('og', origin)
    const originPara = {
      address: origin,
    };
    try {
      const results = await getGeocode(originPara);
      const coords = await getLatLng(results[0]);
      // console.log('origin coords', coords);
      setOriginLatLng(coords);
    } catch (error) {
      console.log("Error: ", error);
    }    
    const destPara = {
      address: dest,
    };
    console.log('dest', dest);
    try {

      const results = await getGeocode(destPara);
      const coords = await getLatLng(results[0]);
      console.log('coords', coords);
      setDestLatLng(coords);
      setCenter(coords);
    } catch (error) {
      console.log("Error: ", error);
    }

  }

  const getChooseCoords = async () => {

  const destPara = {
    address: province+','+country,
  };
  console.log('put', dest);
  try {

    const results = await getGeocode(destPara);
    const coords = await getLatLng(results[0]);
    console.log('coords', coords);
    setDestLatLng(coords);
    setCenter(coords);
  } catch (error) {
    console.log("Error: ", error);
  }

}

  const classes = useStyles();
  const mapContainerStyle = {
    width: "100%",
    height: "100%"
  }
  const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  }
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  if (loadError) return "Error Loading Maps";
  if (!isLoaded) return "Loading Maps";

  const mapPageStyle = {
    width: "100%",
    height: "100%"
  }

  const ohioOptions = {
    strokeColor: '#FF000',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillcolor: '#FF0000',
    fillOpacity: 0.35,
    zIndex: 1
  };

  const ohioOnLoad = (polygon) => {
  }

  // const latlngs = {
  //     "state": {lat: lng:}
  // }

  // const directionsService = new window.google.maps.DirectionsService();

  // const origin = centerCoords['New York, USA'];
  // const destination = centerCoords['Ohio, USA'];
  // const sleep = (ms) => {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        console.log("Positive response", response);
        // if (response.)
        setResponse(
          response
        )
        setGotDirections(true);
      } else {
        console.log('Neg response: ', response)
      }
    }
  }

  const AllRouteRenderer = () => {
    if (response !== null && response.routes) {
      console.log('routes', response.routes)
      const routes = response.routes.map((_, i) => {
        console.log('id', i);
      if (i === routeRank.lowestId) {
        console.log("rank", i)
        return (
          <DirectionsRenderer
            options={{
              directions: response,
              routeIndex: i,
              polylineOptions: { strokeColor: '#FFFFFF' }
            }}
          />
        )
      } else if (i === routeRank.highestId) {
          console.log("rank", i)
          return (
            <DirectionsRenderer
              options={{
                directions: response,
                routeIndex: i,
                polylineOptions: { strokeColor: '#000000' },
                zIndex: 1
              }}
            />
          )

        } else if (routeRank === {}) {
          console.log("rank", "{}")
          return (
            <DirectionsRenderer
              options={{
                directions: response,
                routeIndex: i,
              }}
            />
          )
        } else {
          console.log("asdlkfj rank")
          return (
            <DirectionsRenderer
              options={{
                directions: response,
                routeIndex: i,
              }}
            />
          )
        }
      })
      console.log('rr',routes);
      return routes;
    } 
    return null;
  }


  return (
    <div style={mapPageStyle}>
      <EpiWatchToolBar
        pageName={"Route Planner"}
        country={country}
        setCountry={setCountry}
        province={province}
        setProvince={setProvince}
        recordedCases={recordedCases}
        predictedCases={predictedCases}
        getChooseCoords={getChooseCoords}
      />
      <Grid container className={classes.root} spacing={2}>
        <Grid container item direction="column" xs={12} sm={3} md={3} >
          <Grid item>
            <div className={classes.paper}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Typography style={{marginLeft: '1em', marginRight: '1em'}} component="h1" variant="h4">
                  Route Planner
                </Typography>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }} >
                <div style={{ width: "90%" }}>
                  <Search placeholder={"Starting location"} setFunc={setOrigin}/>
                  <Search placeholder={"Destination"} setFunc={setDest}/>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", justifyContent: "center" }} >
                <Button variant="contained" color="primary" onClick={() => {setGotDirections(false); getDirectionCoords();setRoutecitysSearch(false)}}>
                  Find safe route
                </Button>
              </div>
            </div>
          </Grid>
          <Grid item align="center">
            <ArticlesShowcase articles={articles} articlesLoading={articlesLoading} province={province} />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={9} md={9} style={{position: "static"}}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            options={options}
          >
            {!gotDirections && <DirectionsService
              options={{origin: originLatLng, destination: destLatLng, travelMode: "DRIVING", provideRouteAlternatives:true }}
              callback={directionsCallback}
            />}
            <AllRouteRenderer/>

            {/* {markers()} */}
            <Heatmap country={country} province={province} recorded={recordedCases}/>

          </GoogleMap>
        </Grid>
      </Grid>
    </div>
  )
}

export default Map