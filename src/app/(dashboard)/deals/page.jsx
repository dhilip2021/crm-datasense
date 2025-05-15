import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

import DealsTable from '@/views/deals/DealsTable'

// Components Imports



const Deals = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Deals</Typography>
        </Breadcrumbs>
      </Grid>

       <Grid item xs={12}>
      <DealsTable />
      </Grid>
      
      
      
    </Grid>
  )
}

export default Deals
