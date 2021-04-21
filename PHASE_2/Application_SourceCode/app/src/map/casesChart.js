import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ReactApexChart from 'react-apexcharts';

const useStyles = makeStyles({
  root: {
    width: '90%',
  },
});

const options = {}

export const CasesChart = (props) => {
  const classes = useStyles();

  const series = [
    {
      name: "Cases",
      data: [28, 29, 33, 36, 32, 32, 33],
    },
  ];

  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        {/* <img src="./casesChart.png" width="100%"/> */}
        <ReactApexChart options={options} series={series} type="line" />
      </CardContent>
    </Card>
  );
}