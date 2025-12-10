"use client"

import { useState } from 'react'
import { Box, Button, IconButton, Typography, useTheme, Paper } from '@mui/material'
import classnames from 'classnames'
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import PlanPopup from './PlanPopup'
import { converDayJsDatewithOutTime } from '@/helper/frontendHelper'
import { useSelector } from 'react-redux'
import NotificationDrawer from './NotificationDrawer'

const NavbarContent = ({ c_version, endedAt }) => {
  const { payloadJson } = useSelector(state => state.login)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
    // 👉 Notification Drawer State
  const [notificationOpen, setNotificationOpen] = useState(false)
  const theme = useTheme()

  const handlePopClose = () => {
    setOpen(false)
    setTitle("")
  }
  const handlePopChange = plan => {
    setOpen(true)
    setTitle(plan)
  }

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
      {c_version === "Trial" && (
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
            maxWidth: 800,
          }}
        >
          <Typography variant='body1' fontWeight='bold' color='error.main' textAlign='center'>
            Hello {payloadJson?.user_name || 'Guest'}, your trial version for <b>{payloadJson?.organization_name}</b> 
             {' '} is active for <b>14 Days</b> and will expire on{' '} <br/>
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
        <IconButton size='medium' sx={{ color: 'text.primary' }} onClick={() => setNotificationOpen(true)}>
          <i className='ri-notification-2-line' />
        </IconButton>
        <UserDropdown />
      </Box>

      {/* Plan Popup Component */}
      <PlanPopup open={open} title={title} handlePopClose={handlePopClose} />
      {/* 👉 Notification Drawer */}
      <NotificationDrawer
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </Box>
  )
}

export default NavbarContent
