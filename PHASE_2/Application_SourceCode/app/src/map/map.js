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

let clicked;

const changeSidebar = (state) => {
    console.log("clicked", state);
    clicked = true;
}

const markers = () => {
    let listt = []
    Object.keys(centerCoords).forEach(element => {
        console.log(element, centerCoords[element])
        listt.push(
            <Marker 
                position={centerCoords[element]}
                clickable={true}
                onClick={() => changeSidebar(element)}
                id={element}
            />
        )
    })
    console.log(listt)
    return listt
}


// import { ohioDelim } from './ohiocoords.js'
// import { nyDelim } from './nycoords.js'
// import { ny2Delim } from './ny2coords.js'
// import { ny3Delim } from './ny3coords.js'
// import { ny4Delim } from './ny4coords.js'
// import { connectDelim } from './connectcoords.js'
// import { massDelim } from './masscoords.js'


import covid19Api from "../apis/covid19Api.js"
import epiwatchApi from "../apis/epiwatchApi.js"

import getDataAndPredictions from "./cases.js"
import { CasesChart } from "./casesChart";

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
    const [cases, setCases] = React.useState();
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
            // we want, event_date, url, headline
        }

        // getDataAndPredictions("united-states");
        getReports("2010-01-01 11:11:11 to 2021-05-05 11:11:11", "", location)

    }, [location])
    return [result, loading];
}

const Search = () => {
    const { ready, value, suggestions: {status, data}, setValue, clearSuggestions} = usePlacesAutoComplete({
        requestOptions: {
            location: {
                lat: () => 40.7128,
                lng: () => -74.0060,
            },
            radius: 200 * 1000,
        }
    })
    const handleInput = (e) => {
        setValue(e.target.value);
        console.log("intput is", value, ready, status);
    }
    const classes = useStyles();

    const mapRef = React.useRef();
    // const onMapLoad = React.useCallback((map) => {
    //   mapRef.current = map;
    // }, []);
  
    const panTo = React.useCallback(({ lat, lng }) => {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }, []);



    return (
        <div className={classes.search}>
            <Combobox onSelect={ async (address) => {
                setValue(address, false); 
                clearSuggestions();
                console.log(address);

                try {
                    const results = await getGeocode({address});
                    const { lat, lng } = await getLatLng(results[0]);
                    panTo({ lat, lng });
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
                            console.log(id, description)
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
    const [result, loading] = useAsyncHook("ohio");
    const [direct, setDirect] = React.useState({});
    const [response, setResponse] = React.useState({});
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
            <Grid container className={classes.root}>
                <Grid container item direction="column" xs={12} sm={3} md={3} spacing={2} component={Paper} elevation={3}>
                    <Grid item xs>
                        <div className={classes.paper}>
                            <Typography component="h1" variant="h4">
                                Route Planner
                            </Typography>
                            <Search />
                        </div>
                    </Grid>
                    <Grid item align="center">
                        <CasesChart />
                    </Grid>
                    <Grid item align="center">
                        <Report result={result} headline={headline} url={url} eventDate={eventDate}/>
                    </Grid>
                    <Grid item component={Paper} align="center">
                        <Typography variant="body2" gutterTop gutterBottom>
                            By <Link href="https://github.com/hayeselnut/SENG3011_Linked_List" target="_blank">SENG3011 Linked List</Link>
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={9} md={9}>
                    <GoogleMap
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
                        {/* <Polygon
                            paths={ohioDelim}
                            options={ohioOptions}
                            onLoad={ohioOnLoad}
                        />
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