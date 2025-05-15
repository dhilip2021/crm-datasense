'use client';
import { useSelector } from 'react-redux';

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'





const Select = () => {

    const login = useSelector((state) => state.login); // assuming slice name is "login"



  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Select</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12}>
      <h1>Redux </h1>

      <p>Name: {login.payloadJson.user_name}</p>
      <p>Email: {login.payloadJson.email}</p>
      <p>message: {login.message}</p>
      
      </Grid>
      
      
      
    </Grid>
  )
}

export default Select
