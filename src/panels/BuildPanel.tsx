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
  const hasSentPrefill = useRef(false)

  // Pre-fill the iframe with project data from Panel 1
  useEffect(() => {
    if (!activeProject?.name || !iframeRef.current) return

    const iframe = iframeRef.current
    const sendPrefill = () => {
      if (hasSentPrefill.current) return
      iframe.contentWindow?.postMessage({
        type: 'vd:prefill',
        appName: activeProject.name,
        // Use the mvpPrompt as description if available, otherwise fall back to description
        description: activeProject.mvpPrompt || activeProject.description,
      }, '*')
      hasSentPrefill.current = true
    }

    // Send on load and also try immediately
    iframe.addEventListener('load', sendPrefill)
    // Small delay to ensure iframe JS has initialized
    const timer = setTimeout(sendPrefill, 500)

    return () => {
      iframe.removeEventListener('load', sendPrefill)
      clearTimeout(timer)
    }
  }, [activeProject])

  // Reset prefill flag when project changes
  useEffect(() => {
    hasSentPrefill.current = false
  }, [activeProject?.name])

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
        subtitle="Your MVP prompt from VET is pre-loaded. Generate all 6 Lovable prompts, then copy each into Lovable in order."
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
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-vd-border bg-vd-surface">
        <div className="text-sm text-vd-text-secondary">
          {activeProject ? (
            <span>Project: <span className="text-vd-text-primary font-medium">{activeProject.name}</span>
              {activeProject.verdict && (
                <span className={`ml-2 text-xs ${activeProject.verdict === 'SHIP IT' ? 'text-vd-success' : activeProject.verdict === 'WATCH' ? 'text-vd-warning' : 'text-vd-error'}`}>
                  {activeProject.verdict} ({activeProject.score}/12)
                </span>
              )}
            </span>
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
