import { ChampionBanner } from './ChampionBanner'
import { BracketTree } from './BracketTree'
import { KnockoutRoundSection } from './KnockoutRoundSection'
import { useKnockoutRunner } from './useKnockoutRunner'
import { Button } from '../../components/Button'
import { DownloadKnockoutButton } from '../share/DownloadKnockoutButton'
import { completedMatchdayCount, MATCHDAY_NUMBERS } from '../../domain/matchdays'
import { usePredictions } from '../../state/usePredictions'
import type { Team } from '../../domain/types'

const BRACKET_ANCHOR_ID = 'turnuva-agaci'

interface KnockoutStageViewProps {
  favouriteTeam: Team | null
  onBackToLeague: () => void
}

export function KnockoutStageView({ favouriteTeam, onBackToLeague }: KnockoutStageViewProps) {
  const { state } = usePredictions()
  const { stage, playableRound, playNextRound } = useKnockoutRunner()
  const completed = completedMatchdayCount(state.predictions)
  const isBracketRound = playableRound !== null && playableRound.id !== 'PLAY_OFF'

  const playRound = () => {
    playNextRound()
    if (isBracketRound) {
      requestAnimationFrame(() => {
        document
          .getElementById(BRACKET_ANCHOR_ID)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

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
        <div className="flex flex-wrap items-center gap-3">
          {playableRound !== null && (
            <Button variant="primary" onClick={playRound}>
              {playableRound.label} oyna
            </Button>
          )}
          {stage.rounds.some((round) => round.isComplete) && (
            <DownloadKnockoutButton
              stage={stage}
              favouriteTeam={favouriteTeam}
              seed={state.seed}
            />
          )}
        </div>
      </header>

      {stage.champion !== null && (
        <ChampionBanner
          champion={stage.champion}
          isFavourite={stage.champion.id === favouriteTeam?.id}
        />
      )}

      <KnockoutRoundSection round={stage.rounds[0]} favouriteTeamId={favouriteTeam?.id ?? null} />

      <section id={BRACKET_ANCHOR_ID} className="scroll-mt-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-strong pb-3">
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
            Turnuva ağacı
            <span className="eyebrow pl-3 text-muted">son 16'dan finale</span>
          </h3>
          {isBracketRound && (
            <Button variant="primary" onClick={playRound}>
              {playableRound.label} oyna
            </Button>
          )}
        </header>

        <div className="mt-5">
          <BracketTree stage={stage} favouriteTeamId={favouriteTeam?.id ?? null} />
        </div>
      </section>
    </div>
  )
}
