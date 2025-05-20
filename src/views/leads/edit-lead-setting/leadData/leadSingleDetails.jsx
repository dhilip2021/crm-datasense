import React from 'react'

// ** React Imports

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'

function activeColor(value) {
  switch (value) {
    case 'New':
      return '#9c27b0'
    case 'Contacted':
      return '#e91e63'
    case 'Nurture':
      return '#009688'
    case 'Qualified':
      return '#1976d2'
    case 'Unqualified':
      return '#f44336'
    case 'Junk':
      return '#009688'
    case 'Qualification':
      return '#001f3f'
    case 'Demo/Making':
      return '#00bfff'
    case 'Proposal/Quotation':
      return '#ffeb3b'
    case 'Negotiation':
      return '#ff9800'
    case 'Ready to Close':
      return '#009688'
    case 'Won':
      return '#4caf50'
    case 'Lost':
      return '#8B0000'

    default:
      return 'info'
  }
}

const LeadSingleDetails = ({ loader, inputs }) => {
  console.log(inputs, '<<< INPUTSSS')
  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      {!loader && Array.isArray(inputs) && inputs?.length > 0 && (
        <Card className='bs-full'>
          <CardContent>
            <Box pt={2}>
              <Box>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={2}>
                      <Typography variant='h5'>Person Details:</Typography>

                      <Button
                        variant='contained'
                        sx={{
                          backgroundColor: activeColor(inputs[14]?.value),
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: activeColor(inputs[14]?.value)
                          }
                        }}
                      >
                        {' '}
                        {inputs[14]?.value}
                      </Button>
                    </Box>
                    <Divider />
                  </Grid>

                        {
                          Array.isArray(inputs) && inputs?.slice(0,7)?.map((item, index) =>
                            <Grid item xs={6} key={index}>
                          <Box display={'flex'} gap={2}>
                            <Grid item xs={3}>
                              <Typography variant='h6' color={'#a7a7a7'}>
                                <Box display={'flex'} justifyContent={'space-between'}>
                                  <span>{item?.label}</span>
                                  <span>:</span>
                                </Box>
                              </Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant='h6'>
                               {item?.value}
                              </Typography>
                            </Grid>
                          </Box>
                        </Grid>
                          )
                        }

                  
                 

                  {/* ****************************************** DETAILS ********************************************** */}

                  <Grid item xs={12}>
                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mt={4} mb={2}>
                      <Typography variant='h5'>Organization Details :</Typography>
                    </Box>
                    <Divider />
                  </Grid>

                  {
                          Array.isArray(inputs) && inputs?.slice(7,15)?.map((item, index) =>
                            <Grid item xs={6} key={index}>
                          <Box display={'flex'} gap={2}>
                            <Grid item xs={3}>
                              <Typography variant='h6' color={'#a7a7a7'}>
                                <Box display={'flex'} justifyContent={'space-between'}>
                                  <span>{item?.label}</span>
                                  <span>:</span>
                                </Box>
                              </Typography>
                            </Grid>
                            <Grid item xs={9}>
                              <Typography variant='h6'>
                               {item?.value}
                              </Typography>
                            </Grid>
                          </Box>
                        </Grid>
                          )
                        }
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default LeadSingleDetails
