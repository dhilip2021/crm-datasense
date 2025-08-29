// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import RolesTable from '@/views/roles/RolesTable'

const Roles = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Roles</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <RolesTable />
      </Grid>
    </Grid>
  )
}

export default Roles
