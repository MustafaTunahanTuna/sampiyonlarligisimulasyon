import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string
import type { Messages } from '../messages'

export const live: Messages['live'] = {
  playbackSpeed: 'Vitesse de lecture',
  unmute: 'Activer le son',
  mute: 'Couper le son',
  attackingRight: 'attaque →',
  attackingLeft: '← attaque',
  reducedMotion:
    'L’animation du terrain est désactivée car vous préférez les animations réduites ; le match complet est listé sous forme de texte à côté.',
  pause: 'Pause',
  resume: 'Reprendre',
  showResult: 'Afficher le résultat',
  matchStats: 'Statistiques du match',
  commentaryTitle: 'Commentaires',
  noEvents: 'Rien à signaler pour l’instant.',
  pitchLabel: 'Animation de l’action sur le terrain',
  replayLabel: 'RALENTI',
  fullTime: 'FIN DU MATCH',
  idleHeadline: 'Le match est en cours, en attente de la prochaine action.',
  scoreLabel: (home, away) => `Score ${home} ${away}`,
  summaryTitle: 'Résumé du match',
  summaryEmpty: 'Aucun but ni carton pour le moment.',
  minuteLabel: (minute: number) => `${minute}e minute`,
  penaltyMark: '(P)',
  stats: {
    possession: 'Possession',
    shots: 'Tirs',
    shotsOnTarget: 'Tirs cadrés',
    expectedGoals: 'Buts attendus',
    corners: 'Corners',
    cards: 'Cartons',
  },
  zonePhrase: {
    0: 'dans son camp',
    1: 'dans la zone de relance',
    2: 'au milieu de terrain',
    3: 'dans le dernier tiers',
    4: 'dans la surface',
  } as Record<number, string>,
  banner: {
    goal: 'BUT',
    penaltyGoal: 'PENALTY TRANSFORMÉ',
    penaltyMissed: 'PENALTY MANQUÉ',
    yellowCard: 'CARTON JAUNE',
    redCard: 'CARTON ROUGE',
    post: 'SUR LE POTEAU',
    save: 'ARRÊT',
  },
  commentary: {
    KICK_OFF: () => 'Coup d’envoi.',
    HALF_TIME: () => 'Mi-temps.',
    FULL_TIME: () => 'Fin du match.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      actor === null
        ? `BUT ! ${team} trouve la faille.`
        : `BUT ! ${actor} (${team}) trouve la faille.${assist === null ? '' : ` Passe décisive : ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `${team} obtient un penalty.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `BUT ! ${team} transforme le penalty.`
        : `BUT ! ${actor} (${team}) transforme le penalty.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `${team} gâche le penalty.` : `${actor} (${team}) gâche le penalty.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} tire, le gardien s’interpose.`
        : `${actor} (${team}) tire, le gardien s’interpose.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      actor === null
        ? `${team} tente sa chance ${zone}, c’est à côté.`
        : `${actor} (${team}) tente sa chance ${zone}, c’est à côté.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} voit sa frappe contrée.`
        : `${actor} (${team}) voit sa frappe contrée.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `${team} trouve le poteau !` : `${actor} (${team}) trouve le poteau !`,
    CORNER: (team: string) => `Corner pour ${team}.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} écope d’un carton jaune.`
        : `${actor} (${team}) écope d’un carton jaune.`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} reçoit un carton rouge !`
        : `${actor} (${team}) reçoit un carton rouge !`,
  } as Record<MatchEventKind, CommentaryLine>,
}
