import { useAuth } from '../context/AuthContext'
import { usePipeline, type PanelId } from '../context/PipelineContext'

const tabs: { id: PanelId; label: string }[] = [
  { id: 'vet', label: '1. VET' },
  { id: 'build', label: '2. BUILD' },
  { id: 'execute', label: '3. EXECUTE' },
]

interface TopNavProps {
  onToggleSidebar: () => void
}

export default function TopNav({ onToggleSidebar }: TopNavProps) {
  const { activePanel, setActivePanel } = usePipeline()
  const { logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 flex items-center h-14 px-6 bg-vd-bg border-b border-vd-border">
      {/* Wordmark */}
      <div className="flex items-center gap-2 mr-8">
        <span className="font-display text-lg font-bold text-vd-accent">VD</span>
        <span className="text-vd-text-dim text-sm font-body">[workspace]</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium font-display tracking-wide border-b-2 transition-colors
              ${activePanel === tab.id
                ? 'text-white border-vd-accent'
                : 'text-vd-text-secondary border-transparent hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-vd-border text-vd-text-secondary hover:text-white hover:border-vd-text-dim transition-colors text-sm"
          title="Pipeline reference"
        >
          ?
        </button>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-xs font-medium text-vd-text-secondary border border-vd-border rounded-md hover:text-white hover:border-vd-text-dim transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
