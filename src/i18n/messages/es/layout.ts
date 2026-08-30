import type { Messages } from '../messages'

export const layout: Messages['layout'] = {
  documentTitle: 'Fase de liga 2026/27 — Elige tu club, sigue cada partido',
  brandName: 'Liga de Campeones',
  brandStage: 'Fase de liga',
  home: 'Inicio',
  teamSelection: 'Elección de club',
  mainNavigation: 'Navegación principal',
  navLeague: 'Liga',
  navKnockout: 'Eliminatorias',
  navTeam: 'Mi club',
  languageGroup: 'Selección de idioma',
  navSettings: 'Ajustes',
  drawEyebrow: (date, venue) => `${date} · sorteo de ${venue}`,
  leaguePhase: 'Fase de liga',
  drawSummary: (teams, matches) =>
    `${teams} clubes, ${matches} partidos. Empieza eligiendo el club al que sigues y después pronostica los marcadores o simula la temporada: la clasificación y las estadísticas de goles se recalculan al instante.`,
  footerSourcePrefix: 'Fuente de los datos:',
  footerSourceLink: 'centro del sorteo de uefa.com',
  footerSourceSuffix: (date) =>
    `— extraídos el ${date}. La clasificación y las estadísticas se calculan a partir de tus propios pronósticos.`,
  footerDisclaimer:
    'Una aplicación no oficial hecha por aficionados. Los escudos pertenecen a sus respectivos clubes.',
}
