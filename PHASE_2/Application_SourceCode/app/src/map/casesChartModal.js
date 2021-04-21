import React from 'react';
import { Button, Modal } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { CasesChart } from './casesChart';

const useStyles = makeStyles({
  paper: {
    width: '75%',
    outline: 0,
  },
});

const modalStyle = (
  {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  }
);

export const CasesChartModal = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const { state, recorded, predicted } = props;

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <>
      <Button onClick={handleOpen}>Show cases for {state}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-for-cases-chart"
        aria-describedby="modal-for-cases-chart"
      >
        <div className={classes.paper} style={modalStyle}>
          <CasesChart state={state} recorded={recorded} predicted={predicted} />
        </div>
      </Modal>
    </>
  );
}