import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string
import type { Messages } from '../messages'

export const live: Messages['live'] = {
  playbackSpeed: 'Velocità di riproduzione',
  unmute: 'Attiva l’audio',
  mute: 'Disattiva l’audio',
  attackingRight: 'attacca →',
  attackingLeft: '← attacca',
  reducedMotion:
    'L’animazione del campo è disattivata perché preferisci il movimento ridotto; la partita completa è elencata come testo a fianco.',
  pause: 'Pausa',
  resume: 'Riprendi',
  showResult: 'Mostra il risultato',
  matchStats: 'Statistiche della partita',
  commentaryTitle: 'Cronaca',
  noEvents: 'Ancora nulla da segnalare.',
  pitchLabel: 'Animazione dell’azione sul campo',
  replayLabel: 'REPLAY',
  idleHeadline: 'La partita prosegue, in attesa della prossima azione.',
  scoreLabel: (home, away) => `Risultato ${home} ${away}`,
  summaryTitle: 'Riepilogo della partita',
  summaryEmpty: 'Ancora nessun gol o cartellino.',
  minuteLabel: (minute: number) => `${minute}° minuto`,
  penaltyMark: '(P)',
  stats: {
    possession: 'Possesso',
    shots: 'Tiri',
    shotsOnTarget: 'Tiri in porta',
    expectedGoals: 'Gol attesi',
    corners: 'Calci d’angolo',
    cards: 'Cartellini',
  },
  zonePhrase: {
    0: 'nella propria metà campo',
    1: 'in zona di costruzione',
    2: 'a centrocampo',
    3: 'nell’ultimo terzo',
    4: 'in area',
  } as Record<number, string>,
  banner: {
    goal: 'GOL',
    penaltyGoal: 'GOL SU RIGORE',
    penaltyMissed: 'RIGORE SBAGLIATO',
    yellowCard: 'CARTELLINO GIALLO',
    redCard: 'CARTELLINO ROSSO',
    post: 'SUL PALO',
    save: 'PARATA',
  },
  commentary: {
    KICK_OFF: () => 'Si comincia.',
    HALF_TIME: () => 'Intervallo.',
    FULL_TIME: () => 'Finita.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      actor === null
        ? `GOL! Il ${team} trova la rete.`
        : `GOL! ${actor} (${team}) trova la rete.${assist === null ? '' : ` Assist: ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `Il ${team} guadagna un rigore.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `GOL! Il ${team} trasforma il rigore.`
        : `GOL! ${actor} (${team}) trasforma il rigore.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `Il ${team} spreca il rigore.` : `${actor} (${team}) spreca il rigore.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `Il ${team} tira, il portiere para.`
        : `${actor} (${team}) tira, il portiere para.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      actor === null
        ? `Il ${team} ci prova ${zone}, ma va fuori.`
        : `${actor} (${team}) ci prova ${zone}, ma va fuori.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `Il tiro del ${team} viene murato.`
        : `Il tiro di ${actor} (${team}) viene murato.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `Il ${team} colpisce il palo!` : `${actor} (${team}) colpisce il palo!`,
    CORNER: (team: string) => `Calcio d’angolo per il ${team}.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `Cartellino giallo per il ${team}.`
        : `Cartellino giallo per ${actor} (${team}).`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `Cartellino rosso per il ${team}!`
        : `Cartellino rosso per ${actor} (${team})!`,
  } as Record<MatchEventKind, CommentaryLine>,
}
