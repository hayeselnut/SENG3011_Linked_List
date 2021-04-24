import React from "react";
import { Typography, Button, Toolbar, IconButton, Link, Modal } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/HomeRounded'
import GitHubIcon from '@material-ui/icons/GitHub'
import { makeStyles } from '@material-ui/core/styles';

import SupportedCountries from "../../assets/SupportedCountries.json"
import ChangeCountriesPopover from "./changeCountriesPopover.js";

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
}));

const EpiWatchToolBar = (props) => {
  const classes = useStyles();
  const { pageName, country, setCountry } = props;

  return (
    <Toolbar>
      <Link href="/" color="inherit">
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <HomeIcon />
        </IconButton>
      </Link>

      <Typography variant="h6" className={classes.title}>{pageName}</Typography>

      <ChangeCountriesPopover country={country} setCountry={setCountry} />

      <Link href="https://github.com/hayeselnut/SENG3011_Linked_List" color="inherit" target="_blank">
        <IconButton className={classes.menuButton} color="inherit" aria-label="menu">
          <GitHubIcon />
        </IconButton>
      </Link>
    </Toolbar>
  );
}

export default EpiWatchToolBar;