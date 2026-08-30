import { drawBall, drawTeam, drawTrail } from './pitchActors'
import { viewportOf } from './pitchCamera'
import { drawLetterbox, drawNetRipple } from './pitchEffects'
import { applyWorldInset } from './pitchLayout'
import { drawBanner, drawFlash, drawMinimap } from './stageOverlay'
import type { ActiveBanner } from './stageOverlay'
import type { Backdrop } from './pitchBackdrop'
import type { Camera } from './pitchCamera'
import type { Kit } from './kits'
import type { NetRipple } from './pitchEffects'
import type { PitchFrame, WindupCue } from './pitchFrame'
import type { Point, Size } from './geometry'
import type { Side } from '../../domain/engine'

export interface TeamVisual {
  code: string
  kit: Kit
}

export interface StageScene {
  frame: PitchFrame
  previous: PitchFrame
  camera: Camera
  trail: Point[]
  spin: number
  pulse: number
  flash: number
  flashTint: string
  banner: ActiveBanner | null
  letterbox: number
  replayLabel: string
  ripple: NetRipple | null
}

export interface StageVisuals {
  backdrop: Backdrop
  home: TeamVisual
  away: TeamVisual
}

function windupFor(windup: WindupCue | null, side: Side): WindupCue | null {
  return windup !== null && windup.side === side ? windup : null
}

function drawWorld(
  context: CanvasRenderingContext2D,
  size: Size,
  ratio: number,
  scene: StageScene,
  visuals: StageVisuals,
) {
  const { frame, previous } = scene
  visuals.backdrop.paint(context, size, ratio)
  applyWorldInset(context, size)
  drawTrail(context, size, scene.trail)

  const homePose = {
    points: frame.home,
    previous: previous.home,
    kit: visuals.home.kit,
    carrier: frame.possession === 'home' ? frame.carrier : null,
    onPitch: frame.onPitch.home,
    windup: windupFor(frame.windup, 'home'),
  }
  const awayPose = {
    points: frame.away,
    previous: previous.away,
    kit: visuals.away.kit,
    carrier: frame.possession === 'away' ? frame.carrier : null,
    onPitch: frame.onPitch.away,
    windup: windupFor(frame.windup, 'away'),
  }
  drawTeam(context, size, frame.possession === 'home' ? awayPose : homePose, scene.pulse)
  drawTeam(context, size, frame.possession === 'home' ? homePose : awayPose, scene.pulse)
  drawBall(context, size, frame.ball, frame.lift, scene.spin)
  if (scene.ripple !== null) drawNetRipple(context, size, scene.ripple)
}

export function renderStage(
  context: CanvasRenderingContext2D,
  size: Size,
  ratio: number,
  scene: StageScene,
  visuals: StageVisuals,
) {
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, size.width, size.height)

  const viewport = viewportOf(scene.camera, size)
  const zoomed = ratio * viewport.scale
  context.setTransform(zoomed, 0, 0, zoomed, viewport.originX * ratio, viewport.originY * ratio)
  drawWorld(context, size, ratio, scene, visuals)

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  drawFlash(context, size, scene.flash, scene.flashTint)
  drawMinimap(context, size, scene.camera, scene.frame.ball)
  drawLetterbox(context, size, scene.letterbox, scene.replayLabel)
  if (scene.banner !== null) drawBanner(context, size, scene.banner)
}
