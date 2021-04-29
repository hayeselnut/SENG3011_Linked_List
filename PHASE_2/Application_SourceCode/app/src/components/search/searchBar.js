import React, { useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from "@reach/combobox";
import "@reach/combobox/styles.css";

import usePlacesAutoComplete, { getGeocode, getLatLng } from "use-places-autocomplete";

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
  },
  formControl: {
    margin: theme.spacing(1),
  },
  }));

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

  useEffect(() => {
    setFunc(value);
  }, [ready, setFunc, value])

  const handleSelect = async (address) => {
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
  }

  return (
    <div className={classes.search}>
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder={props.placeholder}
          style={{ width: "100%", height: "2em" }}
        />
        <ComboboxPopover>
        <ComboboxList>
          {status === "OK" && data.map(({id, description}) => <ComboboxOption key={id} value={description}/>)}
        </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  )
  }

export default Search;
