import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const VARIANT_STYLE: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-b from-accent to-accent-deep text-canvas shadow-[0_6px_20px_-8px_var(--accent)] hover:brightness-110',
  secondary: 'border border-line-strong text-fg hover:border-accent hover:text-accent',
  ghost: 'text-muted hover:bg-surface hover:text-fg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({ variant = 'secondary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center gap-2 rounded-pill px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_STYLE[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
