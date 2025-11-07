'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Cookies from 'js-cookie'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const user_name = Cookies.get('user_name')
  const role_name = Cookies.get('role_name')

  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      if (url === '/login') {
        Cookies.remove('riho_token')
        Cookies.remove('_token')
        Cookies.remove('_token_expiry')
        Cookies.remove('privileges')
        Cookies.remove('role_id')
        Cookies.remove('role_name')
        Cookies.remove('user_name')
        Cookies.remove('organization_id')
        Cookies.remove('organization_name')
        Cookies.remove('user_id')
        Cookies.remove('c_version')
        Cookies.remove('endedAt')
      }

      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt='John Doe'
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[9999]' // add high z-index here
        modifiers={[
          {
            name: 'zIndex',
            enabled: true,
            phase: 'write',
            fn: ({ state }) => {
              state.styles.popper.zIndex = 9999
            }
          }
        ]}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg' sx={{ zIndex: 9999 }}>
              {' '}
              {/* also add here */}
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList sx={{ zIndex: 9999 }}>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1} style={{ zIndex: '9' }}>
                    <Avatar alt='John Doe' src='/images/avatars/1.png' />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {user_name}
                      </Typography>
                      <Typography variant='caption'>{role_name}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/change-password')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>Change Password </Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    {/* <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={() => {

                        // instant redirect
                        router.replace('/login') // 🔥 instant without history back
                        // clear cookies immediately
                        Cookies.remove('riho_token')
                        Cookies.remove('_token')
                        Cookies.remove('_token_expiry')
                        Cookies.remove('privileges')
                        Cookies.remove('role_id')
                        Cookies.remove('role_name')
                        Cookies.remove('user_name')
                        Cookies.remove('organization_id')
                        Cookies.remove('organization_name')
                        Cookies.remove('user_id')
                        Cookies.remove('c_version')
                        Cookies.remove('endedAt')

                        
                      }}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button> */}
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={() => {
                        // 🔹 Close dropdown first
                        setOpen(false)

                        // 🔹 Clear all cookies immediately
                        const cookiesToClear = [
                          'riho_token',
                          '_token',
                          '_token_expiry',
                          'privileges',
                          'role_id',
                          'role_name',
                          'user_name',
                          'organization_id',
                          'organization_name',
                          'user_id',
                          'c_version',
                          'endedAt'
                        ]
                        cookiesToClear.forEach(c => Cookies.remove(c))

                        // 🔹 Instant page reload + redirect (no history)
                        window.location.replace('/login')
                      }}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
