'use client'

import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Typography, useTheme, Paper, Badge } from '@mui/material'
import classnames from 'classnames'
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import PlanPopup from './PlanPopup'
import { converDayJsDatewithOutTime, encryptCryptoRes } from '@/helper/frontendHelper'
import { useSelector } from 'react-redux'
import NotificationDrawer from './NotificationDrawer'
import { addNotification, clearAllNotification, listNotification } from '@/apiFunctions/ApiAction'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

const NavbarContent = ({ c_version, endedAt }) => {
   const router =useRouter();
  const getToken = Cookies.get('_token')
  const c_user_id = Cookies.get('user_id')
 
  const { payloadJson } = useSelector(state => state.login)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [notiData, setNotiData] = useState([])
  const [notiCount, setNotiCount] = useState(0)
  // 👉 Notification Drawer State
  const [notificationOpen, setNotificationOpen] = useState(false)
  const theme = useTheme()

  const handlePopClose = () => {
    setOpen(false)
    setTitle('')
  }
  const handlePopChange = plan => {
    setOpen(true)
    setTitle(plan)
  }

  const getNotificationList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const body = {
      c_user_id: c_user_id,
      c_read_status: 0,
      n_page: 1,
      n_limit: 10,
      c_search_term: ''
    }
    try {
      const results = await listNotification(body, header)


      if (results?.appStatusCode === 0) {
        setNotiData(results?.payloadJson[0]?.data)
        setNotiCount(results?.payloadJson[0]?.total_count?.at(0)?.count)
      } else {
        setNotiData([])
        setNotiCount(0)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const clearNotificationFn = async id => {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      try {
        const results = await clearAllNotification(id, header)

        getNotificationList()
      } catch (err) {
        console.log(err)
      }
    }

  const addNotificationFn = async body => {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      try {
        const results = await addNotification(body, header)
        getNotificationList()
      } catch (err) {
        console.log(err)
      }
    }

   const handleClick = item => {
        console.log(item, '<<< itemmmmmm body')
      const body = {
        Id: item?._id,
        c_send_to: [
          {
            c_user_id: item?.c_send_to[0]?.c_user_id,
            c_read_status: 1
          }
        ]
      }
      router.push(`/view/lead-form/${encodeURIComponent(encryptCryptoRes(item?.c_link))}`)
      addNotificationFn(body)
      handlePopClose()
      setNotificationOpen(false)
    }

    const clearAll=()=>{
      clearNotificationFn(c_user_id)
      setNotificationOpen(false)
    }

  useEffect(() => {
    getNotificationList()
  }, [])

  return (
    <Box
      className={classnames(verticalLayoutClasses.navbarContent)}
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      gap={2}
      width='100%'
      px={2}
    >
      {/* Left Content */}
      <Box display='flex' alignItems='center' gap={2}>
        <NavToggle />
      </Box>

      {/* Trial Banner */}
      {c_version === 'Trial' && (
        <Paper
          elevation={2}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
            backgroundColor: theme.palette.error.extraLight || '#fff5f5',
            maxWidth: 800
          }}
        >
          <Typography variant='body1' fontWeight='bold' color='error.main' textAlign='center'>
            Hello {payloadJson?.user_name || 'Guest'}, your trial version for <b>{payloadJson?.organization_name}</b> is
            active for <b>14 Days</b> and will expire on <br />
            <Typography component='span' fontWeight='bold' sx={{ textDecoration: 'underline' }}>
              {converDayJsDatewithOutTime(endedAt)}
            </Typography>
          </Typography>

          {/* <Box mt={1} display='flex' gap={2}>
            <Button variant='contained' color='warning' onClick={() => handlePopChange("Gold")}>Gold Plan</Button>
            <Button variant='outlined' color='info' onClick={() => handlePopChange("Silver")}>Silver Plan</Button>
          </Box> */}
        </Paper>
      )}

      {/* Right Icons */}
      <Box display='flex' alignItems='center' gap={1.5}>
        <ModeDropdown />
        <Badge badgeContent={notiCount} color='error'>
          <IconButton size='medium' sx={{ color: 'text.primary' }} onClick={() => setNotificationOpen(true)}>
            <i className='ri-notification-2-line' />
          </IconButton>
        </Badge>

        <UserDropdown />
      </Box>

      {/* Plan Popup Component */}
      <PlanPopup open={open} title={title} handlePopClose={handlePopClose} />
      {/* 👉 Notification Drawer */}
      <NotificationDrawer open={notificationOpen} onClose={() => setNotificationOpen(false)} 
      notiData={notiData} 
      handleClick={handleClick}
      clearAll={clearAll}
      />
    </Box>
  )
}

export default NavbarContent
