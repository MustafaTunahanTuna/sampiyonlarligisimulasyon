import { useCallback, useEffect, useRef, useState } from 'react'
import { createMatchAudio } from './matchAudio'
import { useSettings } from '../../state/useSettings'
import type { MatchAudio, WhistlePattern } from './matchAudio'

const STORAGE_KEY = 'ucl:match-audio-muted'

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useMatchAudio() {
  const audioRef = useRef<MatchAudio | null>(null)
  const [isMuted, setIsMuted] = useState(readMuted)
  const { settings } = useSettings()

  useEffect(() => {
    const audio = createMatchAudio()
    audioRef.current = audio
    if (audio === null) return

    audio.setMuted(readMuted())
    void audio.resume()

    const handleVisibility = () => audio.setMuted(document.hidden || readMuted())
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      audio.dispose()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    audioRef.current?.setLevels(settings.ambienceVolume, settings.effectsVolume)
  }, [settings.ambienceVolume, settings.effectsVolume])

  const toggleMuted = useCallback(() => {
    setIsMuted((previous) => {
      const next = !previous
      audioRef.current?.setMuted(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        return next
      }
      return next
    })
  }, [])

  const cheer = useCallback(() => audioRef.current?.cheer(), [])
  const kick = useCallback((power: number) => audioRef.current?.kick(power), [])
  const whistle = useCallback((pattern: WhistlePattern) => audioRef.current?.whistle(pattern), [])
  const ooh = useCallback(() => audioRef.current?.ooh(), [])
  const tension = useCallback((active: boolean) => audioRef.current?.tension(active), [])

  return { isMuted, toggleMuted, cheer, kick, whistle, ooh, tension }
}
