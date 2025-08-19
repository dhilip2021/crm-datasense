// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import CampaignTypeTable from '@/views/campaign-type/CampaignTypeTable'

const CampaignType = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Campaign Type</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <CampaignTypeTable />
      </Grid>
    </Grid>
  )
}

export default CampaignType
