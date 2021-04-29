import React from "react";
import { Typography, Toolbar, IconButton, Link, FormControl, InputLabel, MenuItem, Select, AppBar } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub';
import { makeStyles } from '@material-ui/core/styles';
import SupportedCountries from "../../assets/SupportedCountries.json"
import { CasesChartModal } from "../casesChart/casesChartModal.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  formCountryControl: {
    margin: theme.spacing(1),
    width: 250,
  },
  formStateControl: {
    margin: theme.spacing(1),
    width: 200,
  },
  toolbar: {
    ...theme.mixins.toolbar,
  }
}));

const EpiWatchToolBar = (props) => {
  const classes = useStyles();
  const { pageName, country, setCountry, province, setProvince, recordedCases, predictedCases } = props;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>{pageName}</Typography>

        <FormControl variant="outlined" className={classes.formCountryControl}>
          <Select
            id="country-select"
            value={country}
            style={{ backgroundColor: "white" }}
            onChange={(e) => {setCountry(e.target.value); setProvince(SupportedCountries[e.target.value].Provinces[0])}}
          >
            {Object.keys(SupportedCountries).map((key, index) => (
              <MenuItem key={index} value={SupportedCountries[key].Slug}>{SupportedCountries[key].Country}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" className={classes.formStateControl}>
          <Select
            id="state-select"
            value={province}
            style={{ backgroundColor: "white" }}
            onChange={(e) => setProvince(e.target.value)}
          >
            {SupportedCountries[country].Provinces.map((province, index) => (
              <MenuItem key={index} value={province}>{province}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <CasesChartModal state={province} recorded={recordedCases[province]} predicted={predictedCases[province]} />

        <Link href="https://github.com/hayeselnut/SENG3011_Linked_List" color="inherit" target="_blank">
          <IconButton className={classes.menuButton} color="inherit" aria-label="github">
            <GitHubIcon />
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}

export default EpiWatchToolBar;