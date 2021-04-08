import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: '90%',
  },
  pos: {
    marginBottom: 12,
  },
});

export const Report = (props) => {
    const classes = useStyles();
    const { result, headline, url, eventDate } = props;
    return result
        ? (
            <Card variant="outlined" className={classes.root} align="left">
                <CardContent>
                    <Typography variant="caption" color="textSecondary">
                        {eventDate}
                    </Typography>
                    <Typography variant="body2">
                        {headline}
                    </Typography>
                    <Link variant="caption" target="_blank" href={url}>Learn more</Link>
                </CardContent>
            </Card>
        )
        : (
            <Card variant="outlined" className={classes.root}>
                <CardContent>
                    <Typography variant="body2">
                        No reports found
                    </Typography>
                </CardContent>
            </Card>
        )
}