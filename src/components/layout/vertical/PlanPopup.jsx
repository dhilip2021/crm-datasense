import * as React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
// import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography'
import { Box, Card, CardContent } from '@mui/material'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export default function PlanPopup(props) {
  const { open, title, handlePopClose } = props

  return (
    <React.Fragment>
      <BootstrapDialog onClose={handlePopClose} aria-labelledby='customized-dialog-title' open={open}>
        
            <Box p={5}>
            <IconButton
          aria-label='close'
          onClick={handlePopClose}
          sx={theme => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          })}
        >
          <i className='ri-close-line'></i>
        </IconButton>
            </Box>

        <DialogContent>
       
          <Box className='plan-card'>
            <h2 class='plan-title'>{title} Plan</h2>
            {title === 'Gold' ? 
            <Box>

<p className='plan-price'>
              $50<span>/year</span>
            </p>
            <ul className='plan-features'>
              <li>✅ Unlimited Users</li>
              <li>✅ 1 year Support </li>
              <li>✅ Priority Support</li>
            </ul>
            </Box>
            : 
            <Box>
                 <p className='plan-price'>
              $10<span>/month</span>
            </p>
            <ul className='plan-features'>
              <li>✅ 100 Users</li>
              <li>✅ 6 months Support </li>
              <li>✅ Priority Support</li>
            </ul>
            </Box>
            }
           

            <Button autoFocus onClick={handlePopClose} className={title === 'Gold' ? 'golden-btn' : 'silver-btn'}>
              Buy
            </Button>
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
      </BootstrapDialog>
    </React.Fragment>
  )
}
