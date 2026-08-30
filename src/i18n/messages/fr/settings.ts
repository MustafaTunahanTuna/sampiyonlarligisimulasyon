import type { Messages } from '../messages'

export const settings: Messages['settings'] = {
  title: 'Paramètres',
  intro:
    'Gère ici la langue, l’expérience de match et le son ; tes choix sont enregistrés dans ce navigateur.',
  languageTitle: 'Langue',
  languageHint:
    'Langue de l’interface. Un choix manuel désactive la détection automatique depuis le navigateur.',
  matchTitle: 'Expérience de match',
  replaysLabel: 'Ralentis des buts',
  replaysHint: 'Après un but, l’action est rejouée une fois au ralenti.',
  switchOn: 'Activé',
  switchOff: 'Désactivé',
  audioTitle: 'Son',
  audioHint:
    'Les niveaux s’appliquent pendant le match ; pour tout couper, utilise le bouton muet de l’écran de match.',
  ambienceLabel: 'Ambiance des tribunes',
  effectsLabel: 'Effets de frappe et de sifflet',
  volumeValue: (percent: number) => `${percent} %`,
}
