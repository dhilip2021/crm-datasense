import * as React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useTheme } from '@mui/material/styles'

import { Box, DialogContent, Grid, Slide, TextField } from '@mui/material'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

export default function AddTaxMasterPopup(props) {
  const { open, close, titles, inputs, handleChange, handleSubmit, errors, handleBlur, loader } = props

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        maxWidth={'md'}
        open={open}
        onClose={close}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby='responsive-dialog-title'
        PaperProps={{
          sx: {
            width: '100%', // Half screen width
            maxWidth: '450px', // Optional max width
            height: 'auto', // Auto height based on content
            borderRadius: 2 // Optional rounding
          }
        }}
      >
        <DialogTitle id='responsive-dialog-title' sx={{ bgcolor: '#009CDE', color: '#fff' }}>
          {titles}
          <i
            style={{
              position: 'absolute',
              right: '5%',
              top: '5%',
              fontSize: 20,
              cursor: 'pointer'
            }}
            onClick={close}
            className='ri-close-line'
          ></i>
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} mt={2} mb={2}>
                  <TextField
                    autoComplete='off'
                    name='tax_value'
                    placeholder='Please enter tax value'
                    fullWidth
                    id='outlined-basic'
                    label='Tax value'
                    variant='outlined'
                    type='number'
                    size='small'
                    value={inputs?.tax_value}
                    onChange={e => {
                      let val = e.target.value.replace(/[^0-9]/g, '')

                      // 🚫 Prevent leading zero (0, 01, 002...)
                      if (val.startsWith('0') && val.length > 1) {
                        val = val.replace(/^0+/, '') // remove all leading zeros
                      }
                      if (val === '0') {
                        val = '' // disallow just "0"
                      }

                      handleChange({ target: { name: 'tax_value', value: val } })
                    }}
                    onBlur={handleBlur}
                    error={Boolean(errors?.tax_value)}
                    helperText={errors?.tax_value && 'Please enter tax value'}
                    sx={{
                      '.MuiFormHelperText-root': { ml: 0 }
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2}>
            <Button color='primary' variant='outlined' onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loader}
              color='primary'
              variant='contained'
              sx={{ color: '#fff', ml: 2 }}
              type='submit'
            >
              {inputs._id === '' ? 'Submit' : 'Update'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
