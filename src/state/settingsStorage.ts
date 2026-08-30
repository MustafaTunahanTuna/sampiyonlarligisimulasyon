const STORAGE_KEY = 'ucl:settings'

export interface AppSettings {
  showReplays: boolean
  ambienceVolume: number
  effectsVolume: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  showReplays: true,
  ambienceVolume: 1,
  effectsVolume: 1,
}

function sanitisedVolume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback
}

export function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_SETTINGS
    const stored = JSON.parse(raw) as Partial<AppSettings>
    return {
      showReplays:
        typeof stored.showReplays === 'boolean'
          ? stored.showReplays
          : DEFAULT_SETTINGS.showReplays,
      ambienceVolume: sanitisedVolume(stored.ambienceVolume, DEFAULT_SETTINGS.ambienceVolume),
      effectsVolume: sanitisedVolume(stored.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function persistSettings(settings: AppSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    return
  }
}
