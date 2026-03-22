import { useEffect, useRef, useCallback } from 'react'
import { usePipeline } from '../context/PipelineContext'
import { useAuth } from '../context/AuthContext'
import InstructionBanner from '../components/InstructionBanner'
import lovableImproverHtml from '../tools/lovable-improver.html?raw'

const API_BASE = import.meta.env.VITE_API_URL || 'https://workspace-api.vercel.app'

export default function BuildPanel() {
  const { activeProject, setActiveProject, setActivePanel, showToast } = usePipeline()
  const { token } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Try to pre-fill the iframe when it loads and we have project data
  useEffect(() => {
    if (!activeProject?.name || !iframeRef.current) return

    const iframe = iframeRef.current
    const handleLoad = () => {
      iframe.contentWindow?.postMessage({
        type: 'vd:prefill',
        appName: activeProject.name,
        description: activeProject.description,
      }, '*')
    }

    iframe.addEventListener('load', handleLoad)
    // Also try immediately in case iframe already loaded
    handleLoad()

    return () => iframe.removeEventListener('load', handleLoad)
  }, [activeProject])

  const handleStartBuild = useCallback(async () => {
    if (!activeProject) {
      showToast('Score an idea in VET first')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: activeProject.name,
          bundleId: `com.vickerydigital.${activeProject.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          score: activeProject.score,
          verdict: activeProject.verdict,
        }),
      })

      if (!res.ok) throw new Error('Failed to create project')

      const project = await res.json()
      setActiveProject({ ...activeProject, id: project.id })
      showToast('Project created — moving to Execute')
      setTimeout(() => setActivePanel('execute'), 800)
    } catch (err) {
      showToast('Failed to create project')
      console.error(err)
    }
  }, [activeProject, token, setActiveProject, setActivePanel, showToast])

  return (
    <div className="flex flex-col h-full">
      <InstructionBanner
        step={2}
        title="CREATE PROMPTS"
        subtitle="Select the build mode, enter app details, generate all 6 prompts. Copy each prompt into Claude Code in order."
        details={[
          'Mode 🌿 New App → Lovable P1–P6 (scaffold PWA first)',
          'Mode 🔧 Improve → Lovable polish chain',
          'Mode ⚡ Claude Code → Native migration P1–P6',
        ]}
      />
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          srcDoc={lovableImproverHtml}
          className="w-full h-full border-none"
          title="PromptCraft"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-vd-border bg-vd-surface">
        <div className="text-sm text-vd-text-secondary">
          {activeProject ? (
            <span>Project: <span className="text-vd-text-primary font-medium">{activeProject.name}</span></span>
          ) : (
            <span className="text-vd-text-dim">No project loaded — score an idea in VET first</span>
          )}
        </div>
        <button
          onClick={handleStartBuild}
          disabled={!activeProject}
          className="px-5 py-2 bg-vd-accent text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Build →
        </button>
      </div>
    </div>
  )
}
