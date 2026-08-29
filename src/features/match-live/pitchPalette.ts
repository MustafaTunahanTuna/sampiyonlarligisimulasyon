export const PITCH_PALETTE = {
  turfDark: '#0f2f1d',
  turfLight: '#164027',
  turfSheen: 'rgba(148, 214, 158, 0.07)',
  turfEdge: 'rgba(4, 10, 8, 0.52)',
  floodlight: 'rgba(226, 244, 255, 0.09)',
  markings: 'rgba(226, 240, 255, 0.34)',
  goalFrame: 'rgba(238, 248, 255, 0.72)',
  net: 'rgba(226, 240, 255, 0.16)',
  netMesh: 'rgba(226, 240, 255, 0.09)',
  carrier: 'rgba(255, 255, 255, 0.92)',
  ball: '#fbfdff',
  ballSeam: 'rgba(24, 40, 32, 0.45)',
  trail: 'rgb(251, 253, 255)',
  shadow: 'rgba(4, 10, 6, 0.42)',
  bannerPanel: 'rgba(6, 14, 10, 0.84)',
  bannerInk: 'rgba(255, 255, 255, 0.88)',
}

export const BANNER_TONE = {
  goal: 'rgba(56, 214, 132, 0.94)',
  card: 'rgba(247, 191, 62, 0.94)',
  danger: 'rgba(255, 107, 107, 0.96)',
  miss: 'rgba(226, 240, 255, 0.76)',
}

export type BannerTone = keyof typeof BANNER_TONE
