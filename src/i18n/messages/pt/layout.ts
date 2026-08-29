import type { Messages } from '../messages'

export const layout: Messages['layout'] = {
  documentTitle: 'Fase de liga 2026/27 — Escolhe o teu clube, segue cada jogo',
  brandName: 'Liga dos Campeões',
  brandStage: 'Fase de liga',
  home: 'Início',
  teamSelection: 'Escolha do clube',
  mainNavigation: 'Navegação principal',
  navLeague: 'Liga',
  navKnockout: 'Eliminatórias',
  navTeam: 'O meu clube',
  languageGroup: 'Seleção do idioma',
  drawEyebrow: (date, venue) => `${date} · sorteio de ${venue}`,
  leaguePhase: 'Fase de liga',
  drawSummary: (teams, matches) =>
    `${teams} clubes, ${matches} jogos. Começa por escolher o clube que apoias e depois prevê os resultados ou simula a época — a classificação e as estatísticas de golos são recalculadas de imediato.`,
  footerSourcePrefix: 'Fonte dos dados:',
  footerSourceLink: 'centro do sorteio da uefa.com',
  footerSourceSuffix: (date) =>
    `— recolhidos a ${date}. A classificação e as estatísticas são calculadas a partir das tuas próprias previsões.`,
  footerDisclaimer:
    'Uma aplicação não oficial, feita por adeptos. Os emblemas pertencem aos respetivos clubes.',
}
