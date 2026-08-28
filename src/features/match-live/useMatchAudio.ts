import { useCallback, useEffect, useRef, useState } from 'react'
import { createMatchAudio } from './matchAudio'
import type { MatchAudio } from './matchAudio'

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

  return { isMuted, toggleMuted, cheer, kick }
}
