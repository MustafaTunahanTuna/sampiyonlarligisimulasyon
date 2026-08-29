import type { Messages } from '../messages'

export const share: Messages['share'] = {
  brand: 'Liga de Campeones 2026/27',
  brandWithStage: 'Liga de Campeones 2026/27 · Fase de liga',
  scenario: (seed) => `Escenario ${seed}`,
  knockoutTitle: 'Fase eliminatoria',
  knockoutSubtitle: (rounds) => `${rounds} rondas jugadas · cuadro`,
  playOffNote: 'los ganadores avanzan a octavos de final',
  champion: 'Campeón',
  footer: 'Datos del sorteo: uefa.com · Pronósticos y simulación',
  footerShort: 'Datos del sorteo: uefa.com · Pronósticos',
  standingsTitle: 'Clasificación',
  standingsSubtitle: (played, total, goals, perMatch) =>
    `${played}/${total} partidos · ${goals} goles · ${perMatch} por partido`,
  columns: ['PJ', 'G', 'E', 'P', 'DG', 'PTS'],
  legendLast16: 'Octavos',
  legendPlayOff: 'Play-off',
  legendEliminated: 'Eliminado',
  leagueSection: 'Fase de liga',
  knockoutSection: 'Fase eliminatoria',
  teamMeta: (country, pot) => `${country} · Bombo ${pot}`,
  positionBadge: (position) => `PUESTO ${position}`,
  teamRecord: (points, wins, draws, losses, goalsFor, goalsAgainst) =>
    `${points} pts · ${wins}V ${draws}E ${losses}D · ${goalsFor}-${goalsAgainst}`,
  downloadTeam: 'Descargar la tarjeta del club',
  downloadKnockout: 'Descargar la tarjeta del cuadro',
  downloadStandings: 'Descargar la clasificación',
  preparing: 'Preparando…',
  downloaded: 'Descargado',
  failed: 'No se ha podido crear',
  fileKnockout: 'eliminatorias',
  fileStandings: 'clasificacion',
}
