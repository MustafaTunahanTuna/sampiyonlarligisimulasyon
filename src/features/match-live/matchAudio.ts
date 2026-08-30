import { createOoh, createWhistle } from './matchAudioCues'
import type { WhistlePattern } from './matchAudioCues'

export type { WhistlePattern } from './matchAudioCues'

const GOAL_SOUND_URL = '/sounds/goal_sound.mp3'
const GOAL_GAIN = 0.9
const AMBIENCE_GAIN = 0.055
const TENSION_LIFT = 1.7
const TENSION_RAMP = 0.6
const LEVEL_RAMP = 0.08
const ROAR_GAIN = 0.5
const KICK_GAIN = 0.16
const NOISE_SECONDS = 3
const SWELL_PERIOD_SECONDS = 7
const ROAR_ATTACK = 0.14
const ROAR_RELEASE = 3.6
const KICK_RELEASE = 0.09
const THUMP_RELEASE = 0.13

export interface MatchAudio {
  resume: () => Promise<void>
  setMuted: (muted: boolean) => void
  setLevels: (ambience: number, effects: number) => void
  cheer: () => void
  kick: (power: number) => void
  whistle: (pattern: WhistlePattern) => void
  ooh: () => void
  tension: (active: boolean) => void
  dispose: () => void
}

function noiseBuffer(context: AudioContext): AudioBuffer {
  const length = Math.floor(context.sampleRate * NOISE_SECONDS)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1
    previous = (previous + 0.03 * white) / 1.03
    channel[index] = previous * 3.2
  }
  return buffer
}

async function loadGoalSound(context: AudioContext): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(GOAL_SOUND_URL)
    if (!response.ok) return null
    return await context.decodeAudioData(await response.arrayBuffer())
  } catch {
    return null
  }
}

interface Ambience {
  stop: () => void
  setTension: (active: boolean) => void
  setVolume: (volume: number) => void
}

function startAmbience(
  context: AudioContext,
  buffer: AudioBuffer,
  destination: GainNode,
): Ambience {
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const body = context.createBiquadFilter()
  body.type = 'bandpass'
  body.frequency.value = 520
  body.Q.value = 0.6

  const ceiling = context.createBiquadFilter()
  ceiling.type = 'lowpass'
  ceiling.frequency.value = 1800

  const level = context.createGain()
  level.gain.value = AMBIENCE_GAIN

  const swell = context.createOscillator()
  swell.frequency.value = 1 / SWELL_PERIOD_SECONDS
  const swellDepth = context.createGain()
  swellDepth.gain.value = AMBIENCE_GAIN * 0.35
  swell.connect(swellDepth).connect(level.gain)

  source.connect(body).connect(ceiling).connect(level).connect(destination)
  source.start()
  swell.start()

  let tense = false
  let volume = 1
  const apply = (ramp: number) => {
    const loudness = volume * volume
    level.gain.setTargetAtTime(
      AMBIENCE_GAIN * (tense ? TENSION_LIFT : 1) * loudness,
      context.currentTime,
      ramp,
    )
    swellDepth.gain.setTargetAtTime(AMBIENCE_GAIN * 0.35 * loudness, context.currentTime, ramp)
  }

  return {
    stop: () => {
      source.stop()
      swell.stop()
    },
    setTension: (active) => {
      tense = active
      apply(TENSION_RAMP)
    },
    setVolume: (next) => {
      volume = next
      apply(LEVEL_RAMP)
    },
  }
}

export function createMatchAudio(): MatchAudio | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null

  const context = new AudioContext()
  const master = context.createGain()
  const limiter = context.createDynamicsCompressor()
  master.gain.value = 1
  master.connect(limiter).connect(context.destination)

  const effects = context.createGain()
  effects.connect(master)

  const buffer = noiseBuffer(context)
  const ambience = startAmbience(context, buffer, master)
  const whistle = createWhistle(context, effects)
  const ooh = createOoh(context, buffer, effects)

  let goalBuffer: AudioBuffer | null = null
  void loadGoalSound(context).then((decoded) => {
    goalBuffer = decoded
  })

  const roar = () => {
    const now = context.currentTime
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const shape = context.createBiquadFilter()
    shape.type = 'bandpass'
    shape.Q.value = 0.45
    shape.frequency.setValueAtTime(380, now)
    shape.frequency.linearRampToValueAtTime(1250, now + ROAR_ATTACK * 3)
    shape.frequency.linearRampToValueAtTime(560, now + ROAR_RELEASE)

    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(ROAR_GAIN, now + ROAR_ATTACK)
    envelope.gain.setValueAtTime(ROAR_GAIN, now + ROAR_ATTACK + 0.5)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + ROAR_RELEASE)

    source.connect(shape).connect(envelope).connect(effects)
    source.start(now)
    source.stop(now + ROAR_RELEASE + 0.1)
  }

  const cheer = () => {
    if (context.state !== 'running') return
    if (goalBuffer === null) {
      roar()
      return
    }
    const source = context.createBufferSource()
    source.buffer = goalBuffer
    const level = context.createGain()
    level.gain.value = GOAL_GAIN
    source.connect(level).connect(effects)
    source.start(context.currentTime)
  }

  const kick = (power: number) => {
    if (context.state !== 'running') return
    const now = context.currentTime
    const level = KICK_GAIN * Math.min(1.6, Math.max(0.4, power))

    const click = context.createBufferSource()
    click.buffer = buffer
    const clickShape = context.createBiquadFilter()
    clickShape.type = 'bandpass'
    clickShape.frequency.value = 1900
    clickShape.Q.value = 1.2
    const clickEnvelope = context.createGain()
    clickEnvelope.gain.setValueAtTime(level, now)
    clickEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + KICK_RELEASE)
    click.connect(clickShape).connect(clickEnvelope).connect(effects)
    click.start(now, Math.random() * (NOISE_SECONDS - 0.2))
    click.stop(now + KICK_RELEASE + 0.02)

    const thump = context.createOscillator()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(150, now)
    thump.frequency.exponentialRampToValueAtTime(62, now + THUMP_RELEASE)
    const thumpEnvelope = context.createGain()
    thumpEnvelope.gain.setValueAtTime(level * 0.9, now)
    thumpEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + THUMP_RELEASE)
    thump.connect(thumpEnvelope).connect(effects)
    thump.start(now)
    thump.stop(now + THUMP_RELEASE + 0.02)
  }

  return {
    resume: () => context.resume(),
    setMuted: (muted) => {
      master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.05)
    },
    setLevels: (ambienceVolume, effectsVolume) => {
      ambience.setVolume(ambienceVolume)
      effects.gain.setTargetAtTime(
        effectsVolume * effectsVolume,
        context.currentTime,
        LEVEL_RAMP,
      )
    },
    cheer,
    kick,
    whistle,
    ooh,
    tension: (active) => ambience.setTension(active),
    dispose: () => {
      ambience.stop()
      void context.close()
    },
  }
}
