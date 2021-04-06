import React from "react";
import {
    GoogleMap, 
    useLoadScript, 
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import {
    Container,
    Grid
} from "@material-ui/core";
import { mapStyles } from './mapStyles';

const Map = () => {
    const mapContainerStyle = {
        width: "100vw",
        height: "100vh"
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
    })

    if (loadError) return "Error Loading Maps";
    if (!isLoaded) return "Loading Maps"; 

    const mapPageStyle = {
        width: "100%",
        height: "100%"
    }

    return (
        <div style={mapPageStyle}>
            <Grid xs={12} container>
                <Container
                    maxWidth="md"
                />
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={8}
                    center={center}
                    options={options}
                />
            </Grid>
        </div>
    )
}

export default Map