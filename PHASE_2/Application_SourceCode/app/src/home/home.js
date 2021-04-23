import React from 'react'
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
    TextField,
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

const home = () => {
    <form noValidate autoComplete="off">
        <TextField id="outlined-basic" label="Outlined" variant="outlined" type="text"/>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" type="text"/>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" type="date"/>
    </form>

    return (
        <></>
    )
}

export default home;
