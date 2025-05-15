import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

// Components Imports

import UsersListTable from '@/views/tables/UsersListTable'

const UsersList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Users List </Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12} sm={6} md={12}>
        <UsersListTable />
      </Grid>
    </Grid>
  )
}

export default UsersList
