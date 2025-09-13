// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TaskList from '@/views/task/TaskList'

// Components Imports



const Tasks = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TaskList />
      </Grid>
      
    </Grid>
  )
}

export default Tasks
