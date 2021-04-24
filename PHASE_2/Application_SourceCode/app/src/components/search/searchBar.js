import React from "react";
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
        // console.log(id, description)
        return <ComboboxOption key={id} value={description}/>
        })}
      </ComboboxList>
      </ComboboxPopover>
    </Combobox>
    </div>
  )
  }

export default Search;
