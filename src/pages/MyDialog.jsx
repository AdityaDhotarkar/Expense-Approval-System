import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

function MyDialog(props) {
  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        //PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          {props.dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{props.dialogText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleDefault} className="btn btn-primary">
            {props.defaultBtnText}
          </Button>
          <Button
            autoFocus
            onClick={props.handleClose}
            className="btn btn-secondary"
          >
            {props.cancelBtnText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyDialog;
