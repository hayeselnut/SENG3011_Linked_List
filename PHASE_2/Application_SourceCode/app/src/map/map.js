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
  Select,
  Paper,
  Typography,
  Link,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
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
  console.log('search')
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
    console.log('getting input');
    setValue(e.target.value);
    console.log("intput is", value, ready, status, e.target.value);
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
          // const { lat, lng } = await getLatLng(results[0]);
          // panTo({ lat, lng });
          // Display the side bar for this place
        } catch (error) {
          console.log('error trying to pan')
        }
      }}>
        <ComboboxInput
          value={value}
          onChange={(e) => handleInput(e)}
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

const supportedCountries = {
  "united-states": {
    "Country": "USA",
    "Slug": "united-states",
    "ISO2": "US",
    "Provinces": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Northern Mariana Islands", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virgin Islands", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  },
  "india": {
    "Country": "India",
    "Slug": "india",
    "ISO2": "IN",
    "Provinces": ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
  },
}

const Map = () => {
  const [province, setProvince] = React.useState("Ohio") // a province is a state
  const [country, setCountry] = React.useState("united-states");
  const [result, loading] = useAsyncHook(province);
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
      } else {
        console.log('Neg response: ', response)
      }
    }
  }


  const AllRouteRenderer = () => {
    if (response !== null && response.routes) {
      console.log('routes', response.routes)
      const routes = response.routes.map((_, i) => {
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

  return (
    <div style={mapPageStyle}>
      <Grid container className={classes.root}>
        <Grid container item direction="column" xs={12} sm={3} md={3} spacing={2} component={Paper} elevation={3}>
          <Grid item xs>
            <div className={classes.paper}>
              <div>
                <FormControl className={classes.formControl}>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select
                    labelId="country-label"
                    id="country-select"
                    value={country}
                    onChange={(e) => {setCountry(e.target.value); setProvince(supportedCountries[e.target.value].Provinces[0])}}
                  >
                    {Object.keys(supportedCountries).map((key, index) => (
                      <MenuItem key={index} value={supportedCountries[key].Slug}>{supportedCountries[key].Country}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl className={classes.formControl}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select
                    labelId="state-label"
                    id="state-select"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    {console.log(country)}
                    {supportedCountries[country].Provinces.map((province, index) => (
                      <MenuItem key={index} value={province}>{province}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Typography component="h1" variant="h4">
                Route Planner
              </Typography>
              <Search setFunc={setOrigin}/>
              <Search setFunc={setDest}/>
              <Button variant="contained" color="primary" onClick={() => {setGotDirections(false); getDirectionCoords();}}>
                Find the safest route!
              </Button>
            </div>
          </Grid>
          <Grid item align="center">
            <CasesChartModal state={province} recorded={recordedCases[province]} predicted={predictedCases[province]} />
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
          { <GoogleMap
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
            {markers()}
            { <Polygon id = "poly"
              paths={getcoord(country,province)} 

              options={ohioOptions}
              onLoad={ohioOnLoad}
            /> 
            /*The country and province of the follower are automatically changed. Don't ask me why I didn't write the city, 
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