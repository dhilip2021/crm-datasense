// ** React Imports




import { Box, Button, Card, CardContent, Grid, InputAdornment, MenuItem, Select, TextField } from '@mui/material'





const LeadDetails = ({loader, inputs, handleChange, errors, handleBlur, handleClick, handleSubmit,leadDatas, convertDealFn}) => {

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Box mb={2}>
      <Button  fullWidth variant='contained' color='primary'  
      onClick={() => convertDealFn(leadDatas[0]?._id, leadDatas[0]?.lead_name, "converted the lead to this deal")}
      
      > Convert To Deal</Button>
      </Box>
          
        {!loader && Array.isArray(inputs) && inputs?.length > 0 && (
          <Card className='bs-full'>
            <CardContent>
              <Box pt={2}>
                <Box>
                  <Grid container spacing={6}>
                    {Array.isArray(inputs) &&
                      inputs?.map((item, index) => (
                        <>
                          {item?.type === 'text' && (
                            <Grid item xs={12}>
                              <TextField
                                autoComplete='off'
                                fullWidth
                                id='outlined-basic'
                                label={`${item?.label} ${item?.mandatory === 'yes' ? '*' : ''}`}
                                variant='outlined'
                                type='text'
                                name={item?.slug_label}
                                size='small'
                                value={item?.value}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors?.includes(item?.slug_label)}
                                helperText={errors?.includes(item?.slug_label) && `Please enter ${item?.label}`}
                                sx={{
                                  '.MuiFormHelperText-root': {
                                    ml: 0
                                  }
                                }}
                              />
                            </Grid>
                          )}
                          {item?.type === 'select' && (
                            <Grid item xs={12}>
                              <TextField
                                select
                                fullWidth
                                id='outlined-basic'
                                label={`${item?.label} ${item?.mandatory === 'yes' ? `*` : ''}`}
                                variant='outlined'
                                type='text'
                                name={item?.slug_label}
                                size='small'
                                value={item?.value}
                                onChange={handleChange}
                                error={errors?.includes(item?.slug_label)}
                                helperText={errors?.includes(item?.slug_label) && `Please select ${item?.label}`}
                                sx={{
                                  '.MuiFormHelperText-root': {
                                    ml: 0
                                  }
                                }}
                              >
                                {item?.items?.map((list, ids) => (
                                  <MenuItem value={list?.menu_value} key={ids}>
                                    {list?.menu_value}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                          )}
                        </>
                      ))}
                  </Grid>
                </Box>
              </Box>

              <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2} mt={4}>
                <Button color='primary' variant='outlined' onClick={handleClick}>
                  Cancel
                </Button>
                <Button
                  disabled={loader}
                  onClick={handleSubmit}
                  color='primary'
                  variant='contained'
                  sx={{ color: '#fff', ml: 2 }}
                  type='submit'
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      

      

      
     

     
    </Box>
  )
}

export default LeadDetails
