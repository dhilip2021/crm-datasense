'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TaskList from '@/views/task/TaskList'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

// Components Imports

const Tasks = () => {
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Calls' && m.sub_menu_privileage_name === '')

    return found?.view_status === true
  }

  useEffect(() => {
    if (payloadJson.length > 0) {
      if (!hasViewPermission()) {
        router.push('/')
      }
    }
  }, [payloadJson])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TaskList />
      </Grid>
    </Grid>
  )
}

export default Tasks
