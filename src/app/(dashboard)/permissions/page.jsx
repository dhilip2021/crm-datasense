// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import PermissionView from '@/views/permissions/PermissionView'

const Permissions = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Permissions</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <PermissionView />
      </Grid>
    </Grid>
  )
}

export default Permissions
