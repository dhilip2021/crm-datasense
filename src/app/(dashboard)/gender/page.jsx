// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import GenderTable from '@/views/gender/GenderTable'

const Gender = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Gender</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <GenderTable />
      </Grid>
    </Grid>
  )
}

export default Gender
