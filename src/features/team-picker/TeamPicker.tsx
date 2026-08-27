import { useState } from 'react'
import { Button } from '../../components/Button'
import { PotColumn } from './PotColumn'
import { SelectionBar } from './SelectionBar'
import { drawPool, searchTeams } from '../../domain/drawPool'
import type { PotNumber, Team } from '../../domain/types'

const POTS: PotNumber[] = [1, 2, 3, 4]

interface TeamPickerProps {
  currentTeam: Team | null
  onConfirm: (team: Team) => void
  onCancel: () => void
  onRelease: () => void
}

export function TeamPicker({ currentTeam, onConfirm, onCancel, onRelease }: TeamPickerProps) {
  const [query, setQuery] = useState('')
  const [draftTeam, setDraftTeam] = useState<Team | null>(null)
  const matches = searchTeams(query)

  return (
    <div className="space-y-8 pb-28">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pb-4">
        <div>
          <p className="eyebrow text-accent">
            {currentTeam === null ? 'İlk adım' : 'Takım değişikliği'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            {currentTeam === null ? 'Takımını seç' : 'Takımını değiştir'}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            {currentTeam === null
              ? 'Seçtiğin kulübün sekiz eşleşmesi ve tablodaki kaderi takip edilir.'
              : `Şu an ${currentTeam.name} takip ediliyor. Yeni bir kulüp seçip onaylarsan takip ona geçer; tahminlerin korunur.`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {currentTeam !== null && (
            <Button variant="ghost" onClick={onRelease} className="px-3">
              Takibi bırak
            </Button>
          )}
          <label className="flex items-center gap-2 text-sm">
            <span className="eyebrow text-muted">Ara</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kulüp veya ülke"
              className="w-48 rounded-control border border-line-strong bg-surface/60 px-3 py-2 text-fg placeholder:text-dim focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      </header>

      {matches.length > 0 ? (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {POTS.map((pot) => (
            <PotColumn
              key={pot}
              pot={pot}
              teams={matches.filter((team) => team.pot === pot)}
              draftTeamId={draftTeam?.id ?? null}
              currentTeamId={currentTeam?.id ?? null}
              onDraft={setDraftTeam}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          “{query}” için {drawPool.teams.length} takım arasında eşleşme yok.
        </p>
      )}

      <SelectionBar
        draftTeam={draftTeam}
        currentTeam={currentTeam}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  )
}
