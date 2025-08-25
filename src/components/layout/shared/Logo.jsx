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
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-inline-start: 10px;
`

const Logo = ({ color }) => {
  
  const orgName = Cookies.get("organization_name");

  return (
    <Box>
       <div className='flex items-center min-bs-[24px]'>
       <MaterioLogo className='text-[22px] text-primary' />
       
       {/* <LogoText color={color}>{themeConfig.templateName}   </LogoText> */}
       <LogoText color={color}>{orgName}   </LogoText>
       </div>
       <div>
         {/* <h4> <span style={{color:"#a7a7a7"}}></span>  {orgName}</h4> */}
       </div>
      
    </Box>

  )
}

export default Logo
