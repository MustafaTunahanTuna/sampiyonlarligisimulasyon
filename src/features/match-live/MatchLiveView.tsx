import { useMemo } from 'react'
import { commentaryFor } from './commentary'
import { EventTicker } from './EventTicker'
import { matchKits } from './kits'
import { MatchStage } from './MatchStage'
import { MatchStatsPanel } from './MatchStatsPanel'
import { useMatchAudio } from './useMatchAudio'
import { PLAYBACK_SPEEDS, useMatchPlayback } from './useMatchPlayback'
import { useMatchReport } from './useMatchReport'
import { Button } from '../../components/Button'
import { ClubCrest } from '../../components/ClubCrest'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { ReactNode } from 'react'
import type { Team } from '../../domain/types'

interface MatchLiveViewProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  footer: (isFinished: boolean) => ReactNode
}

function SpeedControl({ speed, onChange }: { speed: number; onChange: (value: number) => void }) {
  return (
    <div role="group" aria-label="Oynatma hızı" className="flex rounded-pill bg-raised p-0.5">
      {PLAYBACK_SPEEDS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={speed === option}
          onClick={() => onChange(option)}
          className={`rounded-pill px-3 py-1 font-display text-xs tabular-nums transition-colors ${
            speed === option ? 'bg-accent text-canvas' : 'text-muted hover:text-fg'
          }`}
        >
          {option}×
        </button>
      ))}
    </div>
  )
}

function MuteToggle({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isMuted}
      aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
      title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
      className="rounded-pill p-2 text-muted transition-colors hover:bg-raised hover:text-fg"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9v6h3.5L13 19V5L8.5 9H5Z" />
        {isMuted ? <path d="M17 9.5l4 5m0-5l-4 5" /> : <path d="M16.5 9a4.5 4.5 0 0 1 0 6" />}
      </svg>
    </button>
  )
}

export function MatchLiveView({
  matchId,
  homeTeam,
  awayTeam,
  footer,
}: MatchLiveViewProps) {
  const report = useMatchReport(matchId, homeTeam, awayTeam)
  const prefersReducedMotion = usePrefersReducedMotion()
  const playback = useMatchPlayback(report, prefersReducedMotion)
  const audio = useMatchAudio()

  const kits = useMemo(() => matchKits(homeTeam.id, awayTeam.id), [homeTeam.id, awayTeam.id])
  const teams = { home: homeTeam, away: awayTeam }
  const score = playback.finished ? report.score : playback.liveScore
  const lastHighlight = playback.visibleEvents.filter((event) => event.importance >= 2).at(-1)
  const idleHeadline = lastHighlight === undefined ? null : commentaryFor(lastHighlight, teams)

  return (
    <>
      <div className="border-b border-line px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-2.5 text-right">
            <ClubCrest team={homeTeam} size={34} />
            <span className="min-w-0">
              <span className="block truncate text-sm text-fg">{homeTeam.name}</span>
              <span className="mt-1 flex items-center justify-end gap-1.5">
                <span className="eyebrow text-dim">hücum →</span>
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: kits.home.outfield }}
                  className="h-1.5 w-6 rounded-pill"
                />
              </span>
            </span>
          </div>
          <span
            aria-live="polite"
            aria-label={`Skor ${score.home} ${score.away}`}
            className="shrink-0 rounded-control bg-canvas/80 px-3.5 py-1.5 font-display text-2xl font-extrabold tabular-nums ring-1 ring-line"
          >
            {score.home}–{score.away}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <ClubCrest team={awayTeam} size={34} />
            <span className="min-w-0">
              <span className="block truncate text-sm text-fg">{awayTeam.name}</span>
              <span className="mt-1 flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: kits.away.outfield }}
                  className="h-1.5 w-6 rounded-pill"
                />
                <span className="eyebrow text-dim">← hücum</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 lg:overflow-hidden">
        <div className="grid gap-4 lg:h-full lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="scroll-area lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {prefersReducedMotion ? (
              <p className="rounded-control bg-raised px-4 py-3 text-sm text-muted">
                Hareket azaltma tercihin açık olduğu için saha canlandırması kapatıldı; maçın
                tamamı yanda metin olarak listeleniyor.
              </p>
            ) : (
              <MatchStage
                playback={playback.playback}
                home={{ code: homeTeam.code, kit: kits.home }}
                away={{ code: awayTeam.code, kit: kits.away }}
                speed={playback.speed}
                paused={playback.paused}
                skipToken={playback.skipToken}
                idleHeadline={idleHeadline}
                onProgress={playback.setSecond}
                onGoal={audio.cheer}
                onKick={audio.kick}
                onFinished={playback.handleFinished}
              />
            )}

            {!prefersReducedMotion && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <Button variant="ghost" onClick={playback.togglePause} disabled={playback.finished}>
                  {playback.paused ? 'Devam et' : 'Duraklat'}
                </Button>
                <SpeedControl speed={playback.speed} onChange={playback.setSpeed} />
                <Button variant="ghost" onClick={playback.skipToEnd} disabled={playback.finished}>
                  Sonucu göster
                </Button>
                <MuteToggle isMuted={audio.isMuted} onToggle={audio.toggleMuted} />
              </div>
            )}

            <section className="mt-4">
              <h3 className="eyebrow mb-2 text-muted">Maç istatistikleri</h3>
              <MatchStatsPanel stats={playback.finished ? report.stats : playback.liveStats} />
            </section>
          </div>

          <section className="flex min-w-0 flex-col lg:min-h-0">
            <h3 className="eyebrow mb-2 shrink-0 text-accent">Maç anlatımı</h3>
            <div className="scroll-area min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              <EventTicker events={playback.visibleEvents} teams={teams} minImportance={1} />
            </div>
          </section>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
        {footer(playback.finished)}
      </footer>
    </>
  )
}
