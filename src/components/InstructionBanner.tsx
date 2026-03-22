import { useState } from 'react'

interface InstructionBannerProps {
  step: number
  title: string
  subtitle: string
  details: string[]
}

export default function InstructionBanner({ step, title, subtitle, details }: InstructionBannerProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mx-4 mt-4 mb-2 border border-vd-border rounded-lg bg-vd-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-transparent border-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-vd-accent">
            STEP {step} OF 3
          </span>
          <span className="text-sm font-display font-bold text-vd-text-primary">
            {title}
          </span>
        </div>
        <span className="text-vd-text-dim text-sm transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : '' }}>
          ▾
        </span>
      </button>
      <div className={`px-4 text-sm text-vd-text-secondary ${expanded ? 'pb-3' : 'pb-3'}`}>
        {subtitle}
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-vd-border pt-3">
          <ul className="space-y-1">
            {details.map((d, i) => (
              <li key={i} className="text-xs text-vd-text-dim font-body">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
