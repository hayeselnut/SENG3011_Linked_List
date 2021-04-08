import React from "react";
import {
    GoogleMap, 
    useLoadScript, 
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import {
    Container,
    Grid,
    Paper,
    Typography,
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { mapStyles } from './mapStyles';
import usePlacesAutoComplete, {
    getGeoCode,
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

import covid19Api from "../apis/covid19Api.js"
import epiwatchApi from "../apis/epiwatchApi.js"

import getDataAndPredictions from "./cases.js"

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

        // covid19Api.liveCountryStatusDate("united-states", "confirmed", "2021-03-20T00:00:00Z")
        getDataAndPredictions("united-states");

        getReports("2010-01-01 11:11:11 to 2021-05-05 11:11:11", "", location)

    }, [location])
    return [result, loading];
}

const Search = () => {
    const { ready, value, suggestions: {status, data}, setValue, clearSuggestion} = usePlacesAutoComplete({
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
    return (
        <div className={classes.search}>
            <Combobox onSelect={(address) => {
                console.log(address);
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


    return (
        <div style={mapPageStyle}>
            <Grid container className={classes.root}>
                <Grid item xs={12} sm={3} md={3} component={Paper} elevation={6}>
                    <div className={classes.paper}>
                        <Typography component="h1" variant="h4">
                            Route Planner
                        </Typography>
                        <Search />
                    </div>
                    <div>
                        {results ? <Report headline={headline} url={url} eventDate={eventDate}/> : <></>}
                    </div>
                    <div>
                        Charts
                    </div>
                </Grid>
                <Grid item xs={12} sm={9} md={9}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={8}
                        center={center}
                        options={options}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default Map