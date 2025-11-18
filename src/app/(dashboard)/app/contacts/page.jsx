// MUI Imports
import Grid from '@mui/material/Grid'
import { Box } from '@mui/material'
import CardContacts from '@/views/contacts/CardContacts'

const Calls = () => {
  return (
      <Box>
        <Grid item xs={12} sm={12} md={4}>
          <CardContacts />
        </Grid>
      </Box>
  )
}

export default Calls
