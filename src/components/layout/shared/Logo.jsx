'use client'

// Third-party Imports
import styled from '@emotion/styled'
import Cookies from 'js-cookie'
import { Box } from '@mui/material'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { useSelector } from 'react-redux'
import Image from 'next/image'

const LogoText = styled.span`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 0.9rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-top: 4px; /* gap between logo and text */
`

const Logo = ({ color }) => {
  const { payloadJson } = useSelector(state => state.login)

  const orgName = Cookies.get('organization_name') || themeConfig.templateName
  const orgLogo = Cookies.get('organization_logo')

  return (
    <Box display='flex' flexDirection='column' alignItems='center' minHeight={35}>
      <MaterioLogo className='text-[28px] text-primary' />
      {orgLogo &&  orgName && 
        <Box width={"100%"} display='flex' alignItems='center' justifyContent={'space-between'} gap={2}>
        <Image src={orgLogo} width={24} height={24} alt='org-logo' />
        <LogoText color={color}>{orgName}</LogoText>
      </Box>
      }
      
    </Box>
  )
}

export default Logo
