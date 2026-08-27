import type { Team } from '../domain/types'

interface ClubCrestProps {
  team: Team
  size: number
  large?: boolean
}

export function ClubCrest({ team, size, large = false }: ClubCrestProps) {
  return (
    <img
      src={large ? team.logoLarge : team.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className="shrink-0 object-contain"
    />
  )
}
