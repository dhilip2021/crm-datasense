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

  const hasMenu = (index) =>
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
        {hasMenu(0) && (
          <SubMenu label={roles.c_menu_privileges[0].menu_privileage_name} icon={<i className='ri-bar-chart-box-line' />}>
            {hasMenu(1) && (
              <MenuItem href='/' icon={<i className='ri-id-card-line' />}>
                {roles.c_menu_privileges[1].menu_privileage_name}
              </MenuItem>
            )}
            {hasMenu(2) && (
              <MenuItem href='/opportunity' icon={<i className='ri-bar-chart-box-line' />}>
                {roles.c_menu_privileges[2].menu_privileage_name}
              </MenuItem>
            )}
          </SubMenu>
        )}

        {hasMenu(3) && (
          <SubMenu label={roles.c_menu_privileges[3].menu_privileage_name} icon={<i className='ri-bar-chart-box-line' />}>
            {hasMenu(4) && (
              <MenuItem href='/salutation' icon={<i className='ri-id-card-line' />}>
                {roles.c_menu_privileges[4].menu_privileage_name}
              </MenuItem>
            )}
            {hasMenu(5) && (
              <MenuItem href='/gender' icon={<i className='ri-women-line' />}>
                {roles.c_menu_privileges[5].menu_privileage_name}
              </MenuItem>
            )}
            {hasMenu(6) && (
              <MenuItem href='/territory' icon={<i className='ri-map-pin-line' />}>
                {roles.c_menu_privileges[6].menu_privileage_name}
              </MenuItem>
            )}
            {hasMenu(7) && (
              <MenuItem href='/campaign-type' icon={<i className='ri-map-pin-line' />}>
                {roles.c_menu_privileges[7].menu_privileage_name}
              </MenuItem>
            )}
          </SubMenu>
        )}

        <MenuSection label='Apps & Pages'>
          {hasMenu(8) && (
            <MenuItem href='/app/leads' icon={<i className='ri-user-star-line' />}>
              {roles.c_menu_privileges[8].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(9) && (
            <MenuItem href='/app/opportunity' icon={<i className='ri-user-star-line' />}>
              {roles.c_menu_privileges[9].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(10) && (
            <MenuItem href='/app/customer' icon={<i className='ri-user-settings-line' />}>
              {roles.c_menu_privileges[10].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(11) && (
            <MenuItem href='/notes' icon={<i className='ri-sticky-note-add-line'></i>}>
              {roles.c_menu_privileges[11].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(12) && (
            <MenuItem href='/tasks' icon={<i className='ri-list-check-3'></i>}>
              {roles.c_menu_privileges[12].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(13) && (
            <MenuItem href='/organization' icon={<i className='ri-community-line'></i>}>
              {roles.c_menu_privileges[13].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(14) && (
            <MenuItem href='/calls' icon={<i className='ri-phone-line'></i>}>
              {roles.c_menu_privileges[14].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(15) && (
            <MenuItem href='/emails' icon={<i className='ri-mail-line'></i>}>
              {roles.c_menu_privileges[15].menu_privileage_name}
            </MenuItem>
          )}
          {hasMenu(16) && (
            <MenuItem href='/comments' icon={<i className='ri-chat-1-line'></i>}>
              {roles.c_menu_privileges[16].menu_privileage_name}
            </MenuItem>
          )}
        </MenuSection>

        <MenuSection label='Settings'>
          {hasMenu(17) && (
            <SubMenu label={roles.c_menu_privileges[17].menu_privileage_name} icon={<i className='ri-settings-3-line' />}>
              {hasMenu(18) && <MenuItem href='/profile-settings'>{roles.c_menu_privileges[18].menu_privileage_name}</MenuItem>}
              {hasMenu(19) && (
                <MenuItem href='/users-list' icon={<i className='ri-user-line' />}>
                  {roles.c_menu_privileges[19].menu_privileage_name}
                </MenuItem>
              )}

              {hasMenu(20) && (
                <SubMenu label={roles.c_menu_privileges[20].menu_privileage_name} icon={<i className='ri-settings-3-line' />}>
                  {hasMenu(21) && <MenuItem href='/roles'>{roles.c_menu_privileges[21].menu_privileage_name}</MenuItem>}
                  {hasMenu(22) && <MenuItem href='/permissions'>{roles.c_menu_privileges[22].menu_privileage_name}</MenuItem>}
                </SubMenu>
              )}
            </SubMenu>
          )}

          {hasMenu(23) && (
            <MenuItem href='/builder' icon={<i className='ri-tools-line text-xl' />}>
              {roles.c_menu_privileges[23].menu_privileage_name}
            </MenuItem>
          )}

          {hasMenu(24) && (
            <MenuItem href='/login' icon={<i className='ri-logout-box-line'></i>}>
              <div onClick={logoutFn}>{roles.c_menu_privileges[24].menu_privileage_name}</div>
            </MenuItem>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
