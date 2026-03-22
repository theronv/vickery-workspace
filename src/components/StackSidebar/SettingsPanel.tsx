import { useState, useRef, useEffect } from 'react'
import type { StackSidebarData, StackLink, StackCategory } from './types'
import IconBadge from './IconBadge'

interface SettingsPanelProps {
  data: StackSidebarData;
  onClose: () => void;
  onAddLink: (link: Omit<StackLink, 'id'>) => void;
  onRemoveLink: (id: string) => void;
  onReorderLinks: (categoryId: string, from: number, to: number) => void;
  onAddCategory: (label: string) => void;
  onUpdateCategory: (id: string, patch: Partial<StackCategory>) => void;
  onRemoveCategory: (id: string) => void;
  onReorderCategories: (from: number, to: number) => void;
}

export default function SettingsPanel({
  data, onClose, onAddLink, onRemoveLink, onReorderLinks,
  onAddCategory, onUpdateCategory, onRemoveCategory, onReorderCategories,
}: SettingsPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)
  const [confirmDeleteLink, setConfirmDeleteLink] = useState<string | null>(null)
  const [addingLinkCat, setAddingLinkCat] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); closeRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sortedCats = [...data.categories].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-vd-border">
        <h2 className="font-display text-sm font-bold text-vd-text-primary tracking-wide flex items-center gap-2">
          <span aria-hidden="true">⚙</span> Manage Links
        </h2>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close settings"
          className="text-vd-text-dim hover:text-vd-text-primary text-lg bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {sortedCats.map((cat, catIdx) => {
          const catLinks = data.links
            .filter(l => l.categoryId === cat.id)
            .sort((a, b) => a.order - b.order)

          return (
            <div key={cat.id} className="border border-vd-border rounded-md p-2">
              {/* Category header */}
              <div className="flex items-center gap-1 mb-1">
                {editingCatId === cat.id ? (
                  <CategoryRenameInput
                    initial={cat.label}
                    onCommit={val => { onUpdateCategory(cat.id, { label: val }); setEditingCatId(null) }}
                    onCancel={() => setEditingCatId(null)}
                  />
                ) : (
                  <button
                    onClick={() => setEditingCatId(cat.id)}
                    className="flex-1 text-left text-[0.65rem] font-body font-medium tracking-[0.1em] uppercase text-vd-text-dim hover:text-vd-text-secondary"
                    aria-label={`Rename ${cat.label}`}
                  >
                    {cat.label}
                  </button>
                )}
                <div className="flex items-center gap-0.5 shrink-0">
                  <ArrowBtn dir="up" disabled={catIdx === 0} onClick={() => onReorderCategories(catIdx, catIdx - 1)} label={`Move ${cat.label} up`} />
                  <ArrowBtn dir="down" disabled={catIdx === sortedCats.length - 1} onClick={() => onReorderCategories(catIdx, catIdx + 1)} label={`Move ${cat.label} down`} />
                  {confirmDeleteCat === cat.id ? (
                    <span className="text-xs text-vd-text-secondary ml-1 flex items-center gap-1">
                      Delete?
                      <button onClick={() => { onRemoveCategory(cat.id); setConfirmDeleteCat(null) }} className="text-vd-error hover:underline bg-transparent border-none cursor-pointer text-xs" aria-label={`Confirm delete ${cat.label}`}>Yes</button>
                      <button onClick={() => setConfirmDeleteCat(null)} className="text-vd-text-dim hover:underline bg-transparent border-none cursor-pointer text-xs" aria-label="Cancel delete">No</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteCat(cat.id)} className="text-vd-text-dim hover:text-vd-error text-xs bg-transparent border-none cursor-pointer ml-1" aria-label={`Delete ${cat.label}`}>×</button>
                  )}
                </div>
              </div>

              {/* Links */}
              {catLinks.map((link, linkIdx) => (
                <div key={link.id} className="flex items-center gap-1 py-0.5 pl-2 group">
                  <IconBadge icon={link.icon} label={link.label} size="sm" />
                  <span className="flex-1 truncate text-xs font-body text-vd-text-secondary">{link.label}</span>
                  <ArrowBtn dir="up" disabled={linkIdx === 0} onClick={() => onReorderLinks(cat.id, linkIdx, linkIdx - 1)} label={`Move ${link.label} up`} />
                  <ArrowBtn dir="down" disabled={linkIdx === catLinks.length - 1} onClick={() => onReorderLinks(cat.id, linkIdx, linkIdx + 1)} label={`Move ${link.label} down`} />
                  {confirmDeleteLink === link.id ? (
                    <span className="text-xs text-vd-text-secondary flex items-center gap-1">
                      <button onClick={() => { onRemoveLink(link.id); setConfirmDeleteLink(null) }} className="text-vd-error hover:underline bg-transparent border-none cursor-pointer text-xs" aria-label={`Confirm delete ${link.label}`}>Yes</button>
                      <button onClick={() => setConfirmDeleteLink(null)} className="text-vd-text-dim hover:underline bg-transparent border-none cursor-pointer text-xs" aria-label="Cancel delete">No</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDeleteLink(link.id)} className="text-vd-text-dim hover:text-vd-error text-xs bg-transparent border-none cursor-pointer" aria-label={`Delete ${link.label}`}>×</button>
                  )}
                </div>
              ))}

              {/* Add link */}
              {addingLinkCat === cat.id ? (
                <AddLinkForm
                  onAdd={link => { onAddLink({ ...link, categoryId: cat.id, order: catLinks.length }); setAddingLinkCat(null) }}
                  onCancel={() => setAddingLinkCat(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingLinkCat(cat.id)}
                  className="text-xs text-vd-accent hover:underline mt-1 pl-2 bg-transparent border-none cursor-pointer font-body"
                  aria-label={`Add link to ${cat.label}`}
                >
                  + Add link
                </button>
              )}
            </div>
          )
        })}

        {/* Add category */}
        {addingCategory ? (
          <AddCategoryForm onAdd={label => { onAddCategory(label); setAddingCategory(false) }} onCancel={() => setAddingCategory(false)} />
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="text-xs text-vd-accent hover:underline pl-2 bg-transparent border-none cursor-pointer font-body"
            aria-label="Add category"
          >
            + Add category
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ── */

function ArrowBtn({ dir, disabled, onClick, label }: { dir: 'up' | 'down'; disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-[10px] text-vd-text-dim hover:text-vd-text-primary disabled:opacity-25 bg-transparent border-none cursor-pointer disabled:cursor-default px-0.5"
    >
      {dir === 'up' ? '↑' : '↓'}
    </button>
  )
}

function CategoryRenameInput({ initial, onCommit, onCancel }: { initial: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(initial)
  return (
    <input
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => val.trim() ? onCommit(val.trim()) : onCancel()}
      onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onCommit(val.trim()); if (e.key === 'Escape') onCancel() }}
      className="flex-1 text-[0.65rem] font-body font-medium tracking-[0.1em] uppercase bg-vd-surface border border-vd-border text-vd-text-primary rounded px-1 py-0.5 focus:border-vd-accent outline-none"
      aria-label="Category name"
    />
  )
}

