import { useEffect, useRef, useState } from 'react'
import { bannerFor } from './stageBanner'
import { buildTimelines } from './clipTimeline'
import { createStageLoop } from './stageLoop'
import { StageScoreboard } from './StageScoreboard'
import { useTranslation } from '../../i18n/useTranslation'
import type { Playback } from './pitchFrame'
import type { Score } from '../../domain/types'
import type { StageInputs, StageLoop } from './stageLoop'
import type { TeamVisual } from './pitchRenderer'

interface MatchStageProps {
  playback: Playback
  home: TeamVisual
  away: TeamVisual
  speed: number
  paused: boolean
  skipToken: number
  score: Score
  idleHeadline: string | null
  showReplays: boolean
  onProgress: (second: number) => void
  onGoal: () => void
  onKick: (power: number) => void
  onCrowd: () => void
  onPitchVisible: (visible: boolean) => void
  onFinished: () => void
}

export function MatchStage({
  playback,
  home,
  away,
  speed,
  paused,
  skipToken,
  score,
  idleHeadline,
  showReplays,
  onProgress,
  onGoal,
  onKick,
  onCrowd,
  onPitchVisible,
  onFinished,
}: MatchStageProps) {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loopRef = useRef<StageLoop | null>(null)
  const [minute, setMinute] = useState(0)
  const [showPitch, setShowPitch] = useState(false)

  const inputs = useRef<StageInputs>({
    speed,
    paused,
    home,
    away,
    replayLabel: t.live.replayLabel,
    resolveBanner: () => null,
  })
  const signals = useRef({ onProgress, onGoal, onKick, onCrowd, onPitchVisible, onFinished })

  useEffect(() => {
    inputs.current = {
      speed,
      paused,
      home,
      away,
      replayLabel: t.live.replayLabel,
      resolveBanner: (event) => bannerFor(event, t),
    }
  }, [speed, paused, home, away, t])

  useEffect(() => {
    signals.current = { onProgress, onGoal, onKick, onCrowd, onPitchVisible, onFinished }
  }, [onProgress, onGoal, onKick, onCrowd, onPitchVisible, onFinished])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const loop = createStageLoop({
      canvas,
      playback,
      timelines: buildTimelines(playback, showReplays),
      read: () => inputs.current,
      signals: {
        onProgress: (second) => signals.current.onProgress(second),
        onGoal: () => signals.current.onGoal(),
        onKick: (power) => signals.current.onKick(power),
        onCrowd: () => signals.current.onCrowd(),
        onFinished: () => signals.current.onFinished(),
        onMinute: setMinute,
        onPitchVisible: (visible) => {
          setShowPitch(visible)
          signals.current.onPitchVisible(visible)
        },
      },
    })
    loopRef.current = loop
    return () => {
      loopRef.current = null
      loop.stop()
    }
  }, [playback, showReplays])

  useEffect(() => {
    if (skipToken > 0) loopRef.current?.skip()
  }, [skipToken])

  const totalMinutes = Math.ceil(playback.totalSeconds / 60)

  return (
    <div className="relative overflow-hidden rounded-control bg-canvas ring-1 ring-line">
      <canvas ref={canvasRef} role="img" aria-label={t.live.pitchLabel} className="block w-full" />
      <StageScoreboard home={home} away={away} score={score} minute={minute} />
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
