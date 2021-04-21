import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ReactApexChart from 'react-apexcharts';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const convertToMonthDay = (date) => {
  const splittedDate = date.toDateString().split(" ");
  return `${splittedDate[1]} ${splittedDate[2]}`;
}

const sevenDaysBeforeAndAfter = () => {
  return [...Array(14).keys()]
    .map(d => d - 7)
    .map(d => new Date(Date.now() + (d) * 24 * 60 * 60 * 1000))
    .map(convertToMonthDay);
}

export const CasesChart = (props) => {
  const classes = useStyles();

  const { state, recorded, predicted } = props;

  const options = {
    chart: {
      type: 'line',
      zoom: {
        enabled: false
      },
      animations: {
        enabled: false
      },
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      marker: false
    },
    stroke: {
      curve: 'smooth',
      colors: ['#f44336'],
    },
    title: {
      text: `Covid-19 Cases in ${state}`,
      align: 'middle'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    annotations: {
      xaxis: [{
        x: convertToMonthDay(new Date()),
        x2: convertToMonthDay(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
        fillColor: '#e0e0e0',
        opacity: 0.4,
        borderColor: '#212121',
        label: {
          borderColor: '#212121',
          style: {
            color: '#eeeeee',
            background: '#212121',
          },
          text: "Next week's projection",
        }
      }],
    },
    xaxis: {
      categories: sevenDaysBeforeAndAfter(),
    }
  }

  const series = [
    {
      name: "Cases",
      data: recorded.slice(-7).concat(predicted.slice(0, 7)),
    }
  ];

  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        <ReactApexChart options={options} series={series} type="line" />
      </CardContent>
    </Card>
  );
}