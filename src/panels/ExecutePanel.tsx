import { useState, useEffect, useCallback } from 'react'
import { usePipeline } from '../context/PipelineContext'
import { useProjects, type Project } from '../hooks/useProjects'
import { useCardStates } from '../hooks/useCardStates'
import KanbanBoard from '../components/KanbanBoard'

export default function ExecutePanel() {
  const { activeProject } = usePipeline()
  const { projects, loading: projectsLoading } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Auto-select the active project or the most recent one
  useEffect(() => {
    if (activeProject?.id) {
      const found = projects.find((p) => p.id === activeProject.id)
      if (found) setSelectedProject(found)
    } else if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[projects.length - 1])
    }
  }, [activeProject, projects]) // eslint-disable-line react-hooks/exhaustive-deps

  const { cardStates, loading: cardsLoading, toggleStep, updateCardState } = useCardStates(selectedProject?.id)

  const handleStatusChange = useCallback((cardId: string, status: 'todo' | 'in-progress' | 'done') => {
    updateCardState(cardId, { status })
  }, [updateCardState])

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-vd-text-dim font-mono text-sm">Loading projects...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl">🚀</div>
        <h2 className="font-display text-xl font-bold text-vd-text-primary">No projects yet</h2>
        <p className="text-sm text-vd-text-secondary max-w-md text-center">
          Score an idea in VET, then create prompts in BUILD to start your first project.
          Projects appear here once you click "Start Build".
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project selector */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-vd-border bg-vd-surface">
        <label className="text-xs text-vd-text-dim font-mono">PROJECT:</label>
        <select
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const p = projects.find((p) => p.id === e.target.value)
            if (p) setSelectedProject(p)
          }}
          className="bg-vd-bg border border-vd-border rounded px-3 py-1.5 text-sm text-vd-text-primary outline-none focus:border-vd-accent"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.verdict ? `(${p.verdict})` : ''}
            </option>
          ))}
        </select>
        {selectedProject && (
          <span className="text-xs text-vd-text-dim">
            Score: {selectedProject.score ?? '–'}/12
          </span>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        {cardsLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-vd-text-dim font-mono text-sm">Loading...</span>
          </div>
        ) : (
          <KanbanBoard
            cardStates={cardStates}
            onToggleStep={toggleStep}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  )
}
