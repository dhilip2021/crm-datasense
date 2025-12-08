"use client"
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import RolesAndPermissionView from '@/views/roles-permission/RolesAndPermissionView'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RolesAndPermission = () => {
  
  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

const hasAddPermission = () => {
  if (!payloadJson || payloadJson.length === 0) return false;

  const found = payloadJson.find(
    m =>
      m.menu_privileage_name === 'Settings' &&
      m.sub_menu_privileage_name === 'Roles & Permission'
  );

  return found?.add_status === true;
};

const hasViewPermission = () => {
  if (!payloadJson || payloadJson.length === 0) return false;

  const found = payloadJson.find(
    m =>
      m.menu_privileage_name === 'Settings' &&
      m.sub_menu_privileage_name === 'Roles & Permission'
  );

  return found?.view_status === true;
};
const hasEditPermission = () => {
  if (!payloadJson || payloadJson.length === 0) return false;

  const found = payloadJson.find(
    m =>
      m.menu_privileage_name === 'Settings' &&
      m.sub_menu_privileage_name === 'Roles & Permission'
  );

  return found?.edit_status === true;
};
const hasDeletePermission = () => {
  if (!payloadJson || payloadJson.length === 0) return false;

  const found = payloadJson.find(
    m =>
      m.menu_privileage_name === 'Settings' &&
      m.sub_menu_privileage_name === 'Roles & Permission'
  );

  return found?.delete_status === true;
};

  useEffect(() => {
  if (payloadJson.length > 0) {
    if (!hasViewPermission()) {
      router.push('/');
    }
  }
}, [payloadJson]);




  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Roles & Permissions</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <RolesAndPermissionView 
        hasAddPermission={hasAddPermission}
        hasViewPermission={hasViewPermission}
        hasEditPermission={hasEditPermission}
        hasDeletePermission={hasDeletePermission}
        />
      </Grid>
    </Grid>
  )
}

export default RolesAndPermission
