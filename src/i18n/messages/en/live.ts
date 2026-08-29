import type { MatchEventKind } from '../../../domain/engine'

type CommentaryLine = (
  team: string,
  zone: string,
  actor: string | null,
  assist: string | null,
) => string
import type { Messages } from '../messages'

export const live: Messages['live'] = {
  playbackSpeed: 'Playback speed',
  unmute: 'Unmute',
  mute: 'Mute',
  attackingRight: 'attacking →',
  attackingLeft: '← attacking',
  reducedMotion:
    'The pitch animation is off because you prefer reduced motion; the full match is listed as text alongside.',
  pause: 'Pause',
  resume: 'Resume',
  showResult: 'Show the result',
  matchStats: 'Match stats',
  commentaryTitle: 'Commentary',
  noEvents: 'Nothing worth reporting yet.',
  pitchLabel: 'Animation of the move on the pitch',
  idleHeadline: 'The match is on, waiting for the next move.',
  scoreLabel: (home, away) => `Score ${home} ${away}`,
  stats: {
    possession: 'Possession',
    shots: 'Shots',
    shotsOnTarget: 'Shots on target',
    expectedGoals: 'Expected goals',
    corners: 'Corners',
    cards: 'Cards',
  },
  zonePhrase: {
    0: 'in their own half',
    1: 'in the build-up zone',
    2: 'in midfield',
    3: 'in the final third',
    4: 'in the box',
  } as Record<number, string>,
  banner: {
    goal: 'GOAL',
    penaltyGoal: 'PENALTY GOAL',
    penaltyMissed: 'PENALTY MISSED',
    yellowCard: 'YELLOW CARD',
    redCard: 'RED CARD',
    post: 'OFF THE POST',
  },
  commentary: {
    KICK_OFF: () => 'Kick-off.',
    HALF_TIME: () => 'Half time.',
    FULL_TIME: () => 'Full time.',
    GOAL: (team: string, _zone: string, actor: string | null, assist: string | null) =>
      actor === null
        ? `GOAL! ${team} find the net.`
        : `GOAL! ${actor} (${team}) finds the net.${assist === null ? '' : ` Assist: ${assist}.`}`,
    PENALTY_AWARDED: (team: string) => `${team} win a penalty.`,
    PENALTY_GOAL: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `GOAL! ${team} convert the penalty.`
        : `GOAL! ${actor} (${team}) converts the penalty.`,
    PENALTY_MISSED: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `${team} waste the penalty.` : `${actor} (${team}) wastes the penalty.`,
    SHOT_SAVED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} shoot, the keeper saves.`
        : `${actor} (${team}) shoots, the keeper saves.`,
    SHOT_OFF: (team: string, zone: string, actor: string | null) =>
      actor === null
        ? `${team} try one ${zone}, it goes wide.`
        : `${actor} (${team}) tries one ${zone}, it goes wide.`,
    SHOT_BLOCKED: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} see the shot blocked.`
        : `${actor} (${team}) sees the shot blocked.`,
    POST: (team: string, _zone: string, actor: string | null) =>
      actor === null ? `${team} hit the post!` : `${actor} (${team}) hits the post!`,
    CORNER: (team: string) => `${team} take a corner.`,
    YELLOW_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} pick up a yellow card.`
        : `${actor} (${team}) picks up a yellow card.`,
    RED_CARD: (team: string, _zone: string, actor: string | null) =>
      actor === null
        ? `${team} are shown a red card!`
        : `${actor} (${team}) is shown a red card!`,
  } as Record<MatchEventKind, CommentaryLine>,
}
