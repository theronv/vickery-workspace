import { useEffect, useRef } from 'react'
import { usePipeline } from '../context/PipelineContext'
import InstructionBanner from '../components/InstructionBanner'
import ideaAnalyzerHtml from '../tools/idea-analyzer.html?raw'

export default function VetPanel() {
  const { setActiveProject, setActivePanel, showToast } = usePipeline()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'vd:verdict') {
        const { verdict, appName, description, score } = e.data
        setActiveProject({
          name: appName || '',
          description: description || '',
          score: score ?? null,
          verdict: verdict ?? null,
        })

        if (verdict === 'SHIP IT') {
          showToast('SHIP IT — moving to PromptCraft')
          setTimeout(() => setActivePanel('build'), 1500)
        } else if (verdict === 'WATCH') {
          showToast(`WATCH (${score}/12) — review before proceeding`)
        } else {
          showToast(`LATER (${score}/12) — idea needs more work`)
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setActiveProject, setActivePanel, showToast])

  return (
    <div className="flex flex-col h-full">
      <InstructionBanner
        step={1}
        title="VET THE IDEA"
        subtitle="Score ≥10 to proceed. SHIP IT verdicts move to PromptCraft automatically."
        details={[
          'Problem Clarity · Completion · Market Signal · Monetization (1–3 each)',
          'SHIP IT ≥10 · WATCH 7–9 · LATER ≤6',
          'A LATER verdict with clear reasoning is more useful than a WATCH',
        ]}
      />
      <iframe
        ref={iframeRef}
        srcDoc={ideaAnalyzerHtml}
        className="flex-1 w-full border-none"
        title="Idea Feasibility Analyzer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
