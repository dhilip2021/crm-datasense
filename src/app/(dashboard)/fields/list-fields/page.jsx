import { useEffect } from 'react'

import Link from 'next/link'
import Cookies from 'js-cookie'

import { getUserListApi } from '@/apiFunctions/ApiAction'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'

import FieldListPageContainer from '@/views/fields/FieldListPageContainer'

import { removeCredentials } from '@/helper/frontendHelper'

// Components Imports

const ListFileld = () => {
  
    const user_id = Cookies.get('user_id')
    const getToken = Cookies.get('_token')
  
    const getUserListFn = async userId => {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      try {
        const results = await getUserListApi(userId, header)
        console.log(results?.payloadJson[0]?.n_status, '<<< N STATUS')
        if (results?.payloadJson[0]?.n_status === 0) {
          removeCredentials()
        }
      } catch (err) {
        console.log(err)
      }
    }
  
    useEffect(() => {
      console.log(user_id, 'ROLE IDDDD')
      if (user_id !== undefined) {
        getUserListFn(user_id)
      }
    }, [user_id])
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/fields/list-fields'>
            Fields
          </Link>
          <Typography sx={{ color: 'text.primary' }}>List</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
        <FieldListPageContainer />
      </Grid>
    </Grid>
  )
}

export default ListFileld
