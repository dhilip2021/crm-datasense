import Link from 'next/link'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'


// Component Imports
import UserTable from '@/views/users/UserTable'

const EditUser = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          
          <Typography sx={{ color: 'text.primary' }}>Edit User </Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
      <UserTable />
      </Grid>

      
      
      
    </Grid>
  )
 
}

export default EditUser

