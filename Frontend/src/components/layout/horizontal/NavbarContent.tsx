'use client'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// Vars
const shortcuts: ShortcutsType[] = [
  { url: '/home', icon: 'ri-home-smile-line', title: 'Home', subtitle: 'Dashboard' },
  { url: '/profile', icon: 'ri-user-3-line', title: 'Profile', subtitle: 'My Profile' },
  { url: '/settings', icon: 'ri-settings-4-line', title: 'Settings', subtitle: 'Account Settings' },
  { url: '/about', icon: 'ri-information-line', title: 'About', subtitle: 'Information' },
]

const notifications: NotificationsType[] = [
  { avatarIcon: 'ri-gift-line', avatarColor: 'primary', title: 'Welcome to AdoraTrip! 🎉', subtitle: 'Start exploring Cambodia\'s best destinations', time: 'Just now', read: false },
  { avatarIcon: 'ri-notification-2-line', avatarColor: 'info', title: 'Complete your profile', subtitle: 'Add your photo and phone number', time: '5 min ago', read: false },
]

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && <Logo />}
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
