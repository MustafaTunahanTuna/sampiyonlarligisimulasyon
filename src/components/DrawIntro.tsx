import { drawPool } from '../domain/drawPool'

const DRAW_DATE_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

interface DrawIntroProps {
  hasFavouriteTeam: boolean
}

export function DrawIntro({ hasFavouriteTeam }: DrawIntroProps) {
  const { meta, teams, matches } = drawPool

  return (
    <div className="floodlight relative overflow-hidden border-b border-line">
      <div
        className={`relative mx-auto max-w-5xl px-5 ${hasFavouriteTeam ? 'py-10' : 'py-16 sm:py-24'}`}
      >
        <p className="eyebrow text-accent">
          {DRAW_DATE_FORMAT.format(new Date(meta.drawDate))} · {meta.venue} kurası
        </p>
        <h1
          className={`mt-3 max-w-2xl font-display font-extrabold uppercase leading-[0.95] tracking-tight ${
            hasFavouriteTeam ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-7xl'
          }`}
        >
          Lig aşaması
          <span className="block bg-linear-to-r from-accent to-fg bg-clip-text text-transparent">
            {meta.season}
          </span>
        </h1>
        {!hasFavouriteTeam && (
          <p className="mt-6 max-w-lg text-muted">
            {teams.length} takım, {matches.length} eşleşme. Başlamak için taraftarı olduğun kulübü
            seç; ardından skorları tahmin et ya da sezonu simüle et, puan tablosu ve gol
            istatistikleri anında hesaplansın.
          </p>
        )}
      </div>
    </div>
  )
}
