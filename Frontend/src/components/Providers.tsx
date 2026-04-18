import type { ChildrenType, Direction, Mode } from '@core/types'
import type { Settings } from '@core/contexts/settingsContext'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ThemeProvider from '@components/theme'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
  forceMode?: Mode
}

const Providers = async (props: Props) => {
  // Props
  const { children, direction, forceMode } = props

  // Vars
  const mode = forceMode || await getMode()
  const settingsCookie = await getSettingsFromCookie()
  
  // If we are forcing a mode, ensure the cookie reflects that for this session
  if (forceMode && settingsCookie && Object.keys(settingsCookie).length > 0) {
    settingsCookie.mode = forceMode
  }
  
  const systemMode = await getSystemMode()

  return (
    <VerticalNavProvider>
      <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
        <ThemeProvider direction={direction} systemMode={systemMode}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers
