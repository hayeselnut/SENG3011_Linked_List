import React from 'react';
import { Modal, IconButton } from "@material-ui/core";
import GraphIcon from '@material-ui/icons/Assessment';
import { makeStyles } from '@material-ui/core/styles';
import { CasesChart } from './casesChart';

const useStyles = makeStyles(theme => ({
  paper: {
    // width: '75%',
    // height: '75%',
  },
  menuButton: {
    marginRight: theme.spacing(6),
  },
}));

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

export const CasesChartModal = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const { state, recorded, predicted } = props;

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton
        className={classes.menuButton}
        color="inherit"
        aria-label="show-cases-chart"
        disabled={recorded === undefined || predicted === undefined}
        onClick={handleOpen}
      >
        <GraphIcon />
      </IconButton>

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