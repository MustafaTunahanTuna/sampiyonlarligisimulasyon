import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string
import type { Messages } from '../messages'

export const live: Messages['live'] = {
  playbackSpeed: 'Velocidad de reproducción',
  unmute: 'Activar el sonido',
  mute: 'Silenciar',
  attackingRight: 'ataca →',
  attackingLeft: '← ataca',
  reducedMotion:
    'La animación del campo está desactivada porque prefieres el movimiento reducido; el partido completo aparece como texto al lado.',
  pause: 'Pausar',
  resume: 'Reanudar',
  showResult: 'Mostrar el resultado',
  matchStats: 'Estadísticas del partido',
  commentaryTitle: 'Narración',
  noEvents: 'Todavía no hay nada que contar.',
  pitchLabel: 'Animación de la jugada sobre el campo',
  replayLabel: 'REPETICIÓN',
  idleHeadline: 'El partido sigue, esperando la próxima jugada.',
  scoreLabel: (home, away) => `Marcador ${home} ${away}`,
  summaryTitle: 'Resumen del partido',
  summaryEmpty: 'Todavía no hay goles ni tarjetas.',
  minuteLabel: (minute: number) => `Minuto ${minute}`,
  penaltyMark: '(P)',
  stats: {
    possession: 'Posesión',
    shots: 'Tiros',
    shotsOnTarget: 'Tiros a puerta',
    expectedGoals: 'Goles esperados',
    corners: 'Córners',
    cards: 'Tarjetas',
  },
  zonePhrase: {
    0: 'en su propio campo',
    1: 'en la zona de salida',
    2: 'en el centro del campo',
    3: 'en el último tercio',
    4: 'en el área',
  } as Record<number, string>,
  banner: {
    goal: 'GOL',
    penaltyGoal: 'GOL DE PENALTI',
    penaltyMissed: 'PENALTI FALLADO',
    yellowCard: 'TARJETA AMARILLA',
    redCard: 'TARJETA ROJA',
    post: 'AL POSTE',
    save: 'PARADA',
  },
  commentary: {
    KICK_OFF: () => 'Comienza el partido.',
    HALF_TIME: () => 'Descanso.',
    FULL_TIME: () => 'Final del partido.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      actor === null
        ? `¡GOL! ${team} encuentra la red.`
        : `¡GOL! ${actor} (${team}) encuentra la red.${assist === null ? '' : ` Asistencia: ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `${team} consigue un penalti.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `¡GOL! ${team} transforma el penalti.`
        : `¡GOL! ${actor} (${team}) transforma el penalti.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `${team} desperdicia el penalti.` : `${actor} (${team}) desperdicia el penalti.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} dispara y el portero ataja.`
        : `${actor} (${team}) dispara y el portero ataja.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      actor === null
        ? `${team} lo intenta ${zone} y se marcha fuera.`
        : `${actor} (${team}) lo intenta ${zone} y se marcha fuera.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `A ${team} le bloquean el disparo.`
        : `A ${actor} (${team}) le bloquean el disparo.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `¡${team} da en el poste!` : `¡${actor} (${team}) da en el poste!`,
    CORNER: (team: string) => `Córner para ${team}.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} ve una tarjeta amarilla.`
        : `${actor} (${team}) ve una tarjeta amarilla.`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `¡${team} ve la tarjeta roja!`
        : `¡${actor} (${team}) ve la tarjeta roja!`,
  } as Record<MatchEventKind, CommentaryLine>,
}
