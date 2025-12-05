"use client"
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import CategoryMasterTable from '@/views/category-master/CategoryMasterTable'

const CategoryMaster = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Category Master</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CategoryMasterTable />
      </Grid>
    </Grid>
  )
}

export default CategoryMaster
