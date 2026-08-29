import { useTranslation } from '../../i18n/useTranslation'

export function GettingStarted() {
  const t = useTranslation()

  return (
    <ol className="grid gap-8 sm:grid-cols-3">
      {t.dashboard.steps.map((step, index) => (
        <li key={step.title} className="border-t border-line-strong pt-4">
          <p className="eyebrow text-accent tabular-nums">{String(index + 1).padStart(2, '0')}</p>
          <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-tight">
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted">{step.detail}</p>
        </li>
      ))}
    </ol>
  )
}
