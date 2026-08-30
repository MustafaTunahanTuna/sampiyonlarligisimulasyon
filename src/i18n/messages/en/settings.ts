import type { Messages } from '../messages'

export const settings: Messages['settings'] = {
  title: 'Settings',
  intro: 'Manage language, match experience and sound here; your choices are stored in this browser.',
  languageTitle: 'Language',
  languageHint:
    'Interface language. Picking one disables automatic detection from your browser language.',
  matchTitle: 'Match experience',
  replaysLabel: 'Goal replays',
  replaysHint: 'After a goal the move is shown once more in slow motion.',
  switchOn: 'On',
  switchOff: 'Off',
  audioTitle: 'Sound',
  audioHint:
    'Levels apply while watching a match; use the mute button on the match screen to silence everything.',
  ambienceLabel: 'Crowd ambience',
  effectsLabel: 'Kick and whistle effects',
  volumeValue: (percent: number) => `${percent}%`,
}
