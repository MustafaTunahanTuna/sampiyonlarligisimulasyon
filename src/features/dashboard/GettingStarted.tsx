const STEPS = [
  {
    title: 'Sezonu simüle et',
    detail: 'Takım gücüne dayalı model 144 maçın tamamına skor üretir; sürpriz seviyesi sende.',
  },
  {
    title: 'Skorları kendin yaz',
    detail: 'Beğenmediğin maçın skorunu elle gir; yeniden simüle ettiğinde o skorlar korunur.',
  },
  {
    title: 'Tabloyu paylaş',
    detail: '36 takımlık puan tablosu anında hesaplanır, sonucu görsel karta çevirip paylaş.',
  },
]

export function GettingStarted() {
  return (
    <ol className="grid gap-8 sm:grid-cols-3">
      {STEPS.map((step, index) => (
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
