import React from "react";
import { GoogleMap, useLoadScript, Marker, Polygon, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { Grid, Paper } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { mapStyles } from './mapStyles';

import { Report } from "./report.js";
import { centerCoords } from "./centerCoords.js";

import epiwatchApi from "../apis/epiwatchApi.js"

import getDataAndPredictions from "../components/casesChart/cases.js"
import { getcoord } from "./getcoord";
import EpiWatchToolBar from "../components/toolbar/epiwatchToolbar";
import Search from "../components/search/searchBar";

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
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  search: {
    padding: '0.5rem',
    fontSize: '1.5rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '10%'
  },
}));

const libraries = ["places"];

function useAsyncHook(location) {
  // Result is a list of event_date, url and headline
  const [result, setResult] = React.useState([])
  const [loading, setLoading] = React.useState("false");
  const [caseLoading, setCaseLoading] = React.useState("false");

  React.useEffect(() => {
    const getReports = async (poi, keyTerms, location) => {
      let myData;
      try {
        myData = await epiwatchApi.articles(poi, keyTerms, location);

        setResult(
          [myData.articles[0].headline, myData.articles[0].url, myData.articles[0].reports[0].event_date]
        )

      } catch {
        setLoading("null");
      }
    }

    getReports("2010-01-01 11:11:11 to 2021-05-05 11:11:11", "", location)

  }, [location])
  return [result, loading];
}

const Map = () => {
  const [province, setProvince] = React.useState("Ohio")
  const [country, setCountry] = React.useState("united-states");
  const [result, loading] = useAsyncHook(province);
  const [recordedCases, setRecordedCases] = React.useState({});
  const [predictedCases, setPredictedCases] = React.useState({});
  const [direct, setDirect] = React.useState({});
  const [response, setResponse] = React.useState({});

  React.useEffect(() => {
    getDataAndPredictions(country).then(([recorded, predicted]) => {
      console.log('recorded and predicted', recorded, predicted)
      setRecordedCases(recorded);
      setPredictedCases(predicted);
    });
  }, []);

  React.useEffect(() => {
    getDataAndPredictions(country).then(([recorded, predicted]) => {
      console.log('recorded and predicted', recorded, predicted)
      setRecordedCases(recorded);
      setPredictedCases(predicted);
    });
  }, [country, province])

  console.log(result,loading);
  let eventDate, headline, url;
  let results = false;
  if (result.length !== 0) {
    eventDate = result[2].split('T')[0];
    console.log(eventDate);
    headline = result[0];
    url = result[1];
    results = true;
  }
  const classes = useStyles();
  const mapContainerStyle = {
    width: "100%",
    height: "100%"
  }
  const center = {
    lat: 40.7128,
    lng: -74.0060,
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
    console.log("yessir", polygon)
  }

  // const latlngs = {
  //     "state": {lat: lng:}
  // }

  const directionsService = new window.google.maps.DirectionsService();

  const origin = centerCoords['New York, USA'];
  const destination = centerCoords['Ohio, USA'];

  const directionsCallback = (response) => {
    console.log("THE RESPONSE IS ", response)
    if (response !== null) {
      if (response.status === 'OK') {
        console.log("alsjdf;alksdjf")
        setResponse(
        response
        )
      } else {
        console.log('response: ', response)
      }
    }
  }

  // directionsService.route(
  // {
  //     origin: origin,
  //     destination: destination,
  //     travelMode: window.google.maps.TravelMode.DRIVING
  // },
  // (result, status) => {
  //     if (status === window.google.maps.DirectionsStatus.OK) {
  //     setDirect({
  //         directions: result
  //     });
  //     } else {
  //     console.error(`error fetching directions ${result}`);
  //     }
  // }
  // );

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
      />
      <Grid container className={classes.root}>
        <Grid container item direction="column" xs={12} sm={3} md={3} spacing={2} component={Paper} elevation={3}>
          <Grid item xs>
            <div className={classes.paper}>
              <Search />
            </div>
          </Grid>
          <Grid item align="center">
            <Report result={result} headline={headline} url={url} eventDate={eventDate}/>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={9} md={9}>
          { <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={center}
            options={options}
          >
            <DirectionsService
              options={{origin: origin, destination: destination, travelMode: "DRIVING"}}
              callback={directionsCallback}
            />
            {response !== null && <DirectionsRenderer
              options={{
                directions: response
              }}
            />}

            {markers()}
            { <Polygon id = "poly"
              paths={getcoord(country,province)} 

              options={ohioOptions}
              onLoad={ohioOnLoad}
            /> }
            {/*The country and province of the follower are automatically changed. Don't ask me why I didn't write the city, 
              because we didn't find the city in our query... and storing a large file of 100m is really a problem. 
              I can do it, but the system can't save it. Unless we have a database.
              
              
              I don't know what the variables of our destination country and state are, so I wrote an example. 
              You only need to change the variables in getcoord to display the corresponding continent. 
              The continent that cannot be displayed does not match the characters, and the name may be different.
              */

              // for future
            /*  <Polygon id = "poly"
              paths={getcoord(destination_country,destination_province)} //
              options={ohioOptions}
              onLoad={ohioOnLoad}
            /> */
  

            /*
            <Polygon
              paths={nyDelim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
            <Polygon
              paths={ny2Delim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
            <Polygon
              paths={ny3Delim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
            <Polygon
              paths={ny4Delim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
            <Polygon
              paths={connectDelim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
            <Polygon
              paths={massDelim}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />
          </GoogleMap> */}
          
          </GoogleMap>}
        </Grid>
      </Grid>
    </div>
  )
}

export default Map