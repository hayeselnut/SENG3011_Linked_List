import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
// import { Line } from 'react-chartjs-2';
import {Chart} from 'chart.js'

const useStyles = makeStyles({
  root: {
    width: '90%',
  },
});

const getChartConfig = (data) => ({
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Covid Cases'
            }
        }
    }
});

const red = "#f44336"

const data = {
    labels: [...Array(62).keys()],
    datasets: [
        {
            label: 'Recorded',
            data: [...Array(62).keys()],
            borderColor: red
            // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
            // pointBorderColor: '#922893',
            // pointBackgroundColor: "transparent"
        },
        {
            label: 'Recorded and Predicted',
            borderDash: [5, 5],
            // borderWidth: 1,
            data: [...Array(31).keys()],
            borderColor: red
            // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        }
    ]
};

export const CasesChart = (props) => {
    const classes = useStyles();

    return (
        <Card variant="outlined" className={classes.root}>
            <CardContent>
                <img src="./casesChart.png" width="100%"/>
            </CardContent>
        </Card>
    );
}