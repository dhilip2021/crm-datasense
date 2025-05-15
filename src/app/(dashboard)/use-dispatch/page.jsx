'use client';
import { useSelector, useDispatch } from 'react-redux';



// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Button } from '@mui/material';

import { increment, decrement } from '../../store/counterSlice';





const Dispatch = () => {


    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Dispatch</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12}>
      <h1>Redux Counter</h1>
      <p>Count: {count}</p>
      <Button 
      
      variant='contained'
      color='success'
      onClick={() => dispatch(increment())}
      >
        Add 
      </Button>
      <Button 
      
      variant='contained'
      color='error'
      onClick={() => dispatch(decrement())}
      >
        REmove 
      </Button>
      
      </Grid>
      
      
      
    </Grid>
  )
}

export default Dispatch
