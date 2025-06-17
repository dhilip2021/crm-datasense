"use client"

import { useState } from 'react'


// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'


// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

import { Box, Button } from '@mui/material'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { converDayJsDatewithOutTime } from '@/helper/frontendHelper'
import PlanPopup from './PlanPopup'

const NavbarContent = ({c_version, endedAt}) => {
 
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")

  const handlePopClose =()=>{
    setOpen(false);
    setTitle("")
  }
  const handlePopChange =(plan)=>{
    setOpen(true);
    setTitle(plan)
  }

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      {c_version === "Trial" && (
       <div className='hidden md:flex items-center'>
        <Box>
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
          <Box display={"flex"} justifyContent={"space-evenly"}>
          <Button variant='contained' className="golden-btn" onClick={()=>handlePopChange("Gold")}>Gold Plan</Button>
          <Button variant='contained' className="silver-btn" onClick={()=>handlePopChange("Silver")}>Silver Plan</Button>
          </Box>
          
        </Box>
         
        </div>
      )}

      <div className='flex items-center'>
        <ModeDropdown />
        <IconButton className='text-textPrimary'>
          <i className='ri-notification-2-line' />
        </IconButton>
        <UserDropdown />
      </div>
      <PlanPopup 
      open={open}
      title= {title}
      handlePopClose= {handlePopClose} 
      />
    </div>
  )
}

export default NavbarContent
