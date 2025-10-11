// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import SalesFunnelChart from '@/views/dashboard/SalesFunnelChart'
import KanbanView from '@/views/dashboard/KanbanView'
import TopAccountsCard from '@/views/dashboard/TopAccountsCard'
import DealAgingAnalysis from '@/views/dashboard/DealAgingAnalysis'
import SmartAlertsCard from '@/views/dashboard/SmartAlertsCard'

const Opportunity = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Opportunity Dashboard</Typography>
      </Grid>
      <Grid item xs={12}>
        <KanbanView />
      </Grid>
      <Grid item xs={6}>
        <SalesFunnelChart />
      </Grid>

       <Grid item xs={6}>
        <TopAccountsCard />
      </Grid>
    
          <Grid item xs={6}>
            <DealAgingAnalysis />
          </Grid>
    
          <Grid item xs={6}>
            <SmartAlertsCard />
          </Grid>


    </Grid>
  )
}

export default Opportunity
