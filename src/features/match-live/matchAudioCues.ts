const WHISTLE_FREQUENCY = 2093
const WHISTLE_TREMOLO = 42
const WHISTLE_GAIN = 0.11
const OOH_GAIN = 0.3
const OOH_ATTACK = 0.09
const OOH_RELEASE = 0.95

export const WHISTLE_PATTERNS = ['kickoff', 'half', 'full'] as const

export type WhistlePattern = (typeof WHISTLE_PATTERNS)[number]

export function createWhistle(
  context: AudioContext,
  destination: AudioNode,
): (pattern: WhistlePattern) => void {
  const peep = (at: number, seconds: number) => {
    const core = context.createOscillator()
    core.type = 'square'
    core.frequency.value = WHISTLE_FREQUENCY

    const shape = context.createBiquadFilter()
    shape.type = 'bandpass'
    shape.frequency.value = WHISTLE_FREQUENCY
    shape.Q.value = 6

    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.exponentialRampToValueAtTime(WHISTLE_GAIN, at + 0.02)
    envelope.gain.setValueAtTime(WHISTLE_GAIN, at + seconds - 0.05)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + seconds)

    const roll = context.createOscillator()
    roll.frequency.value = WHISTLE_TREMOLO
    const rollDepth = context.createGain()
    rollDepth.gain.value = WHISTLE_GAIN * 0.55
    roll.connect(rollDepth).connect(envelope.gain)

    core.connect(shape).connect(envelope).connect(destination)
    core.start(at)
    core.stop(at + seconds + 0.05)
    roll.start(at)
    roll.stop(at + seconds + 0.05)
  }

  return (pattern) => {
    if (context.state !== 'running') return
    const now = context.currentTime
    if (pattern === 'kickoff') {
      peep(now, 0.55)
      return
    }
    if (pattern === 'half') {
      peep(now, 0.75)
      return
    }
    peep(now, 0.28)
    peep(now + 0.4, 0.28)
    peep(now + 0.8, 0.95)
  }
}

export function createOoh(
  context: AudioContext,
  buffer: AudioBuffer,
  destination: AudioNode,
): () => void {
  return () => {
    if (context.state !== 'running') return
    const now = context.currentTime
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const shape = context.createBiquadFilter()
    shape.type = 'bandpass'
    shape.Q.value = 0.5
    shape.frequency.setValueAtTime(820, now)
    shape.frequency.linearRampToValueAtTime(380, now + OOH_RELEASE)

    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(OOH_GAIN, now + OOH_ATTACK)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + OOH_RELEASE)

    source.connect(shape).connect(envelope).connect(destination)
    source.start(now, Math.random() * (buffer.duration - 1))
    source.stop(now + OOH_RELEASE + 0.1)
  }
}
