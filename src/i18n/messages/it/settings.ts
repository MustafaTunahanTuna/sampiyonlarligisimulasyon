import type { Messages } from '../messages'

export const settings: Messages['settings'] = {
  title: 'Impostazioni',
  intro:
    'Gestisci qui la lingua, l’esperienza di partita e l’audio; le scelte vengono salvate in questo browser.',
  languageTitle: 'Lingua',
  languageHint:
    'Lingua dell’interfaccia. Scegliendone una si disattiva il rilevamento automatico dal browser.',
  matchTitle: 'Esperienza di partita',
  replaysLabel: 'Replay dei gol',
  replaysHint: 'Dopo un gol l’azione viene riproposta una volta al rallentatore.',
  switchOn: 'Attivo',
  switchOff: 'Disattivo',
  audioTitle: 'Audio',
  audioHint:
    'I livelli si applicano durante la partita; per silenziare tutto usa il pulsante audio nella schermata della partita.',
  ambienceLabel: 'Atmosfera degli spalti',
  effectsLabel: 'Effetti di tiro e fischietto',
  volumeValue: (percent: number) => `${percent}%`,
}
