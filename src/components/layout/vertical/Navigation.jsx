'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'

// Component Imports
import VerticalNav, { NavHeader } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Style Imports
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import Cookies from 'js-cookie'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 80,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) 5%, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))


// Fetch Privileges API

const fetchPrivilegesById = async (token, id) => {
  const res = await fetch(`/api/v1/admin/user_privileges/list?roll=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  const data = await res.json()
  return data.payloadJson
}

const Navigation = () => {
   const getToken = Cookies.get('_token')
   const rollId = Cookies.get('role_id')
   const [roles, setRoles] = useState("")
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav } = useVerticalNav()

  // Refs
  const shadowRef = useRef(null)

  const scrollMenu = (container, isPerfectScrollbar) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }


    useEffect(() => {
      const loadData = async () => {
        try {
          if (!getToken) {
            console.error('Token missing in cookies')
            return
          }
  
          const data = await fetchPrivilegesById(getToken, rollId)

          console.log(data,"<<< ROLES DATAAA")

          // const sorted = [...data].sort((a, b) => a.c_role_priority - b.c_role_priority)
        
          setRoles(data)
        } catch (err) {
          console.error('Error fetching privileges:', err)
        }
      }
      loadData()
    }, [getToken])

    useEffect(() => {
      console.log(roles,"<<< ROLSSSSSSS")
    }, [roles])
    




  return (
    // eslint-disable-next-line lines-around-comment
    // Sidebar Vertical Menu
    <VerticalNav customStyles={navigationCustomStyles(theme)}>
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <Link href='/'>
          <Logo />
        </Link>
        {isBreakpointReached && <i className='ri-close-line text-xl' onClick={() => toggleVerticalNav(false)} />}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu scrollMenu={scrollMenu} roles={roles} />
    </VerticalNav>
  )
}

export default Navigation
