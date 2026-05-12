import { useState } from 'react'
import { useStackSidebar } from '../../hooks/useStackSidebar'
import { useTools } from '../../context/WorkspaceToolsContext'
import { usePipeline } from '../../context/PipelineContext'
import CategoryRow from '../StackSidebar/CategoryRow'
import SettingsPanel from '../StackSidebar/SettingsPanel'

function ToolsSection({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { tools, updateTool } = useTools()
  const { activePanel, setActivePanel } = usePipeline()
  const [toolSettingsOpen, setToolSettingsOpen] = useState(false)

  const sidebarTools = tools.filter(t => t.showInSidebar)

  if (!sidebarOpen) return null

  return (
    <div className="border-t border-vd-border">
      {/* Tools header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-display font-bold text-vd-text-dim tracking-widest">TOOLS</span>
        <button
          onClick={() => setToolSettingsOpen(o => !o)}
          className={`text-sm transition-colors ${
            toolSettingsOpen ? 'text-vd-accent' : 'text-vd-text-dim hover:text-vd-text-primary'
          }`}
          title="Configure tools"
        >
          ⚙
        </button>
      </div>

      {toolSettingsOpen ? (
        <div className="px-2 pb-2 space-y-0.5">
          {tools.map(tool => (
            <label
              key={tool.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-vd-bg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={tool.showInSidebar}
                onChange={e => updateTool(tool.id, { showInSidebar: e.target.checked })}
                className="accent-vd-accent w-3 h-3 shrink-0"
              />
              <span className="text-xs text-vd-text-secondary truncate">{tool.label}</span>
            </label>
          ))}
          <button
            onClick={() => setToolSettingsOpen(false)}
            className="w-full text-xs text-vd-text-dim py-1 mt-1 border-t border-vd-border hover:text-vd-text-secondary transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="pb-1">
          {sidebarTools.length === 0 ? (
            <p className="px-3 py-2 text-xs text-vd-text-dim">
              No tools — click ⚙ to configure
            </p>
          ) : (
            sidebarTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setActivePanel(tool.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-vd-bg group ${
                  activePanel === tool.id ? 'text-vd-accent' : 'text-vd-text-secondary hover:text-vd-text-primary'
                }`}
              >
                <span className={`text-xs transition-colors ${
                  activePanel === tool.id ? 'text-vd-accent' : 'text-vd-text-dim group-hover:text-vd-text-secondary'
                }`}>›</span>
                <span className="text-xs font-display font-medium tracking-wide uppercase truncate">
                  {tool.icon && <span className="mr-1">{tool.icon}</span>}
                  {tool.label}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function RightSidebar() {
  const {
    data, toggleSidebar, toggleCategory,
    addLink, removeLink, reorderLinks,
    addCategory, updateCategory, removeCategory, reorderCategories,
  } = useStackSidebar()
  const [linksSettingsOpen, setLinksSettingsOpen] = useState(false)

  const open = data.sidebarOpen
  const sortedCats = [...data.categories].sort((a, b) => a.order - b.order)

  return (
    <aside
      className="shrink-0 flex flex-col bg-vd-surface border-l border-vd-border h-full overflow-hidden"
      style={{ width: open ? 220 : 48, transition: 'width 200ms ease' }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className="flex items-center h-10 shrink-0 text-vd-text-dim hover:text-vd-text-primary transition-colors px-3"
      >
        {open ? (
          <>
            <span className="text-xs font-display font-bold text-vd-text-primary whitespace-nowrap flex-1">Links</span>
            <span className="text-base ml-1" aria-hidden="true">≡</span>
          </>
        ) : (
          <span className="text-base mx-auto" aria-hidden="true">≡</span>
        )}
      </button>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {open && linksSettingsOpen ? (
          <SettingsPanel
            data={data}
            onClose={() => setLinksSettingsOpen(false)}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            onReorderLinks={reorderLinks}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
            onReorderCategories={reorderCategories}
          />
        ) : open ? (
          <>
            {/* External links */}
            <div className="px-1 pb-1">
              {sortedCats.map(cat => {
                const catLinks = data.links
                  .filter(l => l.categoryId === cat.id)
                  .sort((a, b) => a.order - b.order)
                return (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    links={catLinks}
                    onToggle={() => toggleCategory(cat.id)}
                  />
                )
              })}
            </div>

            {/* Workspace tools */}
            <ToolsSection sidebarOpen={open} />
          </>
        ) : (
          /* Collapsed icon strip */
          <div className="flex flex-col items-center gap-2 pt-1">
            {sortedCats.map(cat => {
              const firstLink = data.links
                .filter(l => l.categoryId === cat.id)
                .sort((a, b) => a.order - b.order)[0]
              return (
                <button
                  key={cat.id}
                  onClick={toggleSidebar}
                  className="w-8 h-8 flex items-center justify-center text-xs border border-vd-border rounded text-vd-text-dim hover:text-vd-text-primary hover:border-vd-text-dim transition-colors"
                  title={cat.label}
                >
                  {firstLink?.icon || cat.label[0]}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Manage links footer — only when open and not in settings */}
      {open && !linksSettingsOpen && (
        <button
          onClick={() => setLinksSettingsOpen(true)}
          className="flex items-center gap-2 px-3 h-10 shrink-0 border-t border-vd-border text-vd-text-dim hover:text-vd-text-primary transition-colors"
        >
          <span className="text-sm" aria-hidden="true">⚙</span>
          <span className="text-xs font-body text-vd-text-secondary whitespace-nowrap">Manage links</span>
        </button>
      )}
    </aside>
  )
}
