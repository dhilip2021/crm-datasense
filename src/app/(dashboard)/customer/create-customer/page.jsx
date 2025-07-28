import Link from 'next/link'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs, Card, CardContent } from '@mui/material'

import CreatCustomer from '@/views/customer/CreateCustomer'

// Components Imports

const CreateCustomer = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/leads'>
            Leads
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Create Customer </Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CreatCustomer />
      </Grid>
    </Grid>
  )
}

export default CreateCustomer
