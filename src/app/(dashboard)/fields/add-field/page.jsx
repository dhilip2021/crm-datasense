import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

import AddFieldPage from '@/views/fields/AddFieldPage'


// Components Imports



const AddFileld = () => {
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
          <Typography sx={{ color: 'text.primary' }}>Add</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12}>
        <AddFieldPage />
        </Grid>
      
      
    </Grid>
  )
}

export default AddFileld