function AddLinkForm({ onAdd, onCancel }: { onAdd: (link: { label: string; url: string; icon?: string }) => void; onCancel: () => void }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!label.trim() || !url.trim()) return
    try { new URL(url) } catch { setError('Invalid URL'); return }
    onAdd({ label: label.trim(), url: url.trim(), icon: icon.trim() || undefined })
  }

  return (
    <div className="mt-1 pl-2 space-y-1">
      <input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} className="w-full text-xs bg-vd-surface border border-vd-border text-vd-text-primary rounded px-2 py-1 focus:border-vd-accent outline-none font-body" aria-label="Link label" />
      <input placeholder="URL" value={url} onChange={e => { setUrl(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && submit()} className="w-full text-xs bg-vd-surface border border-vd-border text-vd-text-primary rounded px-2 py-1 focus:border-vd-accent outline-none font-body" aria-label="Link URL" />
      {error && <span className="text-[10px] text-vd-error">{error}</span>}
      <div className="flex items-center gap-1">
        <input placeholder="Icon" value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} className="w-8 text-xs text-center bg-vd-surface border border-vd-border text-vd-text-primary rounded px-1 py-1 focus:border-vd-accent outline-none" aria-label="Link icon" />
        <button onClick={submit} className="text-xs text-vd-accent hover:underline bg-transparent border-none cursor-pointer" aria-label="Add link">Add ✓</button>
        <button onClick={onCancel} className="text-xs text-vd-text-dim hover:underline bg-transparent border-none cursor-pointer" aria-label="Cancel add link">Cancel</button>
      </div>
    </div>
  )
}

function AddCategoryForm({ onAdd, onCancel }: { onAdd: (label: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex items-center gap-1 pl-2">
      <input
        autoFocus
        placeholder="Category name"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onAdd(val.trim()); if (e.key === 'Escape') onCancel() }}
        className="flex-1 text-xs bg-vd-surface border border-vd-border text-vd-text-primary rounded px-2 py-1 focus:border-vd-accent outline-none font-body"
        aria-label="New category name"
      />
      <button onClick={() => val.trim() && onAdd(val.trim())} className="text-xs text-vd-accent hover:underline bg-transparent border-none cursor-pointer" aria-label="Add category">Add ✓</button>
      <button onClick={onCancel} className="text-xs text-vd-text-dim hover:underline bg-transparent border-none cursor-pointer" aria-label="Cancel add category">Cancel</button>
    </div>
  )
}
