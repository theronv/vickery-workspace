import React, { createContext, useContext, useState } from 'react'

export type PanelId = 'vet' | 'build' | 'execute' | 'cli' | 'angel'

export interface ActiveProject {
  id?: string
  name: string
  description: string
  score: number | null
  verdict: 'SHIP IT' | 'WATCH' | 'LATER' | null
  mvpPrompt?: string
}

interface PipelineState {
  activePanel: PanelId
  setActivePanel: (panel: PanelId) => void
  activeProject: ActiveProject | null
  setActiveProject: (project: ActiveProject | null) => void
  toast: string | null
  showToast: (msg: string) => void
}

const PipelineContext = createContext<PipelineState | null>(null)

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelId>('vet')
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <PipelineContext.Provider value={{
      activePanel, setActivePanel,
      activeProject, setActiveProject,
      toast, showToast,
    }}>
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipeline() {
  const ctx = useContext(PipelineContext)
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider')
  return ctx
}
