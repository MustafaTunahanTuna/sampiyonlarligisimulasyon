import { drawBall, drawTeam, drawTrail } from './pitchActors'
import { viewportOf } from './pitchCamera'
import { drawBanner, drawFlash, drawMinimap, drawSideLabels } from './stageOverlay'
import type { ActiveBanner } from './stageOverlay'
import type { Backdrop } from './pitchBackdrop'
import type { Camera } from './pitchCamera'
import type { Kit } from './kits'
import type { PitchFrame } from './pitchFrame'
import type { Point, Size } from './geometry'

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
}

export interface StageVisuals {
  backdrop: Backdrop
  home: TeamVisual
  away: TeamVisual
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
  drawTrail(context, size, scene.trail)

  const homePose = {
    points: frame.home,
    previous: previous.home,
    kit: visuals.home.kit,
    carrier: frame.possession === 'home' ? frame.carrier : null,
  }
  const awayPose = {
    points: frame.away,
    previous: previous.away,
    kit: visuals.away.kit,
    carrier: frame.possession === 'away' ? frame.carrier : null,
  }
  drawTeam(context, size, frame.possession === 'home' ? awayPose : homePose, scene.pulse)
  drawTeam(context, size, frame.possession === 'home' ? homePose : awayPose, scene.pulse)
  drawBall(context, size, frame.ball, frame.lift, scene.spin)
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
  drawSideLabels(context, size, visuals.home, visuals.away)
  drawMinimap(context, size, scene.camera, scene.frame.ball)
  if (scene.banner !== null) drawBanner(context, size, scene.banner)
}
