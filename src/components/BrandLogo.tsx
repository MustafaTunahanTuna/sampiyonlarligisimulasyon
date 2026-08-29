import { useTranslation } from '../i18n/useTranslation'

const ORBIT_STAR_COUNT = 6
const ORBIT_RADIUS = 33
const ORBIT_STAR_RADIUS = 7.5
const CENTRE_STAR_RADIUS = 17

function starPath(centreX: number, centreY: number, radius: number, rotation = 0): string {
  const points = 5
  const commands: string[] = []
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (Math.PI / points) * index - Math.PI / 2 + rotation
    const distance = index % 2 === 0 ? radius : radius * 0.4
    const x = centreX + Math.cos(angle) * distance
    const y = centreY + Math.sin(angle) * distance
    commands.push(`${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `${commands.join(' ')} Z`
}

const ORBIT_STARS = Array.from({ length: ORBIT_STAR_COUNT }, (_, index) => {
  const angle = (Math.PI * 2 * index) / ORBIT_STAR_COUNT - Math.PI / 2
  return starPath(
    50 + Math.cos(angle) * ORBIT_RADIUS,
    50 + Math.sin(angle) * ORBIT_RADIUS,
    ORBIT_STAR_RADIUS,
    angle + Math.PI / 2,
  )
})

interface BrandLogoProps {
  season: string
}

export function BrandLogo({ season }: BrandLogoProps) {
  const t = useTranslation()

  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-9 shrink-0">
        <defs>
          <linearGradient id="brand-neon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.15 205)" />
            <stop offset="55%" stopColor="oklch(0.62 0.24 268)" />
            <stop offset="100%" stopColor="oklch(0.62 0.28 328)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#brand-neon)" strokeWidth="2.5" />
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="url(#brand-neon)"
          strokeWidth="1"
          opacity="0.45"
        />
        {ORBIT_STARS.map((path) => (
          <path key={path} d={path} fill="url(#brand-neon)" opacity="0.75" />
        ))}
        <path d={starPath(50, 50, CENTRE_STAR_RADIUS)} fill="url(#brand-neon)" />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.9rem] font-extrabold uppercase tracking-[0.06em] text-fg">
          {t.layout.brandName}
        </span>
        <span className="eyebrow mt-1 text-accent">
          {season} <span className="text-muted">{t.layout.brandStage}</span>
        </span>
      </span>
    </span>
  )
}
