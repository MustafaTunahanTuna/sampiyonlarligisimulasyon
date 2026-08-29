import { useState } from 'react'
import { ChampionBanner } from './ChampionBanner'
import { BracketTree } from './BracketTree'
import { KnockoutMatchModal } from './KnockoutMatchModal'
import { KnockoutRoundSection } from './KnockoutRoundSection'
import { useKnockoutRunner } from './useKnockoutRunner'
import { useTranslation } from '../../i18n/useTranslation'
import { Button } from '../../components/Button'
import { DownloadKnockoutButton } from '../share/DownloadKnockoutButton'
import { completedMatchdayCount, MATCHDAY_NUMBERS } from '../../domain/matchdays'
import { usePredictions } from '../../state/usePredictions'
import type { KnockoutTie, Team } from '../../domain/types'

const BRACKET_ANCHOR_ID = 'turnuva-agaci'

interface KnockoutStageViewProps {
  favouriteTeam: Team | null
  onBackToLeague: () => void
}

export function KnockoutStageView({ favouriteTeam, onBackToLeague }: KnockoutStageViewProps) {
  const { state } = usePredictions()
  const { stage, playableRound, playNextRound } = useKnockoutRunner()
  const t = useTranslation()
  const completed = completedMatchdayCount(state.predictions)
  const [watchedTieId, setWatchedTieId] = useState<string | null>(null)
  const isBracketRound = playableRound !== null && playableRound.id !== 'PLAY_OFF'

  const watched = stage.rounds
    .flatMap((round) => round.ties.map((tie) => ({ tie, outcome: round.outcomes.get(tie.id) })))
    .find((entry) => entry.tie.id === watchedTieId)

  const scrollToBracket = () => {
    requestAnimationFrame(() => {
      document
        .getElementById(BRACKET_ANCHOR_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const favouriteTieOf = (tie: KnockoutTie) =>
    favouriteTeam !== null &&
    (tie.seeded?.id === favouriteTeam.id || tie.challenger?.id === favouriteTeam.id)

  const playRound = () => {
    playNextRound()
    const favouriteTie = playableRound?.ties.find(favouriteTieOf)
    if (favouriteTie !== undefined) {
      setWatchedTieId(favouriteTie.id)
      return
    }
    if (isBracketRound) scrollToBracket()
  }

  const closeWatch = () => {
    const wasBracketTie = watched !== undefined && watched.tie.round !== 'PLAY_OFF'
    setWatchedTieId(null)
    if (wasBracketTie) scrollToBracket()
  }

  if (completed < MATCHDAY_NUMBERS.length) {
    return (
      <section className="panel p-6">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {t.knockout.lockedTitle}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          {t.knockout.lockedBody(MATCHDAY_NUMBERS.length, completed)}
        </p>
        <div className="mt-5">
          <Button variant="primary" onClick={onBackToLeague}>
            {t.knockout.backToLeague}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">{t.knockout.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            {t.knockout.title}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted">{t.knockout.intro}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {playableRound !== null && (
            <Button variant="primary" onClick={playRound}>
              {t.knockout.playRound(t.knockout.roundLabel[playableRound.id])}
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

      <KnockoutRoundSection
        round={stage.rounds[0]}
        favouriteTeamId={favouriteTeam?.id ?? null}
        onWatchTie={(tie) => setWatchedTieId(tie.id)}
      />

      <section id={BRACKET_ANCHOR_ID} className="scroll-mt-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-strong pb-3">
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
            {t.knockout.bracketTitle}
            <span className="eyebrow pl-3 text-muted">{t.knockout.bracketSubtitle}</span>
          </h3>
          {isBracketRound && (
            <Button variant="primary" onClick={playRound}>
              {t.knockout.playRound(t.knockout.roundLabel[playableRound.id])}
            </Button>
          )}
        </header>

        <div className="mt-5">
          <BracketTree
            stage={stage}
            favouriteTeamId={favouriteTeam?.id ?? null}
            onWatchTie={(tie) => setWatchedTieId(tie.id)}
          />
        </div>
      </section>

      {watched !== undefined && (
        <KnockoutMatchModal
          key={watched.tie.id}
          tie={watched.tie}
          outcome={watched.outcome}
          onClose={closeWatch}
        />
      )}
    </div>
  )
}
