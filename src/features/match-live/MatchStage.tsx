import { useEffect, useMemo, useRef, useState } from 'react'
import { renderFrame } from './pitchRenderer'
import type { Point } from './formations'
import { KICK_POWER, buildTimelines, revealSecondFor, stepAt } from './clipTimeline'
import type { StepCursor } from './clipTimeline'
import type { Playback } from './pitchFrame'
import type { TeamVisual } from './pitchRenderer'

const COMMENTARY_RATE = 260
const REPORT_INTERVAL_MS = 200
const TRAIL_LENGTH = 26
const FLASH_DECAY = 1.8
const PITCH_ASPECT = 0.64

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

function fitCanvas(canvas: HTMLCanvasElement) {
  const ratio = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = Math.round(width * PITCH_ASPECT)
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    canvas.style.height = `${height}px`
  }
  return { width, height }
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelines = useMemo(() => buildTimelines(playback), [playback])
  const [minute, setMinute] = useState(0)
  const [showPitch, setShowPitch] = useState(false)

  const visuals = useRef({ home, away })
  const controls = useRef({ speed, paused })
  const skipRef = useRef(skipToken)
  const callbacks = useRef({ onProgress, onGoal, onKick, onFinished })

  useEffect(() => {
    controls.current = { speed, paused }
  }, [speed, paused])

  useEffect(() => {
    visuals.current = { home, away }
  }, [home, away])

  useEffect(() => {
    callbacks.current = { onProgress, onGoal, onKick, onFinished }
  }, [onProgress, onGoal, onKick, onFinished])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const context = canvas.getContext('2d')
    if (context === null) return

    let animation = 0
    let previous = performance.now()
    let reportedAt = 0
    let second = 0
    let reveal = 0
    let clipIndex = 0
    let clipElapsed = -1
    let flash = 0
    let finished = false
    let skipSeen = skipRef.current
    let lastMinute = 0
    let lastStepKey = ''
    const trail: Point[] = []

    const enterClip = () => {
      clipElapsed = 0
      trail.length = 0
      setShowPitch(true)
    }

    const leaveClip = () => {
      second = timelines[clipIndex].clip.endSecond
      clipIndex += 1
      clipElapsed = -1
      lastStepKey = ''
      setShowPitch(false)
    }

    const advance = (delta: number) => {
      const active = timelines[clipIndex]
      if (clipElapsed < 0) {
        second += delta * COMMENTARY_RATE * controls.current.speed
        if (active !== undefined && second >= active.clip.startSecond) {
          second = active.clip.startSecond
          enterClip()
        }
        return
      }
      clipElapsed += delta * controls.current.speed
      const span = active.clip.endSecond - active.clip.startSecond
      second = active.clip.startSecond + span * Math.min(1, clipElapsed / active.total)
      if (clipElapsed >= active.total) leaveClip()
    }

    const announce = (cursor: StepCursor, clipId: string) => {
      const key = `${clipId}:${cursor.order}`
      if (key === lastStepKey) return
      lastStepKey = key
      if (cursor.step.hold) {
        flash = 1
        callbacks.current.onGoal()
        return
      }
      const power = KICK_POWER[cursor.step.action]
      if (power > 0) callbacks.current.onKick(power)
    }

    const draw = (now: number) => {
      const delta = Math.min(0.12, (now - previous) / 1000)
      previous = now

      if (skipRef.current !== skipSeen) {
        skipSeen = skipRef.current
        second = playback.totalSeconds
        reveal = playback.totalSeconds
        clipElapsed = -1
        clipIndex = timelines.length
        setShowPitch(false)
      }

      if (!controls.current.paused && !finished) advance(delta)
      flash = Math.max(0, flash - delta * FLASH_DECAY)

      const size = fitCanvas(canvas)
      const ratio = window.devicePixelRatio || 1
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      if (clipElapsed >= 0) {
        const active = timelines[clipIndex]
        const cursor = stepAt(active, clipElapsed)
        announce(cursor, active.clip.id)
        const frame = playback.frameOfPhase(cursor.step.phaseIndex, cursor.progress)
        trail.push({ ...frame.ball })
        if (trail.length > TRAIL_LENGTH) trail.shift()
        renderFrame(context, size, frame, {
          trail,
          flash,
          home: visuals.current.home,
          away: visuals.current.away,
        })
        reveal = Math.max(reveal, revealSecondFor(playback.report.phases, cursor))
      } else {
        context.clearRect(0, 0, size.width, size.height)
        reveal = Math.max(reveal, second)
      }

      const currentMinute = Math.min(
        Math.floor(second / 60) + 1,
        Math.ceil(playback.totalSeconds / 60),
      )
      if (currentMinute !== lastMinute) {
        lastMinute = currentMinute
        setMinute(currentMinute)
      }

      if (now - reportedAt > REPORT_INTERVAL_MS) {
        reportedAt = now
        callbacks.current.onProgress(reveal)
      }
      if (!finished && second >= playback.totalSeconds) {
        finished = true
        callbacks.current.onProgress(playback.totalSeconds)
        callbacks.current.onFinished()
      }
      animation = requestAnimationFrame(draw)
    }

    animation = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animation)
  }, [playback, timelines])

  useEffect(() => {
    skipRef.current = skipToken
  }, [skipToken])

  return (
    <div className="relative overflow-hidden rounded-control bg-canvas ring-1 ring-line">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Pozisyonun saha üzerinde canlandırması"
        className="block w-full"
      />
      <div
        aria-hidden={showPitch}
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas px-6 text-center transition-opacity duration-300 ease-out ${
          showPitch ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <span className="font-display text-5xl font-extrabold tabular-nums text-fg">
          {minute}'
        </span>
        <p className="max-w-md text-sm text-muted">
          {idleHeadline ?? 'Maç sürüyor, pozisyon bekleniyor.'}
        </p>
      </div>
    </div>
  )
}
