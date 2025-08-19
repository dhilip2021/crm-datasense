import Link from 'next/link'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs, Card, CardContent } from '@mui/material'

import CreateCustomers from '@/views/customers/CreateCustomer'

// Components Imports

const CreateCustomerPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/customers'>
            customers
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Create Customer </Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CreateCustomers />
      </Grid>
    </Grid>
  )
}

export default CreateCustomerPage
