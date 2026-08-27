import { ChampionBanner } from './ChampionBanner'
import { KnockoutRoundSection } from './KnockoutRoundSection'
import { useKnockoutRunner } from './useKnockoutRunner'
import { Button } from '../../components/Button'
import { completedMatchdayCount, MATCHDAY_NUMBERS } from '../../domain/matchdays'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

interface KnockoutStageViewProps {
  favouriteTeam: Team | null
  onBackToLeague: () => void
}

export function KnockoutStageView({ favouriteTeam, onBackToLeague }: KnockoutStageViewProps) {
  const { state } = usePredictions()
  const { stage, playableRound, playNextRound } = useKnockoutRunner()
  const completed = completedMatchdayCount(state.predictions)

  if (completed < MATCHDAY_NUMBERS.length) {
    return (
      <section className="panel p-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          Nakavt aşaması kilitli
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Eşleşmeler lig aşaması sıralamasından belirlenir. {MATCHDAY_NUMBERS.length} haftanın{' '}
          {completed} tanesi tamamlandı — kalan haftaları oynadığında play-off eşleşmeleri açılır.
        </p>
        <div className="mt-5">
          <Button variant="primary" onClick={onBackToLeague}>
            Lig aşamasına dön
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Eleme turları</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            Nakavt aşaması
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted">
            İlk 8 doğrudan son 16'da. 9–24. sıralar play-off oynar, 25–36 elenir. Play-off, son 16,
            çeyrek ve yarı final çift maç; final tek maç.
          </p>
        </div>
        {playableRound !== null && (
          <Button variant="primary" onClick={playNextRound}>
            {playableRound.label} oyna
          </Button>
        )}
      </header>

      {stage.champion !== null && (
        <ChampionBanner
          champion={stage.champion}
          isFavourite={stage.champion.id === favouriteTeam?.id}
        />
      )}

      {stage.rounds.map((round) => (
        <KnockoutRoundSection
          key={round.id}
          round={round}
          favouriteTeamId={favouriteTeam?.id ?? null}
          isPlayable={round.id === playableRound?.id}
          onPlay={playNextRound}
        />
      ))}
    </div>
  )
}
