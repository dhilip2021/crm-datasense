'use client'

// Third-party Imports
import styled from '@emotion/styled'
import Cookies from 'js-cookie'
import { Box } from '@mui/material'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

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
  const orgName = Cookies.get('organization_name') || themeConfig.templateName

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight={32}>
      <MaterioLogo className='text-[28px] text-primary' />
      <LogoText color={color}>{orgName}</LogoText>
    </Box>
  )
}

export default Logo
