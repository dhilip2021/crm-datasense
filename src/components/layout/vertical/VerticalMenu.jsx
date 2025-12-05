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

const VerticalMenu = ({ scrollMenu, roles, fetchRolesPrevileges }) => {
  const router = useRouter()
  const role_id = Cookies.get('role_id')

  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const hasPrivilege = (menu, subMenu = '') => {
    if (!roles) return false

    const found = roles.find(r => r.menu_privileage_name === menu && r.sub_menu_privileage_name === subMenu)

    return found?.view_status === true
  }
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
    Cookies.remove('organization_logo')
    Cookies.remove('organization_address')
    Cookies.remove('organization_currency')
    Cookies.remove('organization_emp_count')
    Cookies.remove('user_id')
    Cookies.remove('c_version')
    Cookies.remove('endedAt')
    router.push('/login')
  }

  const handleMenuClick = href => {
    if (typeof fetchRolesPrevileges === 'function') {
      if (href === '/login') {
        router.push(href)
        logoutFn()
      } else {
        router.push(href)
        fetchRolesPrevileges()
      }
    }
  }

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
        {hasPrivilege('Dashboard', '') && (
          <SubMenu label='Dashboard' icon={<i className='ri-dashboard-line' />}>
            {hasPrivilege('Dashboard', 'Leads') && (
              <MenuItem onClick={() => handleMenuClick('/')} icon={<i className='ri-user-3-line' />}>
                Leads
              </MenuItem>
            )}

            {hasPrivilege('Dashboard', 'Opportunity') && (
              <MenuItem
                onClick={() => handleMenuClick('/opportunity')}
                icon={<i className='ri-bar-chart-grouped-line' />}
              >
                Opportunity
              </MenuItem>
            )}
          </SubMenu>
        )}

        {/* 🟦 Master Section */}
        {hasPrivilege('Master', '') && (
          <SubMenu label='Master' icon={<i className='ri-database-2-line' />}>
            {hasPrivilege('Master', 'Territory') && (
              <MenuItem onClick={() => handleMenuClick('/territory')} icon={<i className='ri-map-pin-2-line' />}>
                Territory
              </MenuItem>
            )}

            {hasPrivilege('Master', 'Campaign Type') && (
              <MenuItem onClick={() => handleMenuClick('/campaign-type')} icon={<i className='ri-megaphone-line' />}>
                Campaign Type
              </MenuItem>
            )}

            {hasPrivilege('Master', 'Tax Master') && (
              <MenuItem onClick={() => handleMenuClick('/tax-master')} icon={<i className='ri-percent-line' />}>
                Tax Master
              </MenuItem>
            )}

            {hasPrivilege('Master', 'UOM Master') && (
              <MenuItem onClick={() => handleMenuClick('/uom-master')} icon={<i className='ri-ruler-line' />}>
                UOM Master
              </MenuItem>
            )}

            {hasPrivilege('Master', 'Category Master') && (
              <MenuItem onClick={() => handleMenuClick('/category-master')} icon={<i className='ri-ruler-line' />}>
                Category Master
              </MenuItem>
            )}

            {hasPrivilege('Master', 'Item Master') && (
              <MenuItem onClick={() => handleMenuClick('items')} icon={<i className='ri-archive-2-line' />}>
                Item Master
              </MenuItem>
            )}

            {hasPrivilege('Master', 'Reasons Master') && (
              <MenuItem onClick={() => handleMenuClick('/reasons-master')} icon={<i className='ri-archive-2-line' />}>
                Reasons Master
              </MenuItem>
            )}
          </SubMenu>
        )}

        {/* 🟨 Apps & Pages Section */}
        <MenuSection label='Leads'>
          {hasPrivilege('Leads') && (
            <MenuItem onClick={() => handleMenuClick('/app/leads')} icon={<i className='ri-user-star-line' />}>
              Leads
            </MenuItem>
          )}

          {hasPrivilege('Opportunity') && (
            <MenuItem onClick={() => handleMenuClick('/app/opportunity')} icon={<i className='ri-briefcase-line' />}>
              Opportunity
            </MenuItem>
          )}

          {hasPrivilege('Contacts') && (
            <MenuItem onClick={() => handleMenuClick('/app/contacts')} icon={<i className='ri-user-settings-line' />}>
              Contacts
            </MenuItem>
          )}

          {hasPrivilege('Notes') && (
            <MenuItem onClick={() => handleMenuClick('/notes')} icon={<i className='ri-sticky-note-line' />}>
              Notes
            </MenuItem>
          )}

          {hasPrivilege('Tasks') && (
            <MenuItem onClick={() => handleMenuClick('/tasks')} icon={<i className='ri-task-line' />}>
              Tasks
            </MenuItem>
          )}

          {hasPrivilege('Calls') && (
            <MenuItem onClick={() => handleMenuClick('/calls')} icon={<i className='ri-phone-line' />}>
              Calls
            </MenuItem>
          )}

          {hasPrivilege('Organization') && (
            <MenuItem onClick={() => handleMenuClick('/organization')} icon={<i className='ri-building-line' />}>
              Organization
            </MenuItem>
          )}

          {hasPrivilege('Emails') && (
            <MenuItem onClick={() => handleMenuClick('/emails')} icon={<i className='ri-mail-line' />}>
              Emails
            </MenuItem>
          )}

          {hasPrivilege('Comments') && (
            <MenuItem onClick={() => handleMenuClick('/comments')} icon={<i className='ri-chat-1-line' />}>
              Comments
            </MenuItem>
          )}
        </MenuSection>

        {/* ⚙️ Settings Section */}

        <MenuSection label='Settings'>
          {hasPrivilege('Settings') && (
            <SubMenu label='Settings' icon={<i className='ri-settings-3-line' />}>
              {hasPrivilege('Settings', 'Profile Setting') && (
                <MenuItem onClick={() => handleMenuClick('/profile-settings')} icon={<i className='ri-profile-line' />}>
                  Profile Setting
                </MenuItem>
              )}

              {hasPrivilege('Settings', 'User List') && (
                <MenuItem onClick={() => handleMenuClick('/users-list')} icon={<i className='ri-user-line' />}>
                  User List
                </MenuItem>
              )}

              {hasPrivilege('Settings', 'Roles & Permission') && (
                <MenuItem onClick={() => handleMenuClick('/roles-permission')} icon={<i className='ri-lock-line' />}>
                  Roles & Permission
                </MenuItem>
              )}
            </SubMenu>
          )}

          {/* <SubMenu label='Roles & Permissions' icon={<i className='ri-lock-line' />}>
              <MenuItem onClick={() => handleMenuClick('/tax-master')} href='/roles' icon={<i className='ri-vip-crown-line' />}>
                Roles
              </MenuItem>
              <MenuItem onClick={() => handleMenuClick('/tax-master')} href='/permissions' icon={<i className='ri-key-2-line' />}>
                Permissions
              </MenuItem>
            </SubMenu> */}
          {hasPrivilege('Setup') && (
            <MenuItem onClick={() => handleMenuClick('/builder')} icon={<i className='ri-tools-line' />}>
              Setup
            </MenuItem>
          )}

          {hasPrivilege('Logout') && (
            <MenuItem onClick={() => handleMenuClick('/login')} icon={<i className='ri-logout-box-line' />}>
              Logout
            </MenuItem>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
