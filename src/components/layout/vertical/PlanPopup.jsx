import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function PlanPopup(props) {
    const { open, title, handlePopClose } = props




  return (
    <React.Fragment>
     
      <BootstrapDialog
        onClose={handlePopClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        
      >
   
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
         {title} Plan
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handlePopClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <i className="ri-close-line"></i>
        </IconButton>
     
        
       
       



        <DialogContent dividers>
          <Box>
          <Typography gutterBottom>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
            consectetur ac, vestibulum at eros.
          </Typography>
          </Box>
          
          {/* <Typography gutterBottom>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
          </Typography>
          <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
            magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
            ullamcorper nulla non metus auctor fringilla.
          </Typography> */}



        </DialogContent>


        <DialogActions>
          <Button autoFocus onClick={handlePopClose} className={title === "Gold" ? "golden-btn":"silver-btn"}>
           Buy
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
