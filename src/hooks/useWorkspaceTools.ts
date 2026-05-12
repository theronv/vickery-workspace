import { useState, useCallback } from 'react'

export type PanelComponent = 'vet' | 'build' | 'execute' | 'cli' | 'angel' | 'angel-web'

export interface WorkspaceTool {
  id: string
  label: string
  type: 'internal' | 'iframe'
  panelComponent?: PanelComponent
  url?: string
  icon?: string
  order: number
  showInBar: boolean
  showInSidebar: boolean
}

export const DEFAULT_TOOLS: WorkspaceTool[] = [
  { id: 'vet',       label: 'Idea Analyzer', type: 'internal', panelComponent: 'vet',       order: 0, showInBar: true, showInSidebar: true },
  { id: 'build',     label: 'PromptCraft',   type: 'internal', panelComponent: 'build',     order: 1, showInBar: true, showInSidebar: true },
  { id: 'execute',   label: 'Kanban',        type: 'internal', panelComponent: 'execute',   order: 2, showInBar: true, showInSidebar: true },
  { id: 'cli',       label: 'vd-cli',        type: 'internal', panelComponent: 'cli',       order: 3, showInBar: true, showInSidebar: true },
  { id: 'angel',     label: 'Angel Team',    type: 'internal', panelComponent: 'angel',     order: 4, showInBar: true, showInSidebar: true },
  { id: 'angel-web', label: 'Angel Web',     type: 'internal', panelComponent: 'angel-web', order: 5, showInBar: true, showInSidebar: true },
]

const STORAGE_KEY = 'vd:workspace-tools'

function load(): WorkspaceTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOOLS))
  return DEFAULT_TOOLS
}

function save(tools: WorkspaceTool[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
}

export function useWorkspaceTools() {
  const [tools, setTools] = useState<WorkspaceTool[]>(load)

  const update = useCallback((fn: (t: WorkspaceTool[]) => WorkspaceTool[]) => {
    setTools(prev => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const addTool = useCallback((tool: Omit<WorkspaceTool, 'id' | 'order'>) => {
    update(t => {
      const maxOrder = t.reduce((m, x) => Math.max(m, x.order), -1)
      return [...t, { ...tool, id: crypto.randomUUID().slice(0, 8), order: maxOrder + 1 }]
    })
  }, [update])

  const updateTool = useCallback((id: string, patch: Partial<WorkspaceTool>) => {
    update(t => t.map(x => x.id === id ? { ...x, ...patch } : x))
  }, [update])

  const removeTool = useCallback((id: string) => {
    update(t => t.filter(x => x.id !== id))
  }, [update])

  const reorderTools = useCallback((fromIndex: number, toIndex: number) => {
    update(t => {
      const sorted = [...t].sort((a, b) => a.order - b.order)
      const [moved] = sorted.splice(fromIndex, 1)
      sorted.splice(toIndex, 0, moved)
      return sorted.map((x, i) => ({ ...x, order: i }))
    })
  }, [update])

  return {
    tools: [...tools].sort((a, b) => a.order - b.order),
    addTool,
    updateTool,
    removeTool,
    reorderTools,
  }
}
