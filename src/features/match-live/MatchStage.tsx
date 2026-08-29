import { useEffect, useRef, useState } from 'react'
import { bannerFor } from './stageBanner'
import { buildTimelines } from './clipTimeline'
import { createStageLoop } from './stageLoop'
import { useTranslation } from '../../i18n/useTranslation'
import type { Playback } from './pitchFrame'
import type { StageInputs, StageLoop } from './stageLoop'
import type { TeamVisual } from './pitchRenderer'

interface MatchStageProps {
  playback: Playback
  home: TeamVisual
  away: TeamVisual
  speed: number
  paused: boolean
  skipToken: number
  idleHeadline: string | null
  onProgress: (second: number) => void
  onGoal: () => void
  onKick: (power: number) => void
  onFinished: () => void
}

export function MatchStage({
  playback,
  home,
  away,
  speed,
  paused,
  skipToken,
  idleHeadline,
  onProgress,
  onGoal,
  onKick,
  onFinished,
}: MatchStageProps) {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loopRef = useRef<StageLoop | null>(null)
  const [minute, setMinute] = useState(0)
  const [showPitch, setShowPitch] = useState(false)

  const inputs = useRef<StageInputs>({ speed, paused, home, away, resolveBanner: () => null })
  const signals = useRef({ onProgress, onGoal, onKick, onFinished })

  useEffect(() => {
    inputs.current = {
      speed,
      paused,
      home,
      away,
      resolveBanner: (event) => bannerFor(event, t),
    }
  }, [speed, paused, home, away, t])

  useEffect(() => {
    signals.current = { onProgress, onGoal, onKick, onFinished }
  }, [onProgress, onGoal, onKick, onFinished])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const loop = createStageLoop({
      canvas,
      playback,
      timelines: buildTimelines(playback),
      read: () => inputs.current,
      signals: {
        onProgress: (second) => signals.current.onProgress(second),
        onGoal: () => signals.current.onGoal(),
        onKick: (power) => signals.current.onKick(power),
        onFinished: () => signals.current.onFinished(),
        onMinute: setMinute,
        onPitchVisible: setShowPitch,
      },
    })
    loopRef.current = loop
    return () => {
      loopRef.current = null
      loop.stop()
    }
  }, [playback])

  useEffect(() => {
    if (skipToken > 0) loopRef.current?.skip()
  }, [skipToken])

  const totalMinutes = Math.ceil(playback.totalSeconds / 60)

  return (
    <div className="relative overflow-hidden rounded-control bg-canvas ring-1 ring-line">
      <canvas ref={canvasRef} role="img" aria-label={t.live.pitchLabel} className="block w-full" />
      <div
        aria-hidden={showPitch}
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas px-6 text-center transition-opacity duration-300 ease-out ${
          showPitch ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <span className="font-display text-5xl font-extrabold tabular-nums text-fg">{minute}'</span>
        <p className="max-w-md text-sm text-muted">{idleHeadline ?? t.live.idleHeadline}</p>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-line">
        <div
          style={{ transform: `scaleX(${Math.min(1, minute / totalMinutes)})` }}
          className="h-full origin-left bg-accent/70 transition-transform duration-500 ease-out"
        />
      </div>
    </div>
  )
}
