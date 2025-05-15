// MUI Imports
import Grid from '@mui/material/Grid'

import NotesDataPageContainer from './NotesDataPageContainer'

// Component Imports


const NotesData = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <NotesDataPageContainer />
      </Grid>
    </Grid>
  )
}

export default NotesData
