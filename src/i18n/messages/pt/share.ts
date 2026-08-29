import type { Messages } from '../messages'

export const share: Messages['share'] = {
  brand: 'Liga dos Campeões 2026/27',
  brandWithStage: 'Liga dos Campeões 2026/27 · Fase de liga',
  scenario: (seed) => `Cenário ${seed}`,
  knockoutTitle: 'Fase a eliminar',
  knockoutSubtitle: (rounds) => `${rounds} rondas jogadas · quadro`,
  playOffNote: 'os vencedores avançam para os oitavos de final',
  champion: 'Campeão',
  footer: 'Dados do sorteio: uefa.com · Previsões e simulação',
  footerShort: 'Dados do sorteio: uefa.com · Previsões',
  standingsTitle: 'Classificação',
  standingsSubtitle: (played, total, goals, perMatch) =>
    `${played}/${total} jogos · ${goals} golos · ${perMatch} por jogo`,
  columns: ['J', 'V', 'E', 'D', 'DG', 'PTS'],
  legendLast16: 'Oitavos',
  legendPlayOff: 'Play-off',
  legendEliminated: 'Eliminado',
  leagueSection: 'Fase de liga',
  knockoutSection: 'Fase a eliminar',
  teamMeta: (country, pot) => `${country} · Pote ${pot}`,
  positionBadge: (position) => `LUGAR ${position}`,
  teamRecord: (points, wins, draws, losses, goalsFor, goalsAgainst) =>
    `${points} pts · ${wins}V ${draws}E ${losses}D · ${goalsFor}-${goalsAgainst}`,
  downloadTeam: 'Transferir o cartão do clube',
  downloadKnockout: 'Transferir o cartão do quadro',
  downloadStandings: 'Transferir a classificação',
  preparing: 'A preparar…',
  downloaded: 'Transferido',
  failed: 'Não foi possível criar',
  fileKnockout: 'eliminatorias',
  fileStandings: 'classificacao',
}
