import { drawPool } from '../domain/drawPool'
import { formatDrawDate } from '../i18n/formatters'
import { useLocale } from '../i18n/useLocale'

interface DrawIntroProps {
  hasFavouriteTeam: boolean
}

export function DrawIntro({ hasFavouriteTeam }: DrawIntroProps) {
  const { locale, messages: t } = useLocale()
  const { meta, teams, matches } = drawPool

  return (
    <div className="floodlight relative overflow-hidden border-b border-line">
      <div
        className={`relative mx-auto max-w-5xl px-5 ${hasFavouriteTeam ? 'py-10' : 'py-16 sm:py-24'}`}
      >
        <p className="eyebrow text-accent">
          {t.layout.drawEyebrow(formatDrawDate(meta.drawDate, locale), meta.venue)}
        </p>
        <h1
          className={`mt-3 max-w-2xl font-display font-extrabold uppercase leading-[0.95] tracking-tight ${
            hasFavouriteTeam ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-7xl'
          }`}
        >
          {t.layout.leaguePhase}
          <span className="block bg-linear-to-r from-accent to-fg bg-clip-text text-transparent">
            {meta.season}
          </span>
        </h1>
        {!hasFavouriteTeam && (
          <p className="mt-6 max-w-lg text-muted">
            {t.layout.drawSummary(teams.length, matches.length)}
          </p>
        )}
      </div>
    </div>
  )
}
