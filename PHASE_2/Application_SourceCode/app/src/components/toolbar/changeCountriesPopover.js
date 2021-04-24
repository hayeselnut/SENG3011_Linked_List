import React from 'react';
import { Button, FormControl, InputLabel, MenuItem, Modal, Popover, Select, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import SupportedCountries from "../../assets/SupportedCountries.json"

const useStyles = makeStyles(theme => ({
  paper: {
    minWidth: '300px',
    padding: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 250,
  },
}));

export const ChangeCountriesPopover = (props) => {
  const classes = useStyles();
  const { country, setCountry } = props;

  return (
  <>
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="country-label">Country</InputLabel>
      <Select
        labelId="country-label"
        id="country-select"
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        {Object.keys(SupportedCountries).map((key, index) => (
          <MenuItem key={index} value={SupportedCountries[key].Slug}>{SupportedCountries[key].Country}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </>
  );
}

export default ChangeCountriesPopover;
