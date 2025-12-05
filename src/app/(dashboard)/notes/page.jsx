'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Box } from '@mui/material'

import CardNotes from '@/views/notes/CardNotes'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

// Components Imports



const Notes = () => {

   const router = useRouter()
    const { payloadJson } = useSelector(state => state.menu)
  
    const hasViewPermission = () => {
      if (!payloadJson || payloadJson.length === 0) return false
  
      const found = payloadJson.find(m => m.menu_privileage_name === 'Notes' && m.sub_menu_privileage_name === '')
  
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
    <Box>
      {/* <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Notes</Typography>
        <Divider />
      </Grid>
      </Grid> */}
      <Grid item xs={12} sm={12} md={4}>
        <CardNotes />
      </Grid>

    
    </Box>
    
  )
}

export default Notes
