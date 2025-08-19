// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import CustomersTable from '@/views/customers/CustomersTable'

const Customers = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Customers</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CustomersTable />
      </Grid>
    </Grid>
  )
}

export default Customers
