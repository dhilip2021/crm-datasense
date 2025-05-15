import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

import FieldListPageContainer from '@/views/fields/FieldListPageContainer'

// Components Imports

const ListFileld = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/fields/list-fields'>
            Fields
          </Link>
          <Typography sx={{ color: 'text.primary' }}>List</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <FieldListPageContainer />
      </Grid>
    </Grid>
  )
}

export default ListFileld
