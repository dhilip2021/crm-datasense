'use client'
import Link from 'next/link'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

// Component Imports
import UserTable from '@/views/users/UserTable'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const EditUser = () => {
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

  const hasAddPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Settings' && m.sub_menu_privileage_name === 'User List'
    )

    return found?.add_status === true
  }

  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Settings' && m.sub_menu_privileage_name === 'User List'
    )

    return found?.view_status === true
  }
  const hasEditPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Settings' && m.sub_menu_privileage_name === 'User List'
    )

    return found?.edit_status === true
  }
  const hasDeletePermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Settings' && m.sub_menu_privileage_name === 'User List'
    )

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
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>

          <Typography sx={{ color: 'text.primary' }}>Edit User</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <UserTable
          hasAddPermission={hasAddPermission}
          hasViewPermission={hasViewPermission}
          hasEditPermission={hasEditPermission}
          hasDeletePermission={hasDeletePermission}
          type="edit"
        />
      </Grid>
    </Grid>
  )
}

export default EditUser
