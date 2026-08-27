import { useState } from 'react'
import { Button } from '../../components/Button'
import { shareOrDownload } from './shareFile'

type ShareState = 'idle' | 'working' | 'failed'

interface ShareButtonProps {
  label: string
  fileName: string
  title: string
  variant?: 'primary' | 'secondary'
  renderCard: () => Promise<Blob>
}

export function ShareButton({
  label,
  fileName,
  title,
  variant = 'secondary',
  renderCard,
}: ShareButtonProps) {
  const [shareState, setShareState] = useState<ShareState>('idle')

  const produceCard = async () => {
    setShareState('working')
    try {
      await shareOrDownload(await renderCard(), fileName, title)
      setShareState('idle')
    } catch {
      setShareState('failed')
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={variant} onClick={produceCard} disabled={shareState === 'working'}>
        {shareState === 'working' ? 'Hazırlanıyor…' : label}
      </Button>
      {shareState === 'failed' && (
        <span role="alert" className="text-xs text-highlight">
          Oluşturulamadı
        </span>
      )}
    </span>
  )
}
