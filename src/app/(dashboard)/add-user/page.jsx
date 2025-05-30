import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'


import UserTable from '@/views/users/UserTable'

const AddUser = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Add User</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12} md={12}>
        <UserTable />
      </Grid>
      
    </Grid>
  )
}

export default AddUser
