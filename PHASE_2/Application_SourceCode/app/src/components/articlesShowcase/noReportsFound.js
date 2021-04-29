import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: '90%',
    margin: '1em',
  },
  pos: {
    marginBottom: 12,
  },
});

const NoReportsFound = (props) => {
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        <Typography variant="body2">
          No reports found
        </Typography>
      </CardContent>
    </Card>
    )
}

export default NoReportsFound;
