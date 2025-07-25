// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import Cookies from 'js-cookie'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const router = useRouter()
  const role_id = Cookies.get('role_id')

  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const logoutFn = () => {
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
    router.push('/login')
  }

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}

      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem href='/' icon={<i className='ri-bar-chart-box-line' />}>
          Dashboard
        </MenuItem>

        <MenuSection label='Apps & Pages'>
          <MenuItem href='/leads' icon={<i className='ri-user-settings-line' />}>
            Leads
          </MenuItem>
           <MenuItem href='/customer' icon={<i className='ri-user-settings-line' />}>
            Customer
          </MenuItem>
          <MenuItem href='/notes' icon={<i className='ri-sticky-note-add-line'></i>}>
            Notes
          </MenuItem>
          <MenuItem href='/tasks' icon={<i className='ri-list-check-3'></i>}>
            Tasks
          </MenuItem>
          <MenuItem href='/organization' icon={<i className='ri-community-line'></i>}>
            Organization
          </MenuItem>
          <MenuItem href='/calls' icon={<i className='ri-phone-line'></i>}>
            Calls
          </MenuItem>
          <MenuItem href='/emails' icon={<i className='ri-mail-line'></i>}>
            Emails
          </MenuItem>
          <MenuItem href='/comments' icon={<i className='ri-chat-1-line'></i>}>
            Comments
          </MenuItem>

          <MenuItem href='/deals' icon={<i className='ri-user-settings-line' />}>
            Deals
          </MenuItem>

          {/* <MenuItem href='/card-basic' icon={<i className='ri-bar-chart-box-line' />}>
            {' '}
            Cards
          </MenuItem>

          <MenuItem href='/use-dispatch' icon={<i className='ri-bar-chart-box-line' />}>
            {' '}
            Use Dispatch
          </MenuItem>
          <MenuItem href='/use-select' icon={<i className='ri-bar-chart-box-line' />}>
            {' '}
            Use Select
          </MenuItem> */}
        </MenuSection>
        <MenuSection label='Settings'>
          <SubMenu label='Settings' icon={<i className='ri-settings-3-line' />}>
            <MenuItem href='/profile-settings'>Profile Setting</MenuItem>

            {(role_id === '16f01165898b' || role_id === '27f01165688z') && (
             
                <MenuItem href='/users-list' icon={<i className='ri-user-line' />}>Users List</MenuItem>
              
            )}

            {(role_id === '16f01165898b' || role_id === '27f01165688z') && (
              <SubMenu label='Roles & Permissions' icon={<i className='ri-settings-3-line' />}>
                <MenuItem href='/roles'>Roles</MenuItem>
                <MenuItem href='/permissions'>Permissions</MenuItem>
              </SubMenu>
            )}
            <MenuItem href='/fields/list-fields' icon={<i className='ri-input-field' />}>Field List</MenuItem>
            <MenuItem href='/login' icon={<i className='ri-logout-box-line'></i>}>
              <div onClick={logoutFn}>Logout</div>{' '}
            </MenuItem>
          </SubMenu>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
