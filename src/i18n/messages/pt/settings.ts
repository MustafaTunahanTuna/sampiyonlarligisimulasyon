import type { Messages } from '../messages'

export const settings: Messages['settings'] = {
  title: 'Definições',
  intro:
    'Gere aqui o idioma, a experiência de jogo e o som; as escolhas ficam guardadas neste navegador.',
  languageTitle: 'Idioma',
  languageHint:
    'Idioma da interface. Ao escolheres um, a deteção automática pelo navegador é desativada.',
  matchTitle: 'Experiência de jogo',
  replaysLabel: 'Replays de golo',
  replaysHint: 'Após um golo, o lance é repetido uma vez em câmara lenta.',
  switchOn: 'Ligado',
  switchOff: 'Desligado',
  audioTitle: 'Som',
  audioHint:
    'Os níveis aplicam-se enquanto assistes a um jogo; para silenciar tudo usa o botão de som do ecrã do jogo.',
  ambienceLabel: 'Ambiente da bancada',
  effectsLabel: 'Efeitos de remate e apito',
  volumeValue: (percent: number) => `${percent}%`,
}
