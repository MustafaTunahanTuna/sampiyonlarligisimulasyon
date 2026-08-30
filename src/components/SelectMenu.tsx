import { useCallback, useEffect, useRef, useState } from 'react'
import { useDismissOnOutside } from '../hooks/useDismissOnOutside'
import type { KeyboardEvent } from 'react'

const VARIANTS = ['pill', 'control'] as const

export type SelectMenuVariant = (typeof VARIANTS)[number]

const TRIGGER_BASE: Record<SelectMenuVariant, string> = {
  pill: 'rounded-pill px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide',
  control: 'rounded-control px-3 py-1.5 text-sm',
}

const TRIGGER_RESTING: Record<SelectMenuVariant, string> = {
  pill: 'bg-surface text-muted hover:text-fg',
  control: 'bg-surface/60 text-fg ring-1 ring-line-strong hover:ring-accent/45',
}

const OPTION_BASE =
  'flex w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left transition-colors'

const OPTION_TEXT: Record<SelectMenuVariant, string> = {
  pill: 'font-display text-xs font-bold uppercase tracking-wide',
  control: 'text-sm',
}

const ACTIVE = 'bg-accent/15 text-accent ring-1 ring-accent/45'

export interface SelectMenuOption<T> {
  value: T
  label: string
  hint?: string
}

interface SelectMenuProps<T> {
  value: T
  options: readonly SelectMenuOption<T>[]
  label: string
  triggerText: string
  variant: SelectMenuVariant
  alignEnd: boolean
  onChange: (value: T) => void
}

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`size-3 shrink-0 opacity-70 transition-transform duration-200 ease-out ${
        isOpen ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4.5 6 7.5 9 4.5" />
    </svg>
  )
}

export function SelectMenu<T extends string | number>({
  value,
  options,
  label,
  triggerText,
  variant,
  alignEnd,
  onChange,
}: SelectMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])

  const close = useCallback(() => setIsOpen(false), [])
  useDismissOnOutside(container, isOpen, close)

  const selectedIndex = options.findIndex((option) => option.value === value)

  useEffect(() => {
    if (isOpen) items.current[Math.max(0, selectedIndex)]?.focus()
  }, [isOpen, selectedIndex])

  function choose(next: T) {
    onChange(next)
    setIsOpen(false)
    trigger.current?.focus()
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const focused = items.current.findIndex((item) => item === document.activeElement)
    const last = options.length - 1
    const target =
      event.key === 'ArrowDown'
        ? (focused + 1) % options.length
        : event.key === 'ArrowUp'
          ? (focused - 1 + options.length) % options.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1

    if (event.key === 'Escape') {
      trigger.current?.focus()
      return
    }
    if (target < 0) return
    event.preventDefault()
    items.current[target]?.focus()
  }

  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center gap-1.5 transition-colors ${TRIGGER_BASE[variant]} ${
          isOpen ? ACTIVE : TRIGGER_RESTING[variant]
        }`}
      >
        {triggerText}
        <Chevron isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={label}
          onKeyDown={navigate}
          className={`panel absolute top-full z-40 mt-2 w-44 animate-rise space-y-0.5 bg-canvas/95 p-1 shadow-xl shadow-black/40 backdrop-blur-md ${
            alignEnd ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(node) => {
                items.current[index] = node
              }}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => choose(option.value)}
              className={`${OPTION_BASE} ${OPTION_TEXT[variant]} ${
                option.value === value ? ACTIVE : 'text-muted hover:bg-surface hover:text-fg'
              }`}
            >
              {option.hint !== undefined && (
                <span className="w-5 shrink-0 opacity-60">{option.hint}</span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
