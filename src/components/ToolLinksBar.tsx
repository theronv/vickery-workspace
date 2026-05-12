import { useState, useRef, useEffect } from 'react'
import { usePipeline } from '../context/PipelineContext'
import { useTools } from '../context/WorkspaceToolsContext'
import type { WorkspaceTool } from '../hooks/useWorkspaceTools'

function ToolSettingsPanel({
  tools,
  onClose,
}: {
  tools: WorkspaceTool[]
  onClose: () => void
}) {
  const { addTool, updateTool, removeTool, reorderTools } = useTools()
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('')

  const handleAdd = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    addTool({
      label: newLabel.trim(),
      url: newUrl.trim(),
      type: 'iframe',
      icon: newIcon.trim() || undefined,
      showInBar: true,
      showInSidebar: true,
    })
    setNewLabel('')
    setNewUrl('')
    setNewIcon('')
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-vd-surface border-b border-x border-vd-border shadow-xl max-h-[60vh] overflow-y-auto rounded-b-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-vd-border sticky top-0 bg-vd-surface">
        <span className="text-xs font-display font-bold text-vd-text-primary tracking-widest">MANAGE TOOLS</span>
        <button onClick={onClose} className="text-vd-text-dim hover:text-vd-text-primary text-xl leading-none">×</button>
      </div>

      {/* Tool list */}
      <div className="divide-y divide-vd-border">
        {tools.map((tool, i) => (
          <div key={tool.id} className="flex items-center gap-3 px-4 py-2.5">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => i > 0 && reorderTools(i, i - 1)}
                disabled={i === 0}
                className="text-vd-text-dim hover:text-vd-text-primary disabled:opacity-20 text-[10px] leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => i < tools.length - 1 && reorderTools(i, i + 1)}
                disabled={i === tools.length - 1}
                className="text-vd-text-dim hover:text-vd-text-primary disabled:opacity-20 text-[10px] leading-none"
              >
                ▼
              </button>
            </div>

            {/* Icon + label */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {tool.icon && <span className="text-sm">{tool.icon}</span>}
              <span className="text-sm text-vd-text-primary truncate">{tool.label}</span>
              {tool.type === 'iframe' && (
                <span className="text-[10px] text-vd-text-dim font-mono truncate">({tool.url})</span>
              )}
              {tool.type === 'internal' && (
                <span className="text-[10px] text-vd-text-dim font-mono">built-in</span>
              )}
            </div>

            {/* Toggles + delete */}
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-1 cursor-pointer" title="Show in tab bar">
                <input
                  type="checkbox"
                  checked={tool.showInBar}
                  onChange={e => updateTool(tool.id, { showInBar: e.target.checked })}
                  className="accent-vd-accent w-3 h-3"
                />
                <span className="text-xs text-vd-text-dim">Bar</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer" title="Show in sidebar">
                <input
                  type="checkbox"
                  checked={tool.showInSidebar}
                  onChange={e => updateTool(tool.id, { showInSidebar: e.target.checked })}
                  className="accent-vd-accent w-3 h-3"
                />
                <span className="text-xs text-vd-text-dim">Side</span>
              </label>
              <button
                onClick={() => removeTool(tool.id)}
                className="text-xs text-vd-error hover:opacity-80 px-1.5 py-0.5 border border-vd-error/30 rounded transition-opacity"
                title="Remove tool"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add tool */}
      <div className="px-4 py-3 border-t border-vd-border bg-vd-bg/60">
        <p className="text-xs text-vd-text-dim mb-2 font-mono tracking-wide">ADD EXTERNAL TOOL (URL)</p>
        <div className="flex gap-2">
          <input
            value={newIcon}
            onChange={e => setNewIcon(e.target.value)}
            placeholder="Icon"
            className="w-14 bg-vd-surface border border-vd-border rounded px-2 py-1.5 text-xs text-vd-text-primary outline-none focus:border-vd-accent text-center"
          />
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Label"
            className="w-28 bg-vd-surface border border-vd-border rounded px-2 py-1.5 text-xs text-vd-text-primary outline-none focus:border-vd-accent"
          />
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://..."
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-vd-surface border border-vd-border rounded px-2 py-1.5 text-xs text-vd-text-primary outline-none focus:border-vd-accent"
          />
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newUrl.trim()}
            className="px-3 py-1.5 text-xs bg-vd-accent text-white rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ToolLinksBar() {
  const { activePanel, setActivePanel } = usePipeline()
  const { tools } = useTools()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const barTools = tools.filter(t => t.showInBar)
  const activeTool = tools.find(t => t.id === activePanel)

  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  return (
    <div ref={containerRef} className="relative shrink-0 flex items-center h-10 bg-vd-bg border-b border-vd-border z-30">
      {/* Scrollable tab row */}
      <div className="flex items-center flex-1 overflow-x-auto px-2 gap-0.5 min-w-0">
        {barTools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActivePanel(tool.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-display font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
              activePanel === tool.id
                ? 'text-white border-vd-accent'
                : 'text-vd-text-secondary border-transparent hover:text-vd-text-primary'
            }`}
          >
            {tool.icon && <span className="text-sm leading-none">{tool.icon}</span>}
            {tool.label}
          </button>
        ))}
        {barTools.length === 0 && (
          <span className="text-xs text-vd-text-dim px-3">No tools in bar — click ⚙ to add</span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 px-2 shrink-0 border-l border-vd-border">
        {activeTool?.url && (
          <a
            href={activeTool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 text-xs text-vd-text-secondary hover:text-white border border-vd-border rounded transition-colors"
            title={`Open ${activeTool.label} in new tab`}
          >
            ↗ Open
          </a>
        )}
        <button
          onClick={() => setSettingsOpen(o => !o)}
          className={`w-7 h-7 flex items-center justify-center text-sm transition-colors ${
            settingsOpen ? 'text-vd-accent' : 'text-vd-text-dim hover:text-vd-text-primary'
          }`}
          title="Manage tools"
        >
          ⚙
        </button>
      </div>

      {settingsOpen && (
        <ToolSettingsPanel tools={tools} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
