import { useState } from 'react'

export interface CardSubstep {
  label: string
}

export interface CardData {
  id: string
  stepNumber: number
  title: string
  substeps: CardSubstep[]
  command?: string
  columnIndex: number
}

interface KanbanCardProps {
  card: CardData
  status: 'todo' | 'in-progress' | 'done'
  checkedSteps: number[]
  onToggleStep: (stepIndex: number) => void
  onStatusChange: (status: 'todo' | 'in-progress' | 'done') => void
}

export default function KanbanCard({
  card,
  status,
  checkedSteps,
  onToggleStep,
  onStatusChange,
}: KanbanCardProps) {
  const [copied, setCopied] = useState(false)

  const statusColors = {
    'todo': 'border-vd-border',
    'in-progress': 'border-vd-accent',
    'done': 'border-vd-success',
  }

  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  }

  const nextStatus = {
    'todo': 'in-progress' as const,
    'in-progress': 'done' as const,
    'done': 'todo' as const,
  }

  const copyCommand = async () => {
    if (!card.command) return
    await navigator.clipboard.writeText(card.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`bg-vd-surface rounded-lg border ${statusColors[status]} p-3 transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-vd-accent/20 text-vd-accent text-xs font-mono font-medium">
            {card.stepNumber}
          </span>
          <h4 className="text-sm font-medium text-vd-text-primary font-body leading-tight">
            {card.title}
          </h4>
        </div>
      </div>

      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(nextStatus[status])}
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 border-none cursor-pointer transition-colors ${
          status === 'done'
            ? 'bg-vd-success/20 text-vd-success'
            : status === 'in-progress'
            ? 'bg-vd-accent/20 text-vd-accent'
            : 'bg-vd-border/50 text-vd-text-dim'
        }`}
      >
        {statusLabels[status]}
      </button>

      {/* Substeps */}
      {card.substeps.length > 0 && (
        <ul className="space-y-1 mt-2">
          {card.substeps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checkedSteps.includes(i)}
                onChange={() => onToggleStep(i)}
                className="mt-0.5 accent-vd-accent cursor-pointer"
              />
              <span className={`text-xs font-body ${
                checkedSteps.includes(i) ? 'text-vd-text-dim line-through' : 'text-vd-text-secondary'
              }`}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Command snippet */}
      {card.command && (
        <div className="mt-2 relative group">
          <pre className="bg-vd-bg rounded px-3 py-2 text-xs text-vd-text-secondary font-mono overflow-x-auto">
            {card.command}
          </pre>
          <button
            onClick={copyCommand}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-[10px] bg-vd-border text-vd-text-secondary hover:text-white border-none cursor-pointer"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
