import { useContext } from 'react'
import { SettingsContext } from './settingsContext'
import type { SettingsContextValue } from './settingsContext'

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (context === null) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }
  return context
}
