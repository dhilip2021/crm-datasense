import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Breadcrumbs } from '@mui/material'

import LeadsTable from '@/views/leads/LeadsTable'

// Components Imports



const Leads = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Leads</Typography>
        </Breadcrumbs>
      </Grid>

       <Grid item xs={12}>
      <LeadsTable />
      </Grid>
      
      
      
    </Grid>
  )
}

export default Leads
