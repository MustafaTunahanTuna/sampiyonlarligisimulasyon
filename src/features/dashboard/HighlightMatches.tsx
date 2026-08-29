import { ClubCrest } from '../../components/ClubCrest'
import { useTranslation } from '../../i18n/useTranslation'
import type { PlayedMatchSummary } from '../../domain/leagueStats'

interface HighlightMatchesProps {
  biggestWin: PlayedMatchSummary | null
  highestScoring: PlayedMatchSummary | null
}

function Highlight({ label, match }: { label: string; match: PlayedMatchSummary | null }) {
  if (match === null) return null

  return (
    <div className="panel min-w-0 p-4">
      <p className="eyebrow text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <ClubCrest team={match.homeTeam} size={28} />
        <span className="font-display text-2xl font-extrabold tabular-nums">
          {match.homeGoals}–{match.awayGoals}
        </span>
        <ClubCrest team={match.awayTeam} size={28} />
      </div>
      <p className="mt-1.5 truncate text-xs text-muted">
        {match.homeTeam.name} – {match.awayTeam.name}
      </p>
    </div>
  )
}

export function HighlightMatches({ biggestWin, highestScoring }: HighlightMatchesProps) {
  const t = useTranslation()

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Highlight label={t.dashboard.biggestWin} match={biggestWin} />
      <Highlight label={t.dashboard.highestScoring} match={highestScoring} />
    </div>
  )
}
