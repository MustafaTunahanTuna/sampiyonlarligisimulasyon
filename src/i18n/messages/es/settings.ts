import type { Messages } from '../messages'

export const settings: Messages['settings'] = {
  title: 'Ajustes',
  intro:
    'Gestiona aquí el idioma, la experiencia de partido y el sonido; tus preferencias se guardan en este navegador.',
  languageTitle: 'Idioma',
  languageHint:
    'Idioma de la interfaz. Al elegir uno se desactiva la detección automática según el navegador.',
  matchTitle: 'Experiencia de partido',
  replaysLabel: 'Repeticiones de gol',
  replaysHint: 'Tras un gol, la jugada se repite una vez a cámara lenta.',
  switchOn: 'Activado',
  switchOff: 'Desactivado',
  audioTitle: 'Sonido',
  audioHint:
    'Los niveles se aplican mientras ves un partido; para silenciarlo todo usa el botón de silencio de la pantalla del partido.',
  ambienceLabel: 'Ambiente de la grada',
  effectsLabel: 'Efectos de golpeo y silbato',
  volumeValue: (percent: number) => `${percent} %`,
}
