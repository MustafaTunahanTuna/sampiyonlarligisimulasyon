import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string
import type { Messages } from '../messages'

export const live: Messages['live'] = {
  playbackSpeed: 'Velocidade de reprodução',
  unmute: 'Ativar o som',
  mute: 'Desativar o som',
  attackingRight: 'ataca →',
  attackingLeft: '← ataca',
  reducedMotion:
    'A animação do campo está desligada porque preferes movimento reduzido; o jogo completo está listado como texto ao lado.',
  pause: 'Pausa',
  resume: 'Retomar',
  showResult: 'Mostrar o resultado',
  matchStats: 'Estatísticas do jogo',
  commentaryTitle: 'Relato',
  noEvents: 'Ainda não há nada a assinalar.',
  pitchLabel: 'Animação do lance no campo',
  replayLabel: 'REPLAY',
  idleHeadline: 'O jogo decorre, à espera do próximo lance.',
  scoreLabel: (home, away) => `Resultado ${home} ${away}`,
  summaryTitle: 'Resumo da partida',
  summaryEmpty: 'Ainda não há gols nem cartões.',
  minuteLabel: (minute: number) => `Minuto ${minute}`,
  penaltyMark: '(P)',
  stats: {
    possession: 'Posse de bola',
    shots: 'Remates',
    shotsOnTarget: 'Remates à baliza',
    expectedGoals: 'Golos esperados',
    corners: 'Cantos',
    cards: 'Cartões',
  },
  zonePhrase: {
    0: 'no seu meio-campo',
    1: 'na zona de construção',
    2: 'no meio-campo',
    3: 'no último terço',
    4: 'na área',
  } as Record<number, string>,
  banner: {
    goal: 'GOLO',
    penaltyGoal: 'GOLO DE PENÁLTI',
    penaltyMissed: 'PENÁLTI FALHADO',
    yellowCard: 'CARTÃO AMARELO',
    redCard: 'CARTÃO VERMELHO',
    post: 'NO POSTE',
    save: 'DEFESA',
  },
  commentary: {
    KICK_OFF: () => 'Início do jogo.',
    HALF_TIME: () => 'Intervalo.',
    FULL_TIME: () => 'Final do jogo.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      actor === null
        ? `GOLO! O ${team} encontra a baliza.`
        : `GOLO! ${actor} (${team}) encontra a baliza.${assist === null ? '' : ` Assistência: ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `O ${team} conquista um penálti.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `GOLO! O ${team} converte o penálti.`
        : `GOLO! ${actor} (${team}) converte o penálti.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `O ${team} desperdiça o penálti.` : `${actor} (${team}) desperdiça o penálti.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `O ${team} remata e o guarda-redes defende.`
        : `${actor} (${team}) remata e o guarda-redes defende.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      actor === null
        ? `O ${team} tenta ${zone}, mas sai ao lado.`
        : `${actor} (${team}) tenta ${zone}, mas sai ao lado.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `O remate do ${team} é bloqueado.`
        : `O remate de ${actor} (${team}) é bloqueado.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `O ${team} acerta no poste!` : `${actor} (${team}) acerta no poste!`,
    CORNER: (team: string) => `Canto para o ${team}.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `O ${team} vê um cartão amarelo.`
        : `${actor} (${team}) vê um cartão amarelo.`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `O ${team} vê um cartão vermelho!`
        : `${actor} (${team}) vê um cartão vermelho!`,
  } as Record<MatchEventKind, CommentaryLine>,
}
