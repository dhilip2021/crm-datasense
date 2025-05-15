import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Breadcrumbs, Card, CardContent } from '@mui/material'

import CreatLead from '@/views/leads/CreatLead'

// Components Imports

const CreateLead = () => {
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
          <Typography sx={{ color: 'text.primary' }}>Create Lead </Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CreatLead />
      </Grid>
    </Grid>
  )
}

export default CreateLead
