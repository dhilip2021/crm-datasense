"use client"
import Link from 'next/link'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

// Components Imports

import UsersListTable from '@/views/tables/UsersListTable'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

const UsersList = () => {

   
    const router = useRouter()
    const { payloadJson } = useSelector(state => state.menu)
  
  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false;
  
    const found = payloadJson.find(
      m =>
        m.menu_privileage_name === 'Settings' &&
        m.sub_menu_privileage_name === 'User List'
    );
  
    return found?.view_status === true;
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
          <Typography sx={{ color: 'text.primary' }}>Users List </Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12} sm={6} md={12}>
        <UsersListTable />
      </Grid>
    </Grid>
  )
}

export default UsersList
