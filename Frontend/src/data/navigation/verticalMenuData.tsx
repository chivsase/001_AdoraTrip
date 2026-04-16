// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'ri-home-smile-line'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'ri-information-line'
  },
  {
    isSection: true,
    label: 'Account',
    children: [
      {
        label: 'My Profile',
        href: '/profile',
        icon: 'ri-user-3-line'
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'ri-settings-4-line'
      }
    ]
  }
]

export default verticalMenuData
