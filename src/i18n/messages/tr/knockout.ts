import type { KnockoutRoundId } from '../../../domain/knockoutFormat'
import type { TieDecision } from '../../../domain/types'

export const knockout = {
  eyebrow: 'Eleme turları',
  title: 'Nakavt aşaması',
  intro:
    "İlk 8 doğrudan son 16'da. 9–24. sıralar play-off oynar, 25–36 elenir. Play-off, son 16, çeyrek ve yarı final çift maç; final tek maç.",
  lockedTitle: 'Nakavt aşaması kilitli',
  lockedBody: (total: number, completed: number) =>
    `Eşleşmeler lig aşaması sıralamasından belirlenir. ${total} haftanın ${completed} tanesi tamamlandı — kalan haftaları oynadığında play-off eşleşmeleri açılır.`,
  backToLeague: 'Lig aşamasına dön',
  playRound: (round: string) => `${round} oyna`,
  bracketTitle: 'Turnuva ağacı',
  bracketSubtitle: "son 16'dan finale",
  tieCount: (count: number) => `${count} eşleşme`,
  singleLeg: ' · tek maç',
  completed: 'Tamamlandı',
  watchTie: 'Eşleşmeyi izle',
  watchSecondLeg: 'Rövanşı izle →',
  skipToSecondLeg: 'Rövanşa atla →',
  backToTie: 'Eşleşme özetine dön →',
  singleLegLabel: 'Tek maç',
  legLabel: (leg: number) => `${leg}. maç`,
  tieResult: (winner: string, decision: string) => `${winner} · ${decision} turu geçti`,
  championEyebrow: 'Şampiyon',
  roundLabel: {
    PLAY_OFF: 'Play-off turu',
    ROUND_OF_16: 'Son 16',
    QUARTER_FINAL: 'Çeyrek final',
    SEMI_FINAL: 'Yarı final',
    FINAL: 'Final',
  } as Record<KnockoutRoundId, string>,
  decisionNote: {
    AGGREGATE: 'toplam skorla',
    EXTRA_TIME: 'uzatmada',
    PENALTIES: 'penaltılarda',
  } as Record<TieDecision, string>,
  decisionSuffix: {
    AGGREGATE: '',
    EXTRA_TIME: 'uzatma',
    PENALTIES: 'penaltı',
  } as Record<TieDecision, string>,
  tieNote: {
    AGGREGATE: '',
    EXTRA_TIME: 'uzatmada',
    PENALTIES: 'penaltılarda',
  } as Record<TieDecision, string>,
  slotPosition: (position: number) => `${position}. sıra`,
  slotWinner: (round: string, order: number) => `${round}${order} galibi`,
  runSummary: {
    champion: 'Şampiyon',
    advanced: {
      PLAY_OFF: 'Son 16 turuna yükseldi',
      ROUND_OF_16: 'Çeyrek finale yükseldi',
      QUARTER_FINAL: 'Yarı finale yükseldi',
      SEMI_FINAL: 'Finale yükseldi',
      FINAL: 'Şampiyon',
    } as Record<KnockoutRoundId, string>,
    eliminated: {
      PLAY_OFF: 'Play-off turunda elendi',
      ROUND_OF_16: 'Son 16 turunda elendi',
      QUARTER_FINAL: 'Çeyrek finalde elendi',
      SEMI_FINAL: 'Yarı finalde elendi',
      FINAL: 'Finalde kaybetti',
    } as Record<KnockoutRoundId, string>,
  },
}
