import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useTheme } from "@mui/material/styles";

import {
  Box,
  DialogContent,
  Grid,
  Slide,
  TextField,
} from "@mui/material";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddNotesPopup(props) {
  const {
    open,
    close,
    titles,
    inputs,
    handleChange,
    handleSubmit,
    errors,
    handleBlur,
    loader
  } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        maxWidth={"md"}
        open={open}
        onClose={close}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="responsive-dialog-title"
        // className="web-story-pop"
        PaperProps={{
          sx: {
            width: "50%", // Half screen width
            maxWidth: "600px", // Optional max width
            height: "auto", // Auto height based on content
            borderRadius: 2, // Optional rounding
          },
        }}
      >
        <DialogTitle
          id="responsive-dialog-title"
          sx={{ bgcolor: "#8C57FF", color: "#fff" }}
        >
          {titles}
          <i 
          style={{
            position: "absolute",
            right: "5%",
            top: "5%",
            fontSize: 30,
            cursor: "pointer",
          }}
          onClick={close}
          className="ri-close-line"></i>
          
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="off"
                    name="title" // ✅ must be a string
                    placeholder="please enter your title"
                    fullWidth
                    id="outlined-basic"
                    label="Title"
                    variant="outlined"
                    type="text"
                    size="small"
                    value={inputs?.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.title}
                    helperText={errors?.title && `Please enter title`}
                    sx={{
                      ".MuiFormHelperText-root": {
                        ml: 0,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="off"
                    placeholder="please enter your comment..."
                    fullWidth
                    id="outlined-basic"
                    label="comment"
                    variant="outlined"
                    type="text"
                    name="comment"
                    size="small"
                    value={inputs?.comment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={5}
                    error={errors?.comment}
                    helperText={errors?.comment && `Please enter comment`}
                    sx={{
                      ".MuiFormHelperText-root": {
                        ml: 0,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"100%"}
            pl={2}
            pr={2}
          >
            <Button
              color="primary"
              variant="outlined"
                // disabled={imageLoader}
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loader}
              color="primary"
              variant="contained"
              sx={{ color: "#fff", ml: 2 }}
              type="submit"
            >
              {inputs._id === "" ? "Submit" : "Update"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
