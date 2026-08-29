export const standings = {
  title: 'Puan tablosu',
  empty:
    'Tablo tahminlerinden oluşur. Skorları elle girerek ya da sezonu simüle ederek başla — 36 takımın sıralaması anında hesaplanır.',
  qualificationZone: {
    LAST_16: 'Son 16 turuna doğrudan',
    PLAY_OFF: 'Play-off turu',
    ELIMINATED: 'Elenir',
  },
  qualificationOutcome: {
    LAST_16: 'Son 16 turuna yükseldi',
    PLAY_OFF: 'Play-off turuna kaldı',
    ELIMINATED: 'Lig aşamasında elendi',
  },
  columnPosition: '#',
  columnTeam: 'Takım',
  columnPlayed: 'O',
  columnWins: 'G',
  columnDraws: 'B',
  columnLosses: 'M',
  columnGoals: 'Gol',
  columnGoalDifference: 'Av',
  columnPoints: 'P',
  openTeam: (team: string) => `${team} maçlarını gör`,
  position: (position: number) => `${position}. sıra`,
  pointsSuffix: (points: number) => `${points} puan`,
  homeVenue: 'Ev sahibi',
  awayVenue: 'Deplasman',
}
