import { useState, useRef, useEffect } from 'react'
import { useStatusBar, STAGES, type AppStatus } from '../hooks/useStatusBar'

function AppEditor({
  app,
  onSave,
  onCancel,
}: {
  app?: Partial<AppStatus>
  onSave: (a: Omit<AppStatus, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(app?.name ?? '')
  const [githubUrl, setGithubUrl] = useState(app?.githubUrl ?? '')
  const [stage, setStage] = useState(app?.currentStage ?? '')
  const [nextStep, setNextStep] = useState(app?.nextStep ?? '')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      githubUrl: githubUrl.trim() || undefined,
      currentStage: stage,
      nextStep: nextStep.trim(),
      lastSession: app?.lastSession,
    })
  }

  return (
    <div className="space-y-2.5 p-3 bg-vd-bg border border-vd-border rounded-lg">
      <div>
        <label className="block text-xs text-vd-text-dim mb-1 font-mono tracking-wide">APP NAME</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My App"
          autoFocus
          className="w-full bg-vd-surface border border-vd-border rounded px-2.5 py-1.5 text-sm text-vd-text-primary outline-none focus:border-vd-accent"
        />
      </div>
      <div>
        <label className="block text-xs text-vd-text-dim mb-1 font-mono tracking-wide">GITHUB URL</label>
        <input
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          className="w-full bg-vd-surface border border-vd-border rounded px-2.5 py-1.5 text-sm text-vd-text-primary outline-none focus:border-vd-accent"
        />
      </div>
      <div>
        <label className="block text-xs text-vd-text-dim mb-1 font-mono tracking-wide">CURRENT STAGE</label>
        <div className="flex gap-1.5 flex-wrap">
          {STAGES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(stage === s ? '' : s)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                stage === s
                  ? 'bg-vd-accent border-vd-accent text-white'
                  : 'bg-transparent border-vd-border text-vd-text-secondary hover:border-vd-text-dim'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-vd-text-dim mb-1 font-mono tracking-wide">NEXT STEP</label>
        <input
          value={nextStep}
          onChange={e => setNextStep(e.target.value)}
          placeholder="e.g. Prepare for Launch"
          className="w-full bg-vd-surface border border-vd-border rounded px-2.5 py-1.5 text-sm text-vd-text-primary outline-none focus:border-vd-accent"
        />
      </div>
      <div className="flex gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-1.5 text-xs font-medium bg-vd-accent text-white rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 text-xs border border-vd-border text-vd-text-secondary rounded hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function StatusBar() {
  const { state, activeApp, setActiveApp, addApp, updateApp, removeApp, startSession } = useStatusBar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen && !settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) return
      if (settingsRef.current?.contains(e.target as Node)) return
      setDropdownOpen(false)
      setSettingsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen, settingsOpen])

  const formattedDate = activeApp?.lastSession
    ? new Date(activeApp.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="relative shrink-0 flex items-center h-12 px-4 bg-vd-surface border-b border-vd-border gap-4 z-40">
      {/* App dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => { setDropdownOpen(o => !o); setSettingsOpen(false) }}
          className="flex items-center gap-1.5 font-display font-bold text-sm hover:opacity-80 transition-opacity"
        >
          <span className={activeApp ? 'text-vd-accent' : 'text-vd-text-dim'}>
            {activeApp?.name ?? 'Select app ▾'}
          </span>
          {activeApp && <span className="text-vd-text-dim text-xs">▾</span>}
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-52 bg-vd-surface border border-vd-border rounded-lg shadow-xl overflow-hidden">
            {state.apps.length > 0 ? (
              <div className="py-1 max-h-56 overflow-y-auto">
                {state.apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => { setActiveApp(app.id); setDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-vd-bg transition-colors flex items-center gap-2 ${
                      app.id === state.activeAppId ? 'text-vd-accent' : 'text-vd-text-primary'
                    }`}
                  >
                    {app.id === state.activeAppId && <span className="text-vd-accent text-[8px]">●</span>}
                    <span className="flex-1 truncate">{app.name}</span>
                    {app.githubUrl && (
                      <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-vd-text-dim hover:text-vd-text-secondary text-xs shrink-0"
                        title="Open GitHub"
                      >
                        ↗
                      </a>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-xs text-vd-text-dim">No apps configured</div>
            )}
            <div className="border-t border-vd-border">
              <button
                onClick={() => { setDropdownOpen(false); setSettingsOpen(true); setEditingId('new') }}
                className="w-full text-left px-4 py-2 text-xs text-vd-text-secondary hover:text-white hover:bg-vd-bg transition-colors"
              >
                + Add app
              </button>
              <button
                onClick={() => { setDropdownOpen(false); setSettingsOpen(true); setEditingId(null) }}
                className="w-full text-left px-4 py-2 text-xs text-vd-text-secondary hover:text-white hover:bg-vd-bg transition-colors"
              >
                ⚙ Manage apps
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stage badges */}
      {activeApp && (
        <div className="flex items-center gap-1.5 shrink-0">
          {STAGES.map(s => (
            <span
              key={s}
              className={`px-2 py-0.5 text-xs rounded border font-mono ${
                activeApp.currentStage === s
                  ? 'bg-vd-accent/20 border-vd-accent text-vd-accent font-semibold'
                  : 'border-vd-border text-vd-text-dim'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Next step — center */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {activeApp?.nextStep ? (
          <p className="text-sm font-display font-bold text-vd-text-primary tracking-wide uppercase truncate">
            Next Step: <span className="text-vd-accent">{activeApp.nextStep}</span>
          </p>
        ) : (
          <p className="text-xs text-vd-text-dim">
            {state.apps.length === 0 ? 'Add an app to get started' : 'Select an active app'}
          </p>
        )}
      </div>

      {/* Right: date + session + settings */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {formattedDate && (
          <span className="text-xs text-vd-text-dim hidden md:block">
            Session {formattedDate}
          </span>
        )}
        <button
          onClick={() => startSession()}
          disabled={!activeApp}
          className="px-4 py-1.5 text-xs font-semibold bg-vd-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Start Session →
        </button>
        <button
          onClick={() => { setSettingsOpen(o => !o); setDropdownOpen(false) }}
          className={`w-7 h-7 flex items-center justify-center text-sm transition-colors ${
            settingsOpen ? 'text-vd-accent' : 'text-vd-text-dim hover:text-vd-text-primary'
          }`}
          title="Manage apps"
        >
          ⚙
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div
          ref={settingsRef}
          className="absolute top-full right-0 z-50 w-80 max-h-[80vh] overflow-y-auto bg-vd-surface border border-vd-border rounded-lg shadow-xl mt-1"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-vd-border sticky top-0 bg-vd-surface">
            <span className="text-xs font-display font-bold text-vd-text-primary tracking-widest">MANAGE APPS</span>
            <button
              onClick={() => { setSettingsOpen(false); setEditingId(null) }}
              className="text-vd-text-dim hover:text-vd-text-primary text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-3 space-y-2">
            {state.apps.map(app => (
              <div key={app.id} className="border border-vd-border rounded-lg overflow-hidden">
                {editingId === app.id ? (
                  <AppEditor
                    app={app}
                    onSave={patch => { updateApp(app.id, patch); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-vd-text-primary font-medium truncate">{app.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {app.currentStage && (
                          <span className="text-xs text-vd-accent">{app.currentStage}</span>
                        )}
                        {app.nextStep && (
                          <span className="text-xs text-vd-text-dim truncate">→ {app.nextStep}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {app.githubUrl && (
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-xs text-vd-text-dim border border-vd-border rounded hover:text-white transition-colors"
                          title="Open GitHub"
                        >
                          ↗
                        </a>
                      )}
                      <button
                        onClick={() => setEditingId(app.id)}
                        className="px-2 py-1 text-xs text-vd-text-secondary border border-vd-border rounded hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeApp(app.id)}
                        className="px-2 py-1 text-xs text-vd-error border border-vd-error/30 rounded hover:bg-vd-error/10 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {editingId === 'new' ? (
              <AppEditor
                onSave={app => { addApp(app); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <button
                onClick={() => setEditingId('new')}
                className="w-full py-2 text-xs border border-dashed border-vd-border text-vd-text-dim rounded-lg hover:border-vd-text-dim hover:text-vd-text-secondary transition-colors"
              >
                + Add App
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
