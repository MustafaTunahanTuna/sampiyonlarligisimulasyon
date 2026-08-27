import { ClubCrest } from '../../components/ClubCrest'
import { Starball } from '../../components/Starball'
import type { Team } from '../../domain/types'

interface ChampionBannerProps {
  champion: Team
  isFavourite: boolean
}

export function ChampionBanner({ champion, isFavourite }: ChampionBannerProps) {
  return (
    <section className="floodlight animate-modal-in panel flex flex-wrap items-center gap-x-6 gap-y-4 p-6">
      <ClubCrest team={champion} size={72} large />
      <div className="min-w-0 flex-1">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <Starball className="size-3.5" />
          {isFavourite ? 'Takımın şampiyon' : 'Şampiyon'}
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
          {champion.name}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {champion.countryName} · {champion.pot}. torbadan yola çıktı
        </p>
      </div>
    </section>
  )
}
