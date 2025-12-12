'use client'

import { Drawer, Box, Typography, IconButton, Avatar, Divider, Button } from '@mui/material'

const NotificationDrawer = ({ open, onClose, notiData = [], handleClick,clearAll }) => {


 

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350, p: 2 }
      }}
    >
      {/* HEADER */}
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h6' fontWeight='bold'>
          Notifications
        </Typography>
        <IconButton onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* NOTIFICATION LIST */}
      <Box sx={{ maxHeight: '75vh', overflowY: 'auto', pr: 1 }}>
        {notiData.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>
            No new notifications.
          </Typography>
        ) : (
          <>
          <Box  display={'flex'} justifyContent={'flex-end'} alignItems={'flex-end'}><Button onClick={()=>clearAll()}>Clear All</Button></Box>
          {
             notiData.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1.5,
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
                border: '1px solid #eee'
              }}
            >
              {/* ICON */}
              <Avatar src={item?.c_icon} alt='icon' sx={{ width: 40, height: 40, borderRadius: 2 }} />

              {/* TEXT */}
              <Box display={'flex'} flexDirection={'column'}>
                
                <Box>
                  <Typography fontWeight='bold'>{item?.c_title}</Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                    {item?.c_message}
                  </Typography>


                  {/* <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: "block", color: "primary.main" }}
                >
                  🔗 View Lead – {item?.c_link}
                </Typography> */}
                </Box>
                <Box mt={2}>
                  <Button variant='contained' size='small' color='success' onClick={() => handleClick(item)}>
                    view
                  </Button>{' '}
                </Box>
              </Box>
              <Divider />
            </Box>
          ))
          }
          
          </>
         
        )}
      </Box>
    </Drawer>
  )
}

export default NotificationDrawer
