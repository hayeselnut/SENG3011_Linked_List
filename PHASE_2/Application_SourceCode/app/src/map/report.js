import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: '80%',
    marginTop: '10rem',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: '1rem',
  },
  pos: {
    marginBottom: 12,
  },
  link: {
      width: '100%'
  }
});

export const Report = (props) => {
    const classes = useStyles();
    const { headline, url, eventDate } = props; 
    return (
        <Card variant="outlined" className={classes.root}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {eventDate}
                </Typography>
                <Typography variant="h5" component="h2">
                    {headline}
                </Typography>
                <a className={classes.link} variant="body2" component="a" href={url}>
                    Learn More
                </a>
            </CardContent>
        </Card>
    );
}