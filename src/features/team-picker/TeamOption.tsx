import { ClubCrest } from '../../components/ClubCrest'
import { countryNameOf } from '../../i18n/countryNames'
import { useLocale } from '../../i18n/useLocale'
import type { Team } from '../../domain/types'

interface TeamOptionProps {
  team: Team
  isDraft: boolean
  isCurrent: boolean
  onDraft: (team: Team) => void
}

export function TeamOption({ team, isDraft, isCurrent, onDraft }: TeamOptionProps) {
  const { locale, messages: t } = useLocale()

  return (
    <button
      type="button"
      onClick={() => onDraft(team)}
      aria-pressed={isDraft}
      className={`group flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left transition-all ${
        isDraft
          ? 'bg-accent/15 text-fg ring-1 ring-accent'
          : 'text-muted hover:bg-surface hover:text-fg'
      }`}
    >
      <ClubCrest team={team} size={30} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{team.name}</span>
        <span className="block truncate text-xs text-muted">{countryNameOf(team, locale)}</span>
      </span>
      {isCurrent && <span className="eyebrow shrink-0 text-accent">{t.team.current}</span>}
    </button>
  )
}
