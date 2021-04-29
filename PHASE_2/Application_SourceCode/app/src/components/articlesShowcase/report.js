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
    margin: '1em',
  },
  pos: {
    marginBottom: 12,
  },
});

export const Report = (props) => {
  const classes = useStyles();
  const { article } = props;
  return (
      <Card variant="outlined" className={classes.root} align="left">
        <CardContent>
          <Typography variant="caption" color="textSecondary">
            {article.reports[0].event_date?.split('T')[0]}
          </Typography>
          <Typography variant="body2">
            {article.headline}
          </Typography>
          <Link variant="caption" target="_blank" href={article.url}>Learn more</Link>
        </CardContent>
      </Card>
    )
    // : (
    //   <Card variant="outlined" className={classes.root}>
    //     <CardContent>
    //       <Typography variant="body2">
    //         No reports found
    //       </Typography>
    //     </CardContent>
    //   </Card>
    // )
}