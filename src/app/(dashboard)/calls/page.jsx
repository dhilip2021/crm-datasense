// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CardCalls from '@/views/calls/CardCalls'
import { Box } from '@mui/material'

const Calls = () => {
  return (
      <Box>
        <Grid item xs={12} sm={12} md={4}>
          <CardCalls />
        </Grid>
      </Box>
  )
}

export default Calls
