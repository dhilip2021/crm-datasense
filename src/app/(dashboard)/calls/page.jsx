'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import CardCalls from '@/views/calls/CardCalls'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

const Calls = () => {
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

  const hasAddPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Calls' && m.sub_menu_privileage_name === '')

    return found?.add_status === true
  }

  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Calls' && m.sub_menu_privileage_name === '')

    return found?.view_status === true
  }
  const hasEditPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Calls' && m.sub_menu_privileage_name === '')

    return found?.edit_status === true
  }
  const hasDeletePermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Calls' && m.sub_menu_privileage_name === '')

    return found?.delete_status === true
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
      <Grid item xs={12} sm={12} md={4}>
        <CardCalls
          hasAddPermission={hasAddPermission}
          hasViewPermission={hasViewPermission}
          hasEditPermission={hasEditPermission}
          hasDeletePermission={hasDeletePermission}
        />
      </Grid>
    </Box>
  )
}

export default Calls
