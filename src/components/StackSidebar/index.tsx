import { useState } from 'react'
import { useStackSidebar } from '../../hooks/useStackSidebar'
import CategoryRow from './CategoryRow'
import SettingsPanel from './SettingsPanel'
import IconBadge from './IconBadge'

export default function StackSidebar() {
  const {
    data, toggleSidebar, toggleCategory,
    addLink, removeLink, reorderLinks,
    addCategory, updateCategory, removeCategory, reorderCategories,
  } = useStackSidebar()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const sortedCats = [...data.categories].sort((a, b) => a.order - b.order)
  const open = data.sidebarOpen

  return (
    <aside
      className="shrink-0 flex flex-col bg-vd-bg border-r border-vd-border h-full overflow-hidden"
      style={{
        width: open ? 260 : 48,
        transition: 'width 200ms ease',
      }}
    >
      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle stack links sidebar"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 h-10 shrink-0 text-vd-text-dim hover:text-vd-text-primary transition-colors"
      >
        <span className="text-lg" aria-hidden="true">≡</span>
        {open && <span className="text-sm font-display font-bold text-vd-text-primary whitespace-nowrap">Stack Links</span>}
      </button>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {open && settingsOpen ? (
          <SettingsPanel
            data={data}
            onClose={() => setSettingsOpen(false)}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            onReorderLinks={reorderLinks}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
            onReorderCategories={reorderCategories}
          />
        ) : open ? (
          <div className="px-1 pb-2">
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
        ) : (
          /* Collapsed: icon strip */
          <div className="flex flex-col items-center gap-3 pt-2">
            {sortedCats.map(cat => {
              const firstLink = data.links
                .filter(l => l.categoryId === cat.id)
                .sort((a, b) => a.order - b.order)[0]
              return (
                <button
                  key={cat.id}
                  onClick={toggleSidebar}
                  aria-label={`Open sidebar — ${cat.label}`}
                  className="bg-transparent border-none cursor-pointer p-0"
                  title={cat.label}
                >
                  <IconBadge icon={firstLink?.icon} label={cat.label} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Settings trigger */}
      <button
        onClick={() => { if (!open) toggleSidebar(); setSettingsOpen(s => !s) }}
        aria-label={settingsOpen ? 'Close settings' : 'Manage links'}
        className="flex items-center gap-2 px-3 h-10 shrink-0 border-t border-vd-border text-vd-text-dim hover:text-vd-text-primary transition-colors"
      >
        <span className="text-base" aria-hidden="true">⚙</span>
        {open && <span className="text-xs font-body text-vd-text-secondary whitespace-nowrap">Manage links</span>}
      </button>
    </aside>
  )
}
