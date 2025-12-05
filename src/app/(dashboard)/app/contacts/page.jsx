'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import { Box } from '@mui/material'
import CardContacts from '@/views/contacts/CardContacts'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

const Calls = () => {
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Contacts' && m.sub_menu_privileage_name === '')

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
      <Grid item xs={12} sm={12} md={4}>
        <CardContacts />
      </Grid>
    </Box>
  )
}

export default Calls
