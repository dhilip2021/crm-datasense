

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

import Cookies from 'js-cookie'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { converDayJsDatewithOutTime } from '@/helper/frontendHelper'

const NavbarContent = ({c_version, endedAt}) => {


  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      {c_version === "Trial" && (
       <div className='hidden md:flex items-center'>
          <p
            style={{
              color: 'red',
              fontWeight: 'bold',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#fff0f0',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid red',
              maxWidth: '600px',
              margin: '20px auto'
            }}
          >
            Your trial version is valid for 14 days only and will expire on{' '}
            <span style={{ textDecoration: 'underline' }}>{converDayJsDatewithOutTime(endedAt)}</span>.
          </p>
        </div>
      )}

      <div className='flex items-center'>
        <ModeDropdown />
        <IconButton className='text-textPrimary'>
          <i className='ri-notification-2-line' />
        </IconButton>
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
