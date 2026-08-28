import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const handle = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    media.addEventListener('change', handle)
    return () => media.removeEventListener('change', handle)
  }, [])

  return prefersReduced
}
