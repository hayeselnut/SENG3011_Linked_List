import React from "react";
import {
  GoogleMap, 
  useLoadScript, 
  Marker,
  InfoWindow,
  Polygon,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Link,
  Button,
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { mapStyles } from './mapStyles';
import usePlacesAutoComplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { Report } from "./report.js";
import { centerCoords } from "./centerCoords.js";

import covid19Api from "../apis/covid19Api.js"
import epiwatchApi from "../apis/epiwatchApi.js"

import getDataAndPredictions from "./cases.js"
import { CasesChart } from "./casesChart";
import { CasesChartModal } from "./casesChartModal";
import { getcoord } from "./getcoord";

import Geocode from "react-geocode";
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

Geocode.setRegion("es");
Geocode.setLanguage("en");
Geocode.setLocationType("ROOFTOP");


let clicked;

const changeSidebar = (state) => {
  // console.log("clicked", state);
  clicked = true;
}

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



const Search = (props) => {
  const { ready, value, suggestions: {status, data}, setValue, clearSuggestions} = usePlacesAutoComplete({
    requestOptions: {
      location: {
        lat: () => 40.7128,
        lng: () => -74.0060,
      },
      radius: 200 * 1000,
    }
  })
  const { setFunc } = props;
  const handleInput = (e) => {
    setValue(e.target.value);
    // console.log("intput is", value, ready, status);
    // console.log(e.target.value); 
    setFunc(e.target.value);
  }
  const classes = useStyles();

  const mapRef = React.useRef();
  // const onMapLoad = React.useCallback((map) => {
  //   mapRef.current = map;
  // }, []);

  // const panTo = React.useCallback(({ lat, lng }) => {
  //   mapRef.current.panTo({ lat, lng });
  //   mapRef.current.setZoom(14);
  // }, []);

  return (
    <div className={classes.search}>
      <Combobox onSelect={ async (address) => {
        setValue(address, false); 
        clearSuggestions();
        // console.log(address);

        try {
          const results = await getGeocode({address});
          const { lat, lng } = await getLatLng(results[0]);
          // panTo({ lat, lng });
          // Display the side bar for this place
        } catch (error) {
          console.log('error trying to pan')
        }
      }}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Enter a state"
        />
        <ComboboxPopover className={classes.popover}>
          <ComboboxList className={classes.list}>
            {status === "OK" && data.map(({id, description}) => {
              // console.log(id, description)
              return <ComboboxOption key={id} value={description}/>
            })}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  )
}

const Map = () => {
  // TODO: Make this dynamic to the state they click on
  const usState = "Ohio";
  const [result, loading] = useAsyncHook(usState);
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
  const [routecitys, setRoutecitys] = React.useState({});
  const [routecitySearch, setRoutecitysSearch] = React.useState(true);


  React.useEffect(() => {
    getDataAndPredictions("united-states").then(([recorded, predicted]) => {
      // console.log('recorded and predicted', recorded, predicted)
      setRecordedCases(recorded);
      setPredictedCases(predicted);
    });
  }, [])

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
    // console.log('og', origin)
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
    // console.log('dest', dest);
    try {

      const results = await getGeocode(destPara);
      const coords = await getLatLng(results[0]);
      // console.log('coords', coords);
      setDestLatLng(coords);
      setCenter(coords);
    } catch (error) {
      console.log("Error: ", error);
    }


  }

  // console.log(result,loading);
  let eventDate, headline, url;
  let results = false;
  if (result.length !== 0) {
    eventDate = result[2].split('T')[0];
    // console.log(eventDate);
    headline = result[0];
    url = result[1];
    results = true;
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

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        console.log("Positive response", response);
        // if (response.)
        setResponse(  
          response
        )
        setGotDirections(true);
        AllCityfinder ();
      } else {
        console.log('Neg response: ', response)
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
  const AllRouteRenderer = () => {
    if (response !== null && response.routes) {
      //console.log('routes', response.routes)
      const routes = response.routes.map((_, i) => {
        console.log('routes', response.routes)
        return (
          <DirectionsRenderer
            options={{
              directions: response,
              routeIndex: i,
            }}
          />
        )
      })
      return routes;
    } 
    return null;
  }


  const AllCityfinder = () => {
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
      console.log(se);
      

    } 
    return null;
  }

  return (
    <div style={mapPageStyle}>
      <Grid container className={classes.root}>
        <Grid container item direction="column" xs={12} sm={3} md={3} spacing={2} component={Paper} elevation={3}>
          <Grid item xs>
            <div className={classes.paper}>
              <Typography component="h1" variant="h4">
                Route Planner
              </Typography>
              <Search setFunc={setOrigin}/>
              <Search setFunc={setDest}/>
              <Button variant="contained" color="primary" onClick={() => {setGotDirections(false); getDirectionCoords();setRoutecitysSearch(false)}}>
                Find the safest route!
              </Button>
            </div>
          </Grid>
          <Grid item align="center">
            <CasesChartModal state={usState} recorded={recordedCases[usState]} predicted={predictedCases[usState]} />
          </Grid>
          <Grid item align="center">
            <Report result={result} headline={headline} url={url} eventDate={eventDate}/>
          </Grid>
          <Grid item component={Paper} align="center">
            <Typography variant="body2" gutterBottom>
              By <Link href="https://github.com/hayeselnut/SENG3011_Linked_List" target="_blank">SENG3011 Linked List</Link>
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={9} md={9}>
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
            {/* {response !== null && <DirectionsRenderer
              options={{
                directions: response
              }}
            />} */}
            <AllRouteRenderer/>
            {markers()}
            { <Polygon id = "poly"
              paths={getcoord("Alabama","Autauga")}
              options={ohioOptions}
              onLoad={ohioOnLoad}
            />/*
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
            /> */}
          </GoogleMap>
        </Grid>
      </Grid>
    </div>
  )
}

export default Map