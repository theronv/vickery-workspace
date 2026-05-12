import React, { createContext, useContext } from 'react'
import { useWorkspaceTools, type WorkspaceTool } from '../hooks/useWorkspaceTools'

interface WorkspaceToolsState {
  tools: WorkspaceTool[]
  addTool: (tool: Omit<WorkspaceTool, 'id' | 'order'>) => void
  updateTool: (id: string, patch: Partial<WorkspaceTool>) => void
  removeTool: (id: string) => void
  reorderTools: (fromIndex: number, toIndex: number) => void
}

const WorkspaceToolsContext = createContext<WorkspaceToolsState | null>(null)

export function WorkspaceToolsProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspaceTools()
  return (
    <WorkspaceToolsContext.Provider value={value}>
      {children}
    </WorkspaceToolsContext.Provider>
  )
}

export function useTools() {
  const ctx = useContext(WorkspaceToolsContext)
  if (!ctx) throw new Error('useTools must be used within WorkspaceToolsProvider')
  return ctx
}
