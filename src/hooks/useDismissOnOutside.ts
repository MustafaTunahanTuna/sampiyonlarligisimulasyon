import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useDismissOnOutside(
  container: RefObject<HTMLElement | null>,
  isActive: boolean,
  dismiss: () => void,
) {
  useEffect(() => {
    if (!isActive) return

    const dismissOnPointer = (event: PointerEvent) => {
      const { target } = event
      if (target instanceof Node && container.current?.contains(target) === true) return
      dismiss()
    }

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }

    document.addEventListener('pointerdown', dismissOnPointer)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOnPointer)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [container, isActive, dismiss])
}
