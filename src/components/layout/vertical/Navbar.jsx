"use client"
import Cookies from 'js-cookie'

// Component Imports
import LayoutNavbar from '@layouts/components/vertical/Navbar'
import NavbarContent from './NavbarContent'
import { useEffect } from 'react'

const Navbar = () => {
  const c_version = Cookies.get('c_version')
  const endedAt = Cookies.get('endedAt')


  return (
    <LayoutNavbar>
      <NavbarContent c_version={c_version} endedAt={endedAt} />
    </LayoutNavbar>
  )
}

export default Navbar
