import { useState } from 'react'
import { Button } from '../../components/Button'
import { downloadBlob } from './shareFile'

type DownloadState = 'idle' | 'working' | 'done' | 'failed'

const STATE_LABEL: Record<DownloadState, string | null> = {
  idle: null,
  working: 'Hazırlanıyor…',
  done: 'İndirildi',
  failed: null,
}

const DONE_RESET_MS = 2400

interface DownloadCardButtonProps {
  label: string
  fileName: string
  variant?: 'primary' | 'secondary'
  renderCard: () => Promise<Blob>
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  )
}

export function DownloadCardButton({
  label,
  fileName,
  variant = 'secondary',
  renderCard,
}: DownloadCardButtonProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle')

  const produceCard = async () => {
    setDownloadState('working')
    try {
      downloadBlob(await renderCard(), fileName)
      setDownloadState('done')
      window.setTimeout(() => setDownloadState('idle'), DONE_RESET_MS)
    } catch {
      setDownloadState('failed')
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={variant} onClick={produceCard} disabled={downloadState === 'working'}>
        <DownloadIcon />
        {STATE_LABEL[downloadState] ?? label}
      </Button>
      {downloadState === 'failed' && (
        <span role="alert" className="text-xs text-highlight">
          Oluşturulamadı
        </span>
      )}
    </span>
  )
}
