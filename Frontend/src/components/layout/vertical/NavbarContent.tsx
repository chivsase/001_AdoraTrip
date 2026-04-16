'use client'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

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
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
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
