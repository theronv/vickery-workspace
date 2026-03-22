import KanbanCard, { type CardData } from './KanbanCard'

interface CardState {
  status: 'todo' | 'in-progress' | 'done'
  checkedSteps: number[]
}

interface KanbanColumnProps {
  title: string
  subtitle: string
  cards: CardData[]
  cardStates: Record<string, CardState>
  onToggleStep: (cardId: string, stepIndex: number) => void
  onStatusChange: (cardId: string, status: 'todo' | 'in-progress' | 'done') => void
}

export default function KanbanColumn({
  title,
  subtitle,
  cards,
  cardStates,
  onToggleStep,
  onStatusChange,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      <div className="px-3 py-3 border-b border-vd-border">
        <h3 className="text-xs font-mono font-medium text-vd-accent tracking-wide">
          {title}
        </h3>
        <p className="text-xs text-vd-text-dim mt-0.5">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {cards.map((card) => {
          const state = cardStates[card.id] || { status: 'todo', checkedSteps: [] }
          return (
            <KanbanCard
              key={card.id}
              card={card}
              status={state.status}
              checkedSteps={state.checkedSteps}
              onToggleStep={(stepIndex) => onToggleStep(card.id, stepIndex)}
              onStatusChange={(status) => onStatusChange(card.id, status)}
            />
          )
        })}
      </div>
    </div>
  )
}
