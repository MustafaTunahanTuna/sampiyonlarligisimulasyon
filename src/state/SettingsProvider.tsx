import { useCallback, useState } from 'react'
import { SettingsContext } from './settingsContext'
import { persistSettings, readSettings } from './settingsStorage'
import type { ReactNode } from 'react'
import type { AppSettings } from './settingsStorage'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readSettings)

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      persistSettings(next)
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
