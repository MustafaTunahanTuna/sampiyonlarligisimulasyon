import { ClubCrest } from '../../components/ClubCrest'
import { Starball } from '../../components/Starball'
import { countryNameOf } from '../../i18n/countryNames'
import { useLocale } from '../../i18n/useLocale'
import type { Team } from '../../domain/types'

interface ChampionBannerProps {
  champion: Team
  isFavourite: boolean
}

export function ChampionBanner({ champion, isFavourite }: ChampionBannerProps) {
  const { locale, messages: t } = useLocale()

  return (
    <section className="floodlight animate-modal-in panel flex flex-wrap items-center gap-x-6 gap-y-4 p-6">
      <ClubCrest team={champion} size={72} large />
      <div className="min-w-0 flex-1">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <Starball className="size-3.5" />
          {isFavourite ? t.team.yourTeamIsChampion : t.knockout.championEyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
          {champion.name}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {t.team.championOrigin(countryNameOf(champion, locale), champion.pot)}
        </p>
      </div>
    </section>
  )
}
