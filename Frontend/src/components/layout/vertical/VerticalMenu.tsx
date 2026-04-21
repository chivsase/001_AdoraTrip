'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useAuth } from '@/hooks/useAuth'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const PARTNER_ROLES = new Set([
  'PARTNER_OWNER', 'PARTNER_MANAGER', 'PARTNER_STAFF',
  'PARTNER_FINANCE', 'LOCAL_GUIDE', 'TRANSPORT_PROVIDER',
])

const VerticalMenu = ({ scrollMenu }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { user } = useAuth()

  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const role = user?.platform_role ?? 'TRAVELER'
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'PLATFORM_STAFF'
  const isPartner = PARTNER_ROLES.has(role)
  const isTraveler = !isSuperAdmin && !isPartner

  const menuProps = {
    popoutMenuOffset: { mainAxis: 10 },
    menuItemStyles: menuItemStyles(verticalNavOptions, theme),
    renderExpandIcon: ({ open }: { open?: boolean }) => (
      <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
    ),
    renderExpandedMenuItemIcon: { icon: <i className='ri-circle-line' /> },
    menuSectionStyles: menuSectionStyles(verticalNavOptions, theme),
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: (container: any) => scrollMenu(container, false),
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: (container: any) => scrollMenu(container, true),
          })}
    >
      <Menu {...menuProps}>

        {/* ── TRAVELER ── */}
        {isTraveler && (
          <>
            <MenuSection label='Main'>
              <MenuItem href='/home' icon={<i className='ri-home-smile-line' />}>
                Home
              </MenuItem>
              <MenuItem href='/bookings' icon={<i className='ri-calendar-check-line' />}>
                My Bookings
              </MenuItem>
            </MenuSection>

            <MenuSection label='Explore'>
              <MenuItem href='/deals' icon={<i className='ri-fire-line' />}>
                Deals
              </MenuItem>
              <MenuItem href='/destinations' icon={<i className='ri-map-pin-2-line' />}>
                Destinations
              </MenuItem>
            </MenuSection>

            <MenuSection label='Account'>
              <MenuItem href='/profile' icon={<i className='ri-user-line' />}>
                Profile
              </MenuItem>
              <MenuItem href='/settings' icon={<i className='ri-settings-4-line' />}>
                Settings
              </MenuItem>
            </MenuSection>
          </>
        )}

        {/* ── VENDOR / PARTNER ── */}
        {isPartner && (
          <>
            <MenuSection label='Vendor Portal'>
              <MenuItem href='/vendor/dashboard' icon={<i className='ri-dashboard-line' />}>
                Dashboard
              </MenuItem>
              <MenuItem href='/vendor/bookings' icon={<i className='ri-calendar-check-line' />}>
                Bookings
              </MenuItem>
            </MenuSection>

            <MenuSection label='Inventory'>
              <SubMenu
                label='My Listings'
                icon={<i className='ri-building-2-line' />}
              >
                <MenuItem href='/vendor/listings' icon={<i className='ri-list-check' />}>
                  All Listings
                </MenuItem>
                <MenuItem href='/vendor/listings/new' icon={<i className='ri-add-circle-line' />}>
                  Add New
                </MenuItem>
              </SubMenu>
              <MenuItem href='/vendor/deals' icon={<i className='ri-fire-line' />}>
                Deals
              </MenuItem>
            </MenuSection>

            <MenuSection label='Finance'>
              <MenuItem href='/vendor/earnings' icon={<i className='ri-money-dollar-circle-line' />}>
                Earnings
              </MenuItem>
            </MenuSection>

            <MenuSection label='Account'>
              <MenuItem href='/profile' icon={<i className='ri-user-line' />}>
                Profile
              </MenuItem>
              <MenuItem href='/settings' icon={<i className='ri-settings-4-line' />}>
                Settings
              </MenuItem>
            </MenuSection>
          </>
        )}

        {/* ── SUPER ADMIN / PLATFORM STAFF ── */}
        {isSuperAdmin && (
          <>
            <MenuSection label='Platform'>
              <MenuItem href='/home' icon={<i className='ri-dashboard-line' />}>
                Overview
              </MenuItem>
            </MenuSection>

            <MenuSection label='Manage'>
              <MenuItem href='/admin/vendors' icon={<i className='ri-store-2-line' />}>
                Vendors
              </MenuItem>
              <MenuItem href='/admin/users' icon={<i className='ri-team-line' />}>
                Users
              </MenuItem>
              <MenuItem href='/admin/deals' icon={<i className='ri-fire-line' />}>
                Deals
              </MenuItem>
              <MenuItem href='/admin/listings' icon={<i className='ri-building-2-line' />}>
                Listings
              </MenuItem>
            </MenuSection>

            <MenuSection label='Content'>
              <MenuItem href='/admin/destinations' icon={<i className='ri-map-pin-2-line' />}>
                Destinations
              </MenuItem>
            </MenuSection>

            <MenuSection label='Account'>
              <MenuItem href='/profile' icon={<i className='ri-user-line' />}>
                Profile
              </MenuItem>
              <MenuItem href='/settings' icon={<i className='ri-settings-4-line' />}>
                Settings
              </MenuItem>
            </MenuSection>
          </>
        )}

      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
