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

const VerticalMenu = ({ scrollMenu, roles }) => {
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

  const hasMenu = index =>
    Array.isArray(roles?.c_menu_privileges) &&
    roles?.c_menu_privileges.length > index &&
    roles?.c_menu_privileges[index]?.menu_privileage_status

  return (
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
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {/* 🟩 Dashboard Section */}
        <SubMenu label='Dashboard' icon={<i className='ri-dashboard-line' />}>
          <MenuItem href='/' icon={<i className='ri-user-3-line' />}>
            Leads
          </MenuItem>
          <MenuItem href='/opportunity' icon={<i className='ri-bar-chart-grouped-line' />}>
            Opportunity
          </MenuItem>
        </SubMenu>

        {/* 🟦 Master Section */}
        <SubMenu label='Master' icon={<i className='ri-database-2-line' />}>
          <MenuItem href='/territory' icon={<i className='ri-map-pin-2-line' />}>
            Territory
          </MenuItem>
          <MenuItem href='/campaign-type' icon={<i className='ri-megaphone-line' />}>
            Campaign Type
          </MenuItem>
          <MenuItem href='/tax-master' icon={<i className='ri-percent-line' />}>
            Tax Master
          </MenuItem>
          <MenuItem href='/uom-master' icon={<i className='ri-ruler-line' />}>
            UOM Master
          </MenuItem>
          <MenuItem href='/items' icon={<i className='ri-archive-2-line' />}>
            Item Master
          </MenuItem>
           <MenuItem href='/reasons-master' icon={<i className='ri-archive-2-line' />}>
            Reasons Master
          </MenuItem>
        </SubMenu>

        {/* 🟨 Apps & Pages Section */}
        <MenuSection label='Apps & Pages'>
          <MenuItem href='/app/leads' icon={<i className='ri-user-star-line' />}>
            Leads
          </MenuItem>
          <MenuItem href='/app/opportunity' icon={<i className='ri-briefcase-line' />}>
            Opportunity
          </MenuItem>
          <MenuItem href='/app/customer' icon={<i className='ri-user-settings-line' />}>
            Contacts
          </MenuItem>
          <MenuItem href='/notes' icon={<i className='ri-sticky-note-line' />}>
            Notes
          </MenuItem>
          <MenuItem href='/tasks' icon={<i className='ri-task-line' />}>
            Tasks
          </MenuItem>
           <MenuItem href='/calls' icon={<i className='ri-phone-line' />}>
            Calls
          </MenuItem>
          <MenuItem href='/organization' icon={<i className='ri-building-line' />}>
            Organization
          </MenuItem>
         
          <MenuItem href='/emails' icon={<i className='ri-mail-line' />}>
            Emails
          </MenuItem>
          <MenuItem href='/comments' icon={<i className='ri-chat-1-line' />}>
            Comments
          </MenuItem>
        </MenuSection>

        {/* ⚙️ Settings Section */}
        <MenuSection label='Settings'>
          <SubMenu label='Settings' icon={<i className='ri-settings-3-line' />}>
            <MenuItem href='/profile-settings' icon={<i className='ri-profile-line' />}>
              Profile Setting
            </MenuItem>
            <MenuItem href='/users-list' icon={<i className='ri-user-line' />}>
              User List
            </MenuItem>
            <SubMenu label='Roles & Permissions' icon={<i className='ri-lock-line' />}>
              <MenuItem href='/roles' icon={<i className='ri-vip-crown-line' />}>
                Roles
              </MenuItem>
              <MenuItem href='/permissions' icon={<i className='ri-key-2-line' />}>
                Permissions
              </MenuItem>
            </SubMenu>
          </SubMenu>

          <MenuItem href='/builder' icon={<i className='ri-tools-line' />}>
            Setup
          </MenuItem>

          <MenuItem href='/login' icon={<i className='ri-logout-box-line' />} onClick={logoutFn}>
            Logout
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
