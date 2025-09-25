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

export default function AddCampaignTypePopup(props) {
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
        PaperProps={{
          sx: {
            width: "100%", // Half screen width
            maxWidth: "450px", // Optional max width
            height: "auto", // Auto height based on content
            borderRadius: 2, // Optional rounding
          },
        }}
      >
        <DialogTitle
          id="responsive-dialog-title"
          sx={{ bgcolor: "#009CDE", color: "#fff" }}
        >
          {titles}
          <i 
          style={{
            position: "absolute",
            right: "5%",
            top: "5%",
            fontSize: 20,
            cursor: "pointer",
          }}
          onClick={close}
          className="ri-close-line"></i>
          
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} mt={2} mb={2}>
                  <TextField
                    autoComplete="off"
                    name="campaign_name" 
                    placeholder="please enter campaign name"
                    fullWidth
                    id="outlined-basic"
                    label="campaign name"
                    variant="outlined"
                    type="text"
                    size="small"
                    value={inputs?.campaign_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.campaign_name}
                    helperText={errors?.campaign_name && `Please enter campaign name`}
                    sx={{
                      ".MuiFormHelperText-root": {
                        ml: 0,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} mt={2} mb={2}>
                  <TextField
                    multiline
                    rows={3}
                    autoComplete="off"
                    name="description" 
                    placeholder="please enter description"
                    fullWidth
                    id="outlined-basic"
                    label="Description"
                    variant="outlined"
                    type="text"
                    size="small"
                    value={inputs?.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors?.description}
                    helperText={errors?.description && `Please enter Description`}
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
