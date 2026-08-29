import { BracketTie } from './BracketTie'
import { isWatchableTie } from './watchableTie'
import { useTranslation } from '../../i18n/useTranslation'
import { LEFT_ROUND_OF_16_ORDER, RIGHT_ROUND_OF_16_ORDER } from '../share/bracketLayout'
import type { KnockoutRoundId } from '../../domain/knockoutFormat'
import type { KnockoutStage } from '../../domain/knockoutStage'
import type { KnockoutTie, TieOutcome } from '../../domain/types'

type Side = 'left' | 'right'

const QUARTER_ORDERS: Record<Side, number[]> = { left: [1, 2], right: [3, 4] }
const SEMI_ORDER: Record<Side, number> = { left: 1, right: 2 }

interface Entry {
  tie: KnockoutTie
  outcome: TieOutcome | undefined
}

function entryOf(stage: KnockoutStage, round: KnockoutRoundId, order: number): Entry | null {
  const target = stage.rounds.find((entry) => entry.id === round)
  const tie = target?.ties[order - 1]
  if (target === undefined || tie === undefined) return null
  return { tie, outcome: target.outcomes.get(tie.id) }
}

function Connector({ side }: { side: Side }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-1/4 w-2 border-line-strong ${
        side === 'left'
          ? '-right-2 rounded-r-sm border-y border-r'
          : '-left-2 rounded-l-sm border-y border-l'
      }`}
    />
  )
}

function Stem({ side }: { side: Side }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 h-px w-2 bg-line-strong ${
        side === 'left' ? '-right-2' : '-left-2'
      }`}
    />
  )
}

interface GroupProps {
  side: Side
  withConnector?: boolean
  children: React.ReactNode
}

function Group({ side, withConnector = false, children }: GroupProps) {
  return (
    <div className="relative flex flex-1 flex-col justify-around gap-2">
      {children}
      {withConnector && <Connector side={side} />}
    </div>
  )
}

interface SlotProps {
  entry: Entry | null
  favouriteTeamId: string | null
  onWatchTie: (tie: KnockoutTie) => void
  side: Side
  withStem?: boolean
}

function Slot({ entry, favouriteTeamId, onWatchTie, side, withStem = false }: SlotProps) {
  if (entry === null) return null
  return (
    <div className="relative">
      <BracketTie
        tie={entry.tie}
        outcome={entry.outcome}
        favouriteTeamId={favouriteTeamId}
        onWatch={
          isWatchableTie(entry.tie, entry.outcome, favouriteTeamId)
            ? () => onWatchTie(entry.tie)
            : null
        }
      />
      {withStem && <Stem side={side} />}
    </div>
  )
}

interface BranchProps {
  stage: KnockoutStage
  side: Side
  favouriteTeamId: string | null
  onWatchTie: (tie: KnockoutTie) => void
}

function Branch({ stage, side, favouriteTeamId, onWatchTie }: BranchProps) {
  const roundOf16Orders = side === 'left' ? LEFT_ROUND_OF_16_ORDER : RIGHT_ROUND_OF_16_ORDER
  const quarterOrders = QUARTER_ORDERS[side]
  const columns = [
    <div key="r16" className="flex flex-1 flex-col justify-around gap-3">
      {[0, 1].map((pairIndex) => (
        <Group key={pairIndex} side={side} withConnector>
          {roundOf16Orders.slice(pairIndex * 2, pairIndex * 2 + 2).map((order) => (
            <Slot
              key={order}
              entry={entryOf(stage, 'ROUND_OF_16', order)}
              favouriteTeamId={favouriteTeamId}
              onWatchTie={onWatchTie}
              side={side}
              withStem
            />
          ))}
        </Group>
      ))}
    </div>,
    <div key="qf" className="flex flex-1 flex-col justify-around gap-3">
      <Group side={side} withConnector>
        {quarterOrders.map((order) => (
          <Slot
            key={order}
            entry={entryOf(stage, 'QUARTER_FINAL', order)}
            favouriteTeamId={favouriteTeamId}
            onWatchTie={onWatchTie}
            side={side}
            withStem
          />
        ))}
      </Group>
    </div>,
    <div key="sf" className="flex flex-1 flex-col justify-around">
      <Slot
        entry={entryOf(stage, 'SEMI_FINAL', SEMI_ORDER[side])}
        favouriteTeamId={favouriteTeamId}
        onWatchTie={onWatchTie}
        side={side}
        withStem
      />
    </div>,
  ]

  return <>{side === 'left' ? columns : [...columns].reverse()}</>
}

interface BracketTreeProps {
  stage: KnockoutStage
  favouriteTeamId: string | null
  onWatchTie: (tie: KnockoutTie) => void
}

const COLUMN_ROUNDS: KnockoutRoundId[] = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
  'SEMI_FINAL',
  'QUARTER_FINAL',
  'ROUND_OF_16',
]

export function BracketTree({ stage, favouriteTeamId, onWatchTie }: BracketTreeProps) {
  const t = useTranslation()
  const final = entryOf(stage, 'FINAL', 1)

  return (
    <div className="scroll-area overflow-x-auto pb-2">
      <div className="min-w-[52rem]">
        <div className="grid grid-cols-7 gap-x-2">
          {COLUMN_ROUNDS.map((round, index) => (
            <p
              key={`${round}-${index}`}
              className={`eyebrow truncate pb-3 text-dim ${index > 3 ? 'text-right' : ''} ${index === 3 ? 'text-center text-accent' : ''}`}
            >
              {t.knockout.roundLabel[round]}
            </p>
          ))}
        </div>

        <div className="grid min-h-[30rem] grid-cols-7 gap-x-2">
          <Branch
            stage={stage}
            side="left"
            favouriteTeamId={favouriteTeamId}
            onWatchTie={onWatchTie}
          />
          <div className="flex flex-col justify-center">
            {final !== null && (
              <BracketTie
                tie={final.tie}
                outcome={final.outcome}
                favouriteTeamId={favouriteTeamId}
                onWatch={
                  isWatchableTie(final.tie, final.outcome, favouriteTeamId)
                    ? () => onWatchTie(final.tie)
                    : null
                }
                emphasis
              />
            )}
          </div>
          <Branch
            stage={stage}
            side="right"
            favouriteTeamId={favouriteTeamId}
            onWatchTie={onWatchTie}
          />
        </div>
      </div>
    </div>
  )
}
