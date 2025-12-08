'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import TaxMasterTable from '@/views/tax-master/TaxMasterTable'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const TaxMaster = () => {
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

  const hasAddPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false
    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Master' && m.sub_menu_privileage_name === 'Tax Master'
    )
    return found?.add_status === true
  }

  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false
    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Master' && m.sub_menu_privileage_name === 'Tax Master'
    )
    return found?.view_status === true
  }

  const hasEditPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false
    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Master' && m.sub_menu_privileage_name === 'Tax Master'
    )
    return found?.edit_status === true
  }

  const hasDeletePermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false
    const found = payloadJson.find(
      m => m.menu_privileage_name === 'Master' && m.sub_menu_privileage_name === 'Tax Master'
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
          <Typography sx={{ color: 'text.primary' }}>Tax Master</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <TaxMasterTable
          hasAddPermission={hasAddPermission}
          hasViewPermission={hasViewPermission}
          hasEditPermission={hasEditPermission}
          hasDeletePermission={hasDeletePermission}
        />
      </Grid>
    </Grid>
  )
}

export default TaxMaster
