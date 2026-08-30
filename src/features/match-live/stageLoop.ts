import { createBackdrop } from './pitchBackdrop'
import { renderStage } from './pitchRenderer'
import { revealSecondFor, stepAt } from './clipTimeline'
import { crowdCueFor, stepCueFor } from './stageCues'
import { observeStageSurface } from './stageSurface'
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
import type { ClipTimeline, StepCursor } from './clipTimeline'
import type { MatchEvent } from '../../domain/engine'
import type { NetRipple } from './pitchEffects'
import type { PitchFrame, Playback } from './pitchFrame'
import type { Point } from './geometry'
import type { TeamVisual } from './pitchRenderer'

const COMMENTARY_RATE = 260
const REPORT_INTERVAL_MS = 200
const TRAIL_LENGTH = 26
const MAX_FRAME_DELTA = 0.12
const BANNER_MIN_IMPORTANCE = 2
const HIT_STOP_SECONDS = 0.07
const RIPPLE_MAX_AGE = 0.75

export interface StageInputs {
  speed: number
  paused: boolean
  home: TeamVisual
  away: TeamVisual
  replayLabel: string
  resolveBanner: (event: MatchEvent) => BannerContent | null
}

export interface StageSignals {
  onProgress: (second: number) => void
  onMinute: (minute: number) => void
  onPitchVisible: (visible: boolean) => void
  onGoal: () => void
  onKick: (power: number) => void
  onCrowd: () => void
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
  const surface = observeStageSurface(canvas, context)
  const size = surface.size

  let director = createDirector()
  let previousFrame: PitchFrame | null = null
  let ripple: NetRipple | null = null
  let animation = 0
  let previousNow = performance.now()
  let reportedAt = 0
  let second = 0
  let reveal = 0
  let clipIndex = 0
  let clipElapsed = -1
  let freezeLeft = 0
  let lastMinute = 0
  let lastStepKey = ''
  let lastCrowdKey = ''
  let lastBannerKey = ''
  let lastPhaseIndex = -1
  let lastReplay = false
  let finished = false
  let skipRequested = false

  const enterClip = () => {
    clipElapsed = 0
    trail.length = 0
    previousFrame = null
    ripple = null
    lastPhaseIndex = -1
    lastReplay = false
    signals.onPitchVisible(true)
  }

  const leaveClip = () => {
    second = timelines[clipIndex].clip.endSecond
    clipIndex += 1
    clipElapsed = -1
    lastStepKey = ''
    ripple = null
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

  const announceStep = (cursor: StepCursor, clipId: string, tint: string) => {
    const cue = stepCueFor(cursor, clipId)
    if (cue.key === lastStepKey) return
    lastStepKey = cue.key
    if (cue.kind === 'celebrate') {
      director = celebrate(director, tint)
      ripple = { impact: { ...playback.frameOfPhase(cursor.step.phaseIndex, 1).ball }, age: 0 }
      signals.onGoal()
      return
    }
    if (cue.kind !== 'kick') return
    signals.onKick(cue.power)
    if (cue.hitStop) freezeLeft = HIT_STOP_SECONDS
  }

  const announceCrowd = (cursor: StepCursor, clipId: string, frame: PitchFrame) => {
    const key = crowdCueFor(cursor, clipId, frame)
    if (key === null || key === lastCrowdKey) return
    lastCrowdKey = key
    signals.onCrowd()
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

  const refreshTrail = (cursor: StepCursor) => {
    if (cursor.step.phaseIndex === lastPhaseIndex && cursor.step.replay === lastReplay) return
    const replayJump = cursor.step.replay !== lastReplay
    lastPhaseIndex = cursor.step.phaseIndex
    lastReplay = cursor.step.replay
    if (replayJump || playback.restartOf(cursor.step.phaseIndex) !== 'none') trail.length = 0
  }

  const renderClip = (delta: number, inputs: StageInputs) => {
    const active = timelines[clipIndex]
    const cursor = stepAt(active, clipElapsed)
    const celebration = cursor.step.hold ? cursor.progress : 0
    const frame = playback.frameOfPhase(
      cursor.step.phaseIndex,
      cursor.step.hold ? 1 : cursor.progress,
      celebration,
    )
    const tint =
      frame.event?.side === 'away' ? inputs.away.kit.outfield : inputs.home.kit.outfield

    refreshTrail(cursor)
    announceStep(cursor, active.clip.id, tint)
    announceCrowd(cursor, active.clip.id, frame)
    if (frame.event !== null && frame.event.importance >= BANNER_MIN_IMPORTANCE) {
      raiseBanner(frame.event, active.clip.id, inputs)
    }

    trail.push({ ...frame.ball })
    if (trail.length > TRAIL_LENGTH) trail.shift()

    if (ripple !== null) {
      ripple = ripple.age >= RIPPLE_MAX_AGE ? null : { ...ripple, age: ripple.age + delta }
    }

    director = advanceDirector(director, frame, cursor, delta)
    renderStage(
      context,
      size,
      surface.ratio(),
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
        letterbox: director.letterbox,
        replayLabel: inputs.replayLabel,
        ripple,
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
      if (freezeLeft > 0) {
        freezeLeft = Math.max(0, freezeLeft - delta)
      } else {
        const scale =
          clipElapsed >= 0
            ? timeScaleOf(stepAt(timelines[clipIndex], clipElapsed))
            : 1
        advanceClock(delta * scale, inputs.speed)
      }
    }

    if (size.width > 0) {
      if (clipElapsed >= 0) {
        renderClip(delta, inputs)
      } else {
        const ratio = surface.ratio()
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
      surface.release()
      backdrop.release()
    },
  }
}
