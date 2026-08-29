import { createBackdrop } from './pitchBackdrop'
import { renderStage } from './pitchRenderer'
import { revealSecondFor, stepAt, KICK_POWER } from './clipTimeline'
import {
  advanceDirector,
  announceBanner,
  celebrate,
  createDirector,
  pulseOf,
  restDirector,
  timeScaleOf,
} from './stageDirector'
import type { BannerContent } from './stageBanner'
import type { ClipTimeline } from './clipTimeline'
import type { MatchEvent } from '../../domain/engine'
import type { PitchFrame, Playback } from './pitchFrame'
import type { Point, Size } from './geometry'
import type { TeamVisual } from './pitchRenderer'

export const PITCH_ASPECT = 0.648

const COMMENTARY_RATE = 260
const REPORT_INTERVAL_MS = 200
const TRAIL_LENGTH = 26
const MAX_FRAME_DELTA = 0.12
const BANNER_MIN_IMPORTANCE = 2

export interface StageInputs {
  speed: number
  paused: boolean
  home: TeamVisual
  away: TeamVisual
  resolveBanner: (event: MatchEvent) => BannerContent | null
}

export interface StageSignals {
  onProgress: (second: number) => void
  onMinute: (minute: number) => void
  onPitchVisible: (visible: boolean) => void
  onGoal: () => void
  onKick: (power: number) => void
  onFinished: () => void
}

export interface StageLoopOptions {
  canvas: HTMLCanvasElement
  playback: Playback
  timelines: ClipTimeline[]
  read: () => StageInputs
  signals: StageSignals
}

export interface StageLoop {
  skip: () => void
  stop: () => void
}

export function createStageLoop(options: StageLoopOptions): StageLoop {
  const { canvas, playback, timelines, read, signals } = options
  const context = canvas.getContext('2d')
  if (context === null) return { skip: () => {}, stop: () => {} }
  context.imageSmoothingQuality = 'high'

  const backdrop = createBackdrop()
  const trail: Point[] = []
  const size: Size = { width: 0, height: 0 }
  let ratio = 1

  const measure = () => {
    ratio = window.devicePixelRatio || 1
    size.width = canvas.clientWidth
    size.height = Math.round(size.width * PITCH_ASPECT)
    canvas.width = Math.max(1, Math.round(size.width * ratio))
    canvas.height = Math.max(1, Math.round(size.height * ratio))
    canvas.style.height = `${size.height}px`
    context.imageSmoothingQuality = 'high'
  }

  const observer = new ResizeObserver(measure)
  observer.observe(canvas)
  measure()

  let director = createDirector()
  let previousFrame: PitchFrame | null = null
  let animation = 0
  let previousNow = performance.now()
  let reportedAt = 0
  let second = 0
  let reveal = 0
  let clipIndex = 0
  let clipElapsed = -1
  let lastMinute = 0
  let lastStepKey = ''
  let lastBannerKey = ''
  let finished = false
  let skipRequested = false

  const enterClip = () => {
    clipElapsed = 0
    trail.length = 0
    previousFrame = null
    signals.onPitchVisible(true)
  }

  const leaveClip = () => {
    second = timelines[clipIndex].clip.endSecond
    clipIndex += 1
    clipElapsed = -1
    lastStepKey = ''
    director = restDirector(director)
    signals.onPitchVisible(false)
  }

  const advanceClock = (delta: number, speed: number) => {
    const active = timelines[clipIndex]
    if (clipElapsed < 0) {
      second += delta * COMMENTARY_RATE * speed
      if (active !== undefined && second >= active.clip.startSecond) {
        second = active.clip.startSecond
        enterClip()
      }
      return
    }
    clipElapsed += delta * speed
    const span = active.clip.endSecond - active.clip.startSecond
    second = active.clip.startSecond + span * Math.min(1, clipElapsed / active.total)
    if (clipElapsed >= active.total) leaveClip()
  }

  const announceStep = (stepKey: string, hold: boolean, power: number, tint: string) => {
    if (stepKey === lastStepKey) return
    lastStepKey = stepKey
    if (hold) {
      director = celebrate(director, tint)
      signals.onGoal()
      return
    }
    if (power > 0) signals.onKick(power)
  }

  const raiseBanner = (event: MatchEvent, clipId: string, inputs: StageInputs) => {
    const key = `${clipId}:${event.second}:${event.kind}`
    if (key === lastBannerKey) return
    lastBannerKey = key
    const content = inputs.resolveBanner(event)
    if (content !== null) director = announceBanner(director, content)
  }

  const applySkip = () => {
    skipRequested = false
    second = playback.totalSeconds
    reveal = playback.totalSeconds
    clipElapsed = -1
    clipIndex = timelines.length
    director = restDirector(director)
    signals.onPitchVisible(false)
  }

  const renderClip = (delta: number, inputs: StageInputs) => {
    const active = timelines[clipIndex]
    const cursor = stepAt(active, clipElapsed)
    const frame = playback.frameOfPhase(cursor.step.phaseIndex, cursor.progress)
    const tint =
      frame.event?.side === 'away' ? inputs.away.kit.outfield : inputs.home.kit.outfield

    announceStep(
      `${active.clip.id}:${cursor.order}`,
      cursor.step.hold,
      KICK_POWER[cursor.step.action],
      tint,
    )
    if (frame.event !== null && frame.event.importance >= BANNER_MIN_IMPORTANCE) {
      raiseBanner(frame.event, active.clip.id, inputs)
    }

    trail.push({ ...frame.ball })
    if (trail.length > TRAIL_LENGTH) trail.shift()

    director = advanceDirector(director, frame, cursor, delta)
    renderStage(
      context,
      size,
      ratio,
      {
        frame,
        previous: previousFrame ?? frame,
        camera: director.camera,
        trail,
        spin: director.spin,
        pulse: pulseOf(director),
        flash: director.flash,
        flashTint: director.flashTint,
        banner: director.banner,
      },
      { backdrop, home: inputs.home, away: inputs.away },
    )
    previousFrame = frame
    reveal = Math.max(reveal, revealSecondFor(playback.report.phases, cursor))
  }

  const reportMinute = () => {
    const current = Math.min(
      Math.floor(second / 60) + 1,
      Math.ceil(playback.totalSeconds / 60),
    )
    if (current === lastMinute) return
    lastMinute = current
    signals.onMinute(current)
  }

  const draw = (now: number) => {
    const delta = Math.min(MAX_FRAME_DELTA, (now - previousNow) / 1000)
    previousNow = now
    const inputs = read()

    if (skipRequested) applySkip()
    if (!inputs.paused && !finished) {
      const scale =
        clipElapsed >= 0
          ? timeScaleOf(stepAt(timelines[clipIndex], clipElapsed))
          : 1
      advanceClock(delta * scale, inputs.speed)
    }

    if (size.width > 0) {
      if (clipElapsed >= 0) {
        renderClip(delta, inputs)
      } else {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        context.clearRect(0, 0, size.width, size.height)
        reveal = Math.max(reveal, second)
      }
    }

    reportMinute()
    if (now - reportedAt > REPORT_INTERVAL_MS) {
      reportedAt = now
      signals.onProgress(reveal)
    }
    if (!finished && second >= playback.totalSeconds) {
      finished = true
      signals.onProgress(playback.totalSeconds)
      signals.onFinished()
    }
    animation = requestAnimationFrame(draw)
  }

  animation = requestAnimationFrame(draw)

  return {
    skip: () => {
      skipRequested = true
    },
    stop: () => {
      cancelAnimationFrame(animation)
      observer.disconnect()
      backdrop.release()
    },
  }
}
