// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import ChangePasswordView from '@/views/changePassword/ChangePasswordView'




const ChangePassword = () => {



  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Change Password</Typography>
        <Divider />
      </Grid>

        <Grid item xs={12} md={12}>

        <ChangePasswordView />
        </Grid>
     
     
      
      
      
    </Grid>
  )
}

export default ChangePassword
