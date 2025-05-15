// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Box } from '@mui/material'

import CardNotes from '@/views/notes/CardNotes'

// Components Imports



const Notes = () => {
  return (
    <Box>
      <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Notes</Typography>
        <Divider />
      </Grid>
      </Grid>
      {/* <Grid item xs={12} sm={12} md={4}> */}
        <CardNotes />
      {/* </Grid> */}

    
    </Box>
    
  )
}

export default Notes
