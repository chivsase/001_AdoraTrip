type SearchData = {
  id: string
  name: string
  url: string
  icon: string
  section: string
  shortcut?: string
  excludeLang?: boolean
}

const data: SearchData[] = [
  // Dashboards
  { id: '1', name: 'Home', url: '/home', icon: 'ri-home-smile-line', section: 'Dashboards' },

  // Pages
  { id: '10', name: 'Profile', url: '/profile', icon: 'ri-user-3-line', section: 'Pages' },
  { id: '11', name: 'Settings', url: '/settings', icon: 'ri-settings-4-line', section: 'Pages' },
]

export default data
