import { useCallback, useMemo, useState } from 'react'
import { createPlayback } from './pitchFrame'
import type { MatchEvent, MatchReport } from '../../domain/engine'
import type { Score } from '../../domain/types'

export const PLAYBACK_SPEEDS = [2, 4] as const

function scoreOf(events: MatchEvent[]): Score {
  const score = { home: 0, away: 0 }
  for (const event of events) {
    if (event.kind === 'GOAL' || event.kind === 'PENALTY_GOAL') score[event.side] += 1
  }
  return score
}

export function useMatchPlayback(report: MatchReport, startFinished: boolean) {
  const playback = useMemo(() => createPlayback(report), [report])
  const [second, setSecond] = useState(startFinished ? report.durationSeconds : 0)
  const [speed, setSpeed] = useState<number>(PLAYBACK_SPEEDS[0])
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(startFinished)
  const [skipToken, setSkipToken] = useState(0)

  const handleFinished = useCallback(() => {
    setFinished(true)
    setPaused(true)
  }, [])

  const skipToEnd = useCallback(() => {
    setSkipToken((token) => token + 1)
    setSecond(report.durationSeconds)
    setFinished(true)
  }, [report.durationSeconds])

  const visibleEvents = useMemo(() => playback.eventsUntil(second), [playback, second])

  return {
    playback,
    second,
    speed,
    paused,
    finished,
    skipToken,
    visibleEvents,
    liveScore: useMemo(() => scoreOf(visibleEvents), [visibleEvents]),
    setSecond,
    setSpeed,
    togglePause: () => setPaused((value) => !value),
    skipToEnd,
    handleFinished,
  }
}
