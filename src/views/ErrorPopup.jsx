import * as React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { Box, DialogContent, Grid, Slide, TextField, Typography } from '@mui/material'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

export default function ErrorPopup(props) {
  const { open, close, title, trailVal } = props

   

  const regexSplit =title !== "" && title.match(/[^.]+[.?!]?/g).map(s => s.trim())

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        maxWidth={'md'}
        open={open}
        onClose={(e)=>close(trailVal)}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby='responsive-dialog-title'
        PaperProps={{
          sx: {
            width: '50%', // Half screen width
            maxWidth: '600px', // Optional max width
            height: 'auto', // Auto height based on content
            borderRadius: 2 // Optional rounding
          }
        }}
      >
        <DialogTitle id='responsive-dialog-title' sx={{ bgcolor: '#ff5757', color: '#fff' }}>
          Warning
          <i
            style={{
              position: 'absolute',
              right: '5%',
              top: '5%',
              fontSize: 30,
              cursor: 'pointer'
            }}
            onClick={(e)=>close(trailVal)}
            className='ri-close-line'
          ></i>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              backgroundColor: '#fff0f0',
              border: '1px solid red',
              color: '#d32f2f',
              borderRadius: '8px',
              padding: '16px 24px',
              maxWidth: '500px',
              margin: '40px auto',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
              {regexSplit[0]}
            </Typography>
            <Typography variant='body1'>{regexSplit[1]}</Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Box
            display='flex'
            justifyContent='center' // Center horizontally
            alignItems='center' // Center vertically (optional)
            width='100%'
            px={2}
          >
            <Button color='error' variant='outlined' onClick={(e)=>close(trailVal)}>
              OK
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
